# Contributing To FPK-EXPRESS

Thanks for improving FPK-EXPRESS. Keep changes focused, deployment-safe, and aligned with the validated student problem.

## Local Setup

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic -c alembic.ini upgrade head
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

## Development Guidelines

- Preserve the student preorder flow and vendor dashboard behavior.
- Preserve server-side role and ownership checks; frontend visibility is never authorization.
- Keep payment limited to `PayOnPickup`/`PaidOnPickup` and do not add delivery behavior.
- Use the existing React, TailwindCSS, Framer Motion, FastAPI, and SQLAlchemy patterns.
- Keep UI copy concise and student-centered.
- Use MAD pricing and realistic FPK Khouribga meal examples.

## Quality Checks

Run before opening a pull request:

```bash
cd backend
pytest
```

```bash
cd frontend
npm ci
npm run build
```

```bash
PYTHONPYCACHEPREFIX=/tmp/fpk-express-pycache python3 -m py_compile backend/app/*.py
```

```bash
docker compose config
```

## Pull Request Checklist

- The app still runs locally.
- Backend endpoints remain compatible.
- README or docs are updated when behavior changes.
- UI remains mobile-first and responsive.
- No secrets are committed.
- Database model changes include a reviewed Alembic migration.
