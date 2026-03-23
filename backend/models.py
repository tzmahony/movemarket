from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, Date, DateTime,
    ForeignKey, Table, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from database import Base


bundle_listings = Table(
    "bundle_listings",
    Base.metadata,
    Column("bundle_id", Integer, ForeignKey("bundles.id"), primary_key=True),
    Column("listing_id", Integer, ForeignKey("listings.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=True)
    move_type = Column(String(20), nullable=True)
    move_date = Column(Date, nullable=True)
    bio = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("Listing", back_populates="user")
    bundles = relationship("Bundle", back_populates="user")
    move_announcements = relationship("MoveAnnouncement", back_populates="user")
    saved_listings = relationship("SavedListing", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    condition = Column(String(20), nullable=False)
    city = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=True)
    status = Column(String(20), default="available")
    urgent = Column(Boolean, default=False)
    move_out_date = Column(Date, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="listings")


class Bundle(Base):
    __tablename__ = "bundles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    discount_percentage = Column(Integer, default=10)
    city = Column(String(100), nullable=False)
    image_url = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bundles")
    listings = relationship("Listing", secondary=bundle_listings)


class MoveAnnouncement(Base):
    __tablename__ = "move_announcements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    move_type = Column(String(20), nullable=False)
    from_city = Column(String(100), nullable=True)
    to_city = Column(String(100), nullable=True)
    move_date = Column(Date, nullable=False)
    message = Column(Text, nullable=True)
    looking_for = Column(String(500), nullable=True)
    budget_range = Column(String(50), nullable=True)
    image_url = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="move_announcements")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    listing = relationship("Listing")


class SavedListing(Base):
    __tablename__ = "saved_listings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "listing_id"),)

    user = relationship("User", back_populates="saved_listings")
    listing = relationship("Listing")
