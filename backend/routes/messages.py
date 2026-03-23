from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, and_, func, case
from sqlalchemy.orm import Session

from database import get_db
from models import Message, User
from schemas import MessageCreate, MessageResponse, ConversationResponse
from auth import get_current_user

router = APIRouter()


@router.get("/conversations", response_model=list[ConversationResponse])
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get the other_user_id for each conversation
    other_user_id = case(
        (Message.sender_id == current_user.id, Message.receiver_id),
        else_=Message.sender_id,
    )

    # Subquery: for each conversation partner, get max message id
    subq = (
        db.query(
            other_user_id.label("other_user_id"),
            func.max(Message.id).label("last_message_id"),
            func.sum(
                case(
                    (and_(Message.receiver_id == current_user.id, Message.is_read == False), 1),
                    else_=0,
                )
            ).label("unread_count"),
        )
        .filter(
            or_(
                Message.sender_id == current_user.id,
                Message.receiver_id == current_user.id,
            )
        )
        .group_by(other_user_id)
        .all()
    )

    conversations = []
    for row in subq:
        other_user = db.query(User).filter(User.id == row.other_user_id).first()
        last_message = db.query(Message).filter(Message.id == row.last_message_id).first()
        if other_user and last_message:
            conversations.append(
                ConversationResponse(
                    other_user=other_user,
                    last_message=last_message,
                    unread_count=int(row.unread_count or 0),
                )
            )

    # Sort by last message time descending
    conversations.sort(key=lambda c: c.last_message.created_at, reverse=True)
    return conversations


@router.get("/{user_id}", response_model=list[MessageResponse])
def get_messages_with_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    other_user = db.query(User).filter(User.id == user_id).first()
    if not other_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
                and_(Message.sender_id == user_id, Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    # Mark received messages as read
    db.query(Message).filter(
        Message.sender_id == user_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()

    return messages


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    message_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    receiver = db.query(User).filter(User.id == message_in.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receiver not found")
    if message_in.receiver_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot message yourself")

    message = Message(
        sender_id=current_user.id,
        receiver_id=message_in.receiver_id,
        listing_id=message_in.listing_id,
        content=message_in.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
