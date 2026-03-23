from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes import auth, users, listings, bundles, moves, messages

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

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(listings.router, prefix="/api/listings", tags=["listings"])
app.include_router(bundles.router, prefix="/api/bundles", tags=["bundles"])
app.include_router(moves.router, prefix="/api/moves", tags=["moves"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "MoveMarket API", "docs": "/docs"}
