from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import Listing, SavedListing, User
from schemas import ListingCreate, ListingUpdate, ListingResponse
from auth import get_current_user, optional_current_user

router = APIRouter()


def _listing_to_response(listing: Listing, current_user: Optional[User], db: Session) -> dict:
    is_saved = False
    if current_user:
        saved = (
            db.query(SavedListing)
            .filter(SavedListing.user_id == current_user.id, SavedListing.listing_id == listing.id)
            .first()
        )
        is_saved = saved is not None
    return ListingResponse.model_validate(listing, from_attributes=True).model_copy(
        update={"is_saved": is_saved}
    )


@router.get("/", response_model=list[ListingResponse])
def list_listings(
    city: Optional[str] = None,
    category: Optional[str] = None,
    condition: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = Query("available", alias="status"),
    skip: int = 0,
    limit: int = 20,
    current_user: Optional[User] = Depends(optional_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Listing)
    if status_filter:
        query = query.filter(Listing.status == status_filter)
    if city:
        query = query.filter(Listing.city.ilike(f"%{city}%"))
    if category:
        query = query.filter(Listing.category == category)
    if condition:
        query = query.filter(Listing.condition == condition)
    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)
    if search:
        query = query.filter(
            or_(
                Listing.title.ilike(f"%{search}%"),
                Listing.description.ilike(f"%{search}%"),
            )
        )
    query = query.order_by(Listing.urgent.desc(), Listing.created_at.desc())
    listings = query.offset(skip).limit(limit).all()
    return [_listing_to_response(l, current_user, db) for l in listings]


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = Listing(**listing_in.model_dump(), user_id=current_user.id)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return _listing_to_response(listing, current_user, db)


@router.get("/saved/me", response_model=list[ListingResponse])
def get_saved_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saved = (
        db.query(SavedListing)
        .filter(SavedListing.user_id == current_user.id)
        .all()
    )
    listing_ids = [s.listing_id for s in saved]
    if not listing_ids:
        return []
    listings = db.query(Listing).filter(Listing.id.in_(listing_ids)).all()
    return [_listing_to_response(l, current_user, db) for l in listings]


@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(
    listing_id: int,
    current_user: Optional[User] = Depends(optional_current_user),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return _listing_to_response(listing, current_user, db)


@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_in: ListingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the owner")
    update_data = listing_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(listing, key, value)
    db.commit()
    db.refresh(listing)
    return _listing_to_response(listing, current_user, db)


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the owner")
    db.delete(listing)
    db.commit()


@router.post("/{listing_id}/save")
def save_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    existing = (
        db.query(SavedListing)
        .filter(SavedListing.user_id == current_user.id, SavedListing.listing_id == listing_id)
        .first()
    )
    if not existing:
        saved = SavedListing(user_id=current_user.id, listing_id=listing_id)
        db.add(saved)
        db.commit()
    return {"saved": True}


@router.delete("/{listing_id}/save")
def unsave_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    saved = (
        db.query(SavedListing)
        .filter(SavedListing.user_id == current_user.id, SavedListing.listing_id == listing_id)
        .first()
    )
    if saved:
        db.delete(saved)
        db.commit()
    return {"saved": False}
