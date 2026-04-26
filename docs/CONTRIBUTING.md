# Contributing To FPK-EXPRESS

Thanks for improving FPK-EXPRESS. Keep changes focused, demo-friendly, and aligned with the validated student problem.

## Local Setup

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Development Guidelines

- Preserve the student preorder flow and vendor dashboard behavior.
- Keep V1 simple: no authentication unless it is part of a planned milestone.
- Use the existing React, TailwindCSS, Framer Motion, FastAPI, and SQLAlchemy patterns.
- Keep UI copy concise and student-centered.
- Use MAD pricing and realistic FPK Khouribga meal examples.

## Quality Checks

Run before opening a pull request:

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

## Pull Request Checklist

- The app still runs locally.
- Backend endpoints remain compatible.
- README or docs are updated when behavior changes.
- UI remains mobile-first and responsive.
- No secrets are committed.
