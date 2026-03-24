# MoveMarket

A marketplace for people moving in or out of cities. Sellers list furniture and household items they can't take with them; buyers arriving in a new city find exactly what they need. Listings can be grouped into bundles with a discount, and a Move Board lets people announce their moves and get matched with each other.

## Features

- **Listings** — browse, create, edit, and delete items with filters for city, category, condition, and price range; mark listings as urgent with a move-out date
- **Bundles** — group your own listings into a bundle with a percentage discount
- **Move Board** — announce you're moving in or out with dates, cities, categories you want, and a budget
- **Move Matches** — automatically matched with moving_out announcements in the same city when you post a moving_in announcement
- **Messaging** — per-conversation threaded messages between users
- **Saved listings** — heart icon on any listing card
- **Dashboard** — stats, move matches, quick actions, your listings, saved items
- **Profile** — editable profile with tabs for your listings, bundles, and saved items
- **Map view** — radius-based location filter with pin on create forms (Leaflet)

## Tech stack

| Layer | Technology |
|---|---|
| Backend | FastAPI 0.104, SQLAlchemy 2.0, SQLite, Python 3.11+ |
| Auth | JWT (7-day tokens via python-jose), bcrypt passwords |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Maps | Leaflet + react-leaflet |
| HTTP client | Axios |

## Local development

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`. Vite proxies `/api` requests to the backend.

## Project structure

```
.
├── backend/
│   ├── main.py            # FastAPI app, CORS, startup migrations
│   ├── models.py          # SQLAlchemy ORM models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── auth.py            # JWT helpers
│   ├── database.py        # Engine + session setup
│   ├── routes/
│   │   ├── auth.py        # /api/auth — register, login
│   │   ├── users.py       # /api/users — profile CRUD
│   │   ├── listings.py    # /api/listings — full CRUD + filters
│   │   ├── bundles.py     # /api/bundles — bundle CRUD
│   │   ├── moves.py       # /api/moves — move announcements + matching
│   │   ├── messages.py    # /api/messages — conversations + messages
│   │   └── uploads.py     # /api/uploads — image upload
│   ├── uploads/           # Uploaded images (local dev only)
│   └── movemarket.db      # SQLite database (local dev only)
└── frontend/
    └── src/
        ├── App.tsx         # Routes
        ├── api.ts          # All Axios API calls
        ├── types.ts        # Shared TypeScript types
        ├── pages/          # Page-level components
        └── components/     # Shared UI components
```

## Environment variables

The backend reads these from the environment (or a `.env` file). In local dev, defaults are used — set these for any deployed environment.

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | JWT signing key — change this in production | hardcoded dev value |
| `DATABASE_URL` | SQLAlchemy DB URL | SQLite file next to `database.py` |
| `S3_BUCKET` | S3 bucket name for image uploads | — (uses local disk if unset) |
| `AWS_REGION` | AWS region for S3 | `us-east-1` |

## Deploying to AWS

See [`infra/`](infra/) for Terraform that provisions a single EC2 instance (nginx + uvicorn), an EBS volume for the database, and an S3 bucket for image uploads. Read [`infra/README.md`](infra/README.md) before applying.
