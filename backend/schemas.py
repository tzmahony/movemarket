from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


# --- User ---

class UserCreate(BaseModel):
    email: str
    password: str
    name: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    move_type: Optional[str] = None
    move_date: Optional[date] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    city: Optional[str] = None
    move_type: Optional[str] = None
    move_date: Optional[date] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime


# --- Token ---

class Token(BaseModel):
    access_token: str
    token_type: str


# --- Listing ---

class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    category: str
    condition: str
    city: str
    image_url: Optional[str] = None
    urgent: bool = False
    move_out_date: Optional[date] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    city: Optional[str] = None
    image_url: Optional[str] = None
    urgent: Optional[bool] = None
    move_out_date: Optional[date] = None
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: str
    price: float
    category: str
    condition: str
    city: str
    image_url: Optional[str] = None
    status: str
    urgent: bool
    move_out_date: Optional[date] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    user: UserResponse
    is_saved: bool = False


# --- Bundle ---

class BundleCreate(BaseModel):
    title: str
    description: str
    discount_percentage: int = 10
    city: str
    listing_ids: list[int]
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class BundleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    description: str
    discount_percentage: int
    city: str
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    listings: list[ListingResponse]
    total_price: float
    discounted_price: float
    user: UserResponse


# --- Move ---

class MoveCreate(BaseModel):
    move_type: str
    from_city: Optional[str] = None
    to_city: Optional[str] = None
    move_date: date
    message: Optional[str] = None
    looking_for: Optional[str] = None
    budget_range: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class MoveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    move_type: str
    from_city: Optional[str] = None
    to_city: Optional[str] = None
    move_date: date
    message: Optional[str] = None
    looking_for: Optional[str] = None
    budget_range: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    user: UserResponse


# --- Message ---

class MessageCreate(BaseModel):
    receiver_id: int
    content: str
    listing_id: Optional[int] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    receiver_id: int
    listing_id: Optional[int] = None
    content: str
    is_read: bool
    created_at: datetime
    sender: UserResponse
    receiver: UserResponse


class ConversationResponse(BaseModel):
    other_user: UserResponse
    last_message: MessageResponse
    unread_count: int
