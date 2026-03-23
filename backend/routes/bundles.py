import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Bundle, Listing, User
from schemas import BundleCreate, BundleResponse, ListingResponse
from auth import get_current_user, optional_current_user

router = APIRouter()


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


def _bundle_to_response(bundle: Bundle, current_user: Optional[User], db: Session) -> BundleResponse:
    from routes.listings import _listing_to_response

    listing_responses = [_listing_to_response(l, current_user, db) for l in bundle.listings]
    total_price = sum(l.price for l in bundle.listings)
    discounted_price = round(total_price * (1 - bundle.discount_percentage / 100), 2)

    return BundleResponse(
        id=bundle.id,
        user_id=bundle.user_id,
        title=bundle.title,
        description=bundle.description,
        discount_percentage=bundle.discount_percentage,
        city=bundle.city,
        image_url=bundle.image_url,
        latitude=bundle.latitude,
        longitude=bundle.longitude,
        created_at=bundle.created_at,
        listings=listing_responses,
        total_price=total_price,
        discounted_price=discounted_price,
        user=bundle.user,
    )


@router.get("/", response_model=list[BundleResponse])
def list_bundles(
    city: Optional[str] = None,
    search: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: Optional[User] = Depends(optional_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Bundle)
    if city and lat is None:
        query = query.filter(Bundle.city.ilike(f"%{city}%"))
    if search:
        query = query.filter(Bundle.title.ilike(f"%{search}%"))
    if lat is not None and lng is not None and radius_km is not None:
        delta_lat = radius_km / 111.0
        delta_lng = radius_km / (111.0 * math.cos(math.radians(lat)))
        query = query.filter(
            Bundle.latitude.isnot(None),
            Bundle.longitude.isnot(None),
            Bundle.latitude.between(lat - delta_lat, lat + delta_lat),
            Bundle.longitude.between(lng - delta_lng, lng + delta_lng),
        )
        candidates = query.order_by(Bundle.created_at.desc()).all()
        candidates = [c for c in candidates if _haversine_km(lat, lng, c.latitude, c.longitude) <= radius_km]
        page = candidates[skip: skip + limit]
        return [_bundle_to_response(b, current_user, db) for b in page]
    bundles = query.order_by(Bundle.created_at.desc()).offset(skip).limit(limit).all()
    return [_bundle_to_response(b, current_user, db) for b in bundles]


@router.post("/", response_model=BundleResponse, status_code=status.HTTP_201_CREATED)
def create_bundle(
    bundle_in: BundleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listings = db.query(Listing).filter(Listing.id.in_(bundle_in.listing_ids)).all()
    if len(listings) != len(bundle_in.listing_ids):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Some listings not found")
    for listing in listings:
        if listing.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Listing {listing.id} does not belong to you",
            )
        if listing.status != "available":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Listing {listing.id} is not available",
            )
    bundle = Bundle(
        user_id=current_user.id,
        title=bundle_in.title,
        description=bundle_in.description,
        discount_percentage=bundle_in.discount_percentage,
        city=bundle_in.city,
        image_url=bundle_in.image_url,
    )
    bundle.listings = listings
    db.add(bundle)
    db.commit()
    db.refresh(bundle)
    return _bundle_to_response(bundle, current_user, db)


@router.get("/{bundle_id}", response_model=BundleResponse)
def get_bundle(
    bundle_id: int,
    current_user: Optional[User] = Depends(optional_current_user),
    db: Session = Depends(get_db),
):
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bundle not found")
    return _bundle_to_response(bundle, current_user, db)


@router.delete("/{bundle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bundle(
    bundle_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bundle = db.query(Bundle).filter(Bundle.id == bundle_id).first()
    if not bundle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bundle not found")
    if bundle.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the owner")
    db.delete(bundle)
    db.commit()
