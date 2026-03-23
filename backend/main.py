from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from database import engine, Base
from routes import auth, users, listings, bundles, moves, messages
from routes import uploads

app = FastAPI(
    title="MoveMarket API",
    description="E-commerce platform for people moving in/out of cities",
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images
_uploads_dir = Path(__file__).parent / "uploads"
_uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(_uploads_dir)), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(listings.router, prefix="/api/listings", tags=["listings"])
app.include_router(bundles.router, prefix="/api/bundles", tags=["bundles"])
app.include_router(moves.router, prefix="/api/moves", tags=["moves"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Add new columns to existing databases without losing data
    migrations = [
        "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500)",
        "ALTER TABLE bundles ADD COLUMN image_url VARCHAR(500)",
        "ALTER TABLE move_announcements ADD COLUMN image_url VARCHAR(500)",
        "ALTER TABLE listings ADD COLUMN latitude REAL",
        "ALTER TABLE listings ADD COLUMN longitude REAL",
        "ALTER TABLE bundles ADD COLUMN latitude REAL",
        "ALTER TABLE bundles ADD COLUMN longitude REAL",
        "ALTER TABLE move_announcements ADD COLUMN latitude REAL",
        "ALTER TABLE move_announcements ADD COLUMN longitude REAL",
    ]
    with engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                pass  # Column already exists


@app.get("/")
def root():
    return {"message": "MoveMarket API", "docs": "/docs"}
