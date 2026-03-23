import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User

router = APIRouter()

UPLOADS_DIR = Path(__file__).parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, GIF, and WebP images are allowed.")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "File too large. Maximum 5 MB.")

    suffix = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if suffix not in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
        suffix = ".jpg"

    filename = f"{uuid.uuid4()}{suffix}"
    (UPLOADS_DIR / filename).write_bytes(content)

    return {"url": f"/uploads/{filename}"}
