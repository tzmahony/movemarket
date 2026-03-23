import math
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from database import get_db
from models import MoveAnnouncement, User
from schemas import MoveCreate, MoveResponse
from auth import get_current_user

router = APIRouter()


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.asin(math.sqrt(a))


@router.get("/", response_model=list[MoveResponse])
def list_moves(
    city: Optional[str] = None,
    move_type: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(MoveAnnouncement)
    if city and lat is None:
        query = query.filter(
            or_(
                MoveAnnouncement.to_city.ilike(f"%{city}%"),
                MoveAnnouncement.from_city.ilike(f"%{city}%"),
            )
        )
    if move_type:
        query = query.filter(MoveAnnouncement.move_type == move_type)
    if lat is not None and lng is not None and radius_km is not None:
        delta_lat = radius_km / 111.0
        delta_lng = radius_km / (111.0 * math.cos(math.radians(lat)))
        query = query.filter(
            MoveAnnouncement.latitude.isnot(None),
            MoveAnnouncement.longitude.isnot(None),
            MoveAnnouncement.latitude.between(lat - delta_lat, lat + delta_lat),
            MoveAnnouncement.longitude.between(lng - delta_lng, lng + delta_lng),
        )
        candidates = query.order_by(MoveAnnouncement.move_date.asc()).all()
        candidates = [c for c in candidates if _haversine_km(lat, lng, c.latitude, c.longitude) <= radius_km]
        page = candidates[skip: skip + limit]
        return page
    moves = query.order_by(MoveAnnouncement.move_date.asc()).offset(skip).limit(limit).all()
    return moves


@router.post("/", response_model=MoveResponse, status_code=status.HTTP_201_CREATED)
def create_move(
    move_in: MoveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    move = MoveAnnouncement(**move_in.model_dump(), user_id=current_user.id)
    db.add(move)
    db.commit()
    db.refresh(move)
    return move


@router.get("/matches", response_model=list[MoveResponse])
def get_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(MoveAnnouncement).filter(MoveAnnouncement.user_id != current_user.id)

    if current_user.move_type == "moving_in":
        query = query.filter(MoveAnnouncement.move_type == "moving_out")
        if current_user.city:
            query = query.filter(
                or_(
                    MoveAnnouncement.to_city.ilike(f"%{current_user.city}%"),
                    MoveAnnouncement.from_city.ilike(f"%{current_user.city}%"),
                )
            )
    elif current_user.move_type == "moving_out":
        query = query.filter(MoveAnnouncement.move_type == "moving_in")
        if current_user.city:
            query = query.filter(
                or_(
                    MoveAnnouncement.to_city.ilike(f"%{current_user.city}%"),
                    MoveAnnouncement.from_city.ilike(f"%{current_user.city}%"),
                )
            )
    else:
        return []

    return query.order_by(MoveAnnouncement.move_date.asc()).all()


@router.delete("/{move_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_move(
    move_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    move = db.query(MoveAnnouncement).filter(MoveAnnouncement.id == move_id).first()
    if not move:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Move announcement not found")
    if move.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not the owner")
    db.delete(move)
    db.commit()
