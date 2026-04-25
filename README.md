# FPK Smart Food AI

Preorder & Pickup Platform for FPK Khouribga Students.

FPK Smart Food AI is a V1 MVP that helps students preorder affordable meals and pick them up without waiting in long lines. It is designed from real field-survey data collected from 23 FPK Khouribga students.

## Problem Statement

Students at FPK Khouribga struggle to find fast, affordable, and healthy meals because of long waiting lines and limited practical food alternatives. This wastes break time, creates stress, and sometimes pushes students to skip meals or eat badly.

## Survey Validation

- 23 students answered the questionnaire.
- More than 81% wait 15 minutes or more to buy food or coffee.
- Around 95% sometimes or often skip meals or eat badly to avoid being late.
- 100% are interested in a preorder service.
- 66.7% are willing to pay a small service fee of 1 to 2 MAD.
- Main complaints: high prices, hygiene concerns, lack of healthy options, limited service hours.

## Features

- Premium landing page with survey stats, problem, solution, workflow, AI preview, and meal preview.
- Student side with meal list, search, category filters, preorder modal, pickup time, estimated waiting time, and confirmation.
- Student dashboard with order status: `Pending -> Preparing -> Ready`.
- Vendor dashboard with add meal form, menu management, order status updates, revenue cards, and Recharts analytics.
- Simple AI services for meal recommendations, estimated waiting time, and peak-hour prediction.
- Seeded Moroccan/FPK sample meals priced from 5 MAD to 35 MAD.
- No authentication in V1; mock student/vendor modes keep the demo frictionless.

## Architecture

```text
FPK Smart Food AI
├── frontend/      React + Vite + TailwindCSS + Framer Motion + Lucide + Recharts
├── backend/       FastAPI + SQLite + SQLAlchemy + Pydantic
└── docker-compose.yml
```

The frontend calls the FastAPI backend through `VITE_API_URL`. If the API is not running yet, the frontend falls back to demo data so the presentation remains smooth.

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
| GET | `/ai/recommendations` | AI-like meal recommendations |
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

## Screenshots Placeholders

Add screenshots here after running the demo:

- `screenshots/landing-page.png`
- `screenshots/student-order-flow.png`
- `screenshots/vendor-dashboard.png`
- `screenshots/api-docs.png`

## Why This Solution Is Innovative

FPK Smart Food AI is not just a food menu. It turns campus break time into a predictable pickup system. The vendor sees demand earlier, students recover lost time, and the platform can learn which meals and hours create pressure. Even the V1 creates measurable value: shorter queues, better meal planning, and a small service-fee business model validated by the survey.

## Future Improvements

- Student accounts and vendor accounts.
- Real online payment or wallet balance in MAD.
- QR pickup confirmation.
- Vendor availability hours and stock limits.
- Hygiene score and verified vendor badges.
- Smarter recommendations based on budget, department schedule, and past orders.
- Push notifications when an order becomes ready.
- Admin dashboard for FPK entrepreneurship reporting.

## How to Present It to the Professor

1. Start with the validated problem and show the survey numbers.
2. Open the landing page and explain the value proposition in one sentence.
3. Switch to the student side, filter meals, place a preorder, and show the confirmation.
4. Switch to the vendor dashboard and change the order status from `Pending` to `Preparing` to `Ready`.
5. Show the charts and AI insights as the future-facing part of the MVP.
6. Close with the business model: a small 1 to 2 MAD service fee, vendor adoption, and campus expansion.

## Demo Roadmap
- Add screenshots
- Add QR pickup
- Improve AI waiting time
- Deploy frontend and backend

## API Examples
- GET /meals
- POST /orders
- PATCH /orders/{id}/status

## API Endpoints Summary
- GET /meals
- POST /orders
- GET /dashboard/stats
- GET /ai/recommendations
