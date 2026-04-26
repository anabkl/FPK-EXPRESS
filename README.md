# FPK-EXPRESS

AI-powered preorder & pickup platform for FPK Khouribga students.

FPK-EXPRESS is a V1 MVP that helps students preorder affordable meals and pick them up without waiting in long food or coffee queues. It is built from real field-survey validation with 23 FPK Khouribga students and is designed to feel like a credible campus startup product, not a classroom mockup.

## Problem Statement

Students at FPK Khouribga lose valuable break time waiting in food and coffee queues. The lack of fast, affordable, and healthier alternatives creates stress, late arrivals, and skipped or low-quality meals.

## Survey Validation

- 23 students answered the questionnaire.
- More than 81% wait 15 minutes or more.
- Around 95% sometimes or often skip meals or eat badly.
- 100% are interested in a preorder service.
- 66.7% are willing to pay a small 1-2 MAD service fee.
- Main complaints: high prices, hygiene concerns, lack of healthy options, and limited service hours.

## Features

- Premium landing page with hero, survey stats, problem, solution, workflow, AI preview, and meal preview.
- Student side with meal list, search, category filters, preorder modal, pickup time, estimated wait, and confirmation.
- Student dashboard with order status: `Pending -> Preparing -> Ready`.
- Vendor dashboard with add meal form, menu management, order status updates, revenue cards, and Recharts analytics.
- AI-like services for popular meal recommendations, estimated waiting time, and peak-hour prediction.
- Seeded Moroccan/FPK sample meals priced from 5 MAD to 35 MAD.
- Mock student/vendor modes for a smooth V1 demo without authentication complexity.

## Architecture

```text
FPK-EXPRESS
├── frontend/      React + Vite + TailwindCSS + Framer Motion + Lucide + Recharts
├── backend/       FastAPI + SQLite + SQLAlchemy + Pydantic
├── docs/          roadmap and contribution docs
└── docker-compose.yml
```

The frontend calls the FastAPI backend through `VITE_API_URL`. If the API is unavailable, the frontend falls back to demo data so the presentation remains smooth.

## Tech Stack

Frontend:

- React
- Vite
- TailwindCSS
- Framer Motion
- Lucide React
- Recharts

Backend:

- Python FastAPI
- SQLite
- SQLAlchemy
- Pydantic
- CORS middleware

Deployment:

- Docker
- Docker Compose

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | API health check |
| GET | `/meals` | List meals with optional `category` and `search` |
| POST | `/meals` | Create a meal |
| GET | `/meals/{id}` | Get meal details |
| POST | `/orders` | Create preorder |
| GET | `/orders` | List orders |
| PATCH | `/orders/{id}/status` | Update order status |
| GET | `/dashboard/stats` | Vendor dashboard stats and chart data |
| GET | `/ai/recommendations` | AI-powered meal recommendations |
| GET | `/ai/peak-hours` | Peak-hour prediction data |

## Run Locally on macOS

Open two terminal windows from the project root.

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend: http://localhost:8000  
API Docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Screenshots

Add screenshots here after running the demo:

- `screenshots/landing-page.png`
- `screenshots/student-dashboard.png`
- `screenshots/vendor-dashboard.png`
- `screenshots/ai-insights.png`
- `screenshots/api-docs.png`

## Demo Flow

1. Open landing page.
2. Filter meals.
3. Place preorder.
4. Open vendor dashboard.
5. Change order status from `Pending` to `Ready`.
6. Show AI insights and analytics.

## Why This Is Not Just A School Project

- Validated problem: the MVP starts from field data, not assumptions.
- Real users: the survey reflects actual FPK Khouribga student behavior and pain points.
- Startup business model: 66.7% willingness to pay a 1-2 MAD fee supports a simple service-fee path.
- AI insights: recommendations, waiting-time estimation, and peak-hour prediction create operational value.
- Scalable architecture: React/Vite frontend, FastAPI backend, SQLite for V1, and Docker for repeatable deployment.

## Future Improvements

- Student accounts and vendor accounts.
- Real online payment or wallet balance in MAD.
- QR pickup confirmation.
- Vendor availability hours and stock limits.
- Hygiene score and verified vendor badges.
- Smarter recommendations based on budget, department schedule, and past orders.
- Push notifications when an order becomes ready.
- Admin dashboard for FPK entrepreneurship reporting.

## How To Present It To The Professor

1. Start with the validated problem and show the survey numbers.
2. Open the landing page and explain the value proposition in one sentence.
3. Switch to the student side, filter meals, place a preorder, and show the confirmation.
4. Switch to the vendor dashboard and change the order status from `Pending` to `Preparing` to `Ready`.
5. Show the charts and AI insights as the future-facing part of the MVP.
6. Close with the business model: a small 1-2 MAD service fee, vendor adoption, and campus expansion.

## Verification

Recommended checks before pushing:

```bash
cd frontend
npm run build
```

```bash
PYTHONPYCACHEPREFIX=/tmp/fpk-express-pycache python3 -m py_compile backend/app/*.py
```

```bash
docker compose config
```

## Dark Mode
Coming soon: dark mode support for better UX.

## Performance
FPK-EXPRESS is designed with a lightweight frontend, optimized API structure, and Docker-ready deployment workflow.
