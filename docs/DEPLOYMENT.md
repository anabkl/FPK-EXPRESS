# Deployment Guide

Target architecture: Vercel React/Vite frontend, Render FastAPI backend, and Render PostgreSQL or Neon PostgreSQL.

Deployment is a manual operator action. A successful local build is not proof that the public product is deployed.

## 1. Provision PostgreSQL

Create a PostgreSQL database in Render or Neon. Copy its external connection URL and keep it private. FPK-EXPRESS accepts provider URLs beginning with `postgres://` or `postgresql://` and uses the Psycopg 3 driver.

Do not commit the URL and do not use the local SQLite file in production.

## 2. Create the Render backend

Create a Render Web Service connected to this repository:

- Root directory: `backend`
- Runtime: Python
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

Choose a temporary exact origin such as `https://placeholder.invalid` for the first backend deploy. It is intentionally not a wildcard and will be replaced after Vercel provides the real domain.

## 3. Configure Render environment values

```text
APP_ENV=production
DATABASE_URL=<private PostgreSQL URL>
ALLOWED_ORIGINS=https://placeholder.invalid
JWT_SECRET=<long random secret of at least 32 characters>
ACCESS_TOKEN_EXPIRE_MINUTES=480
DEMO_VENDOR_EMAIL=<private vendor email>
DEMO_VENDOR_PASSWORD=<strong private vendor password>
RATE_LIMIT_REQUESTS=120
RATE_LIMIT_WINDOW_SECONDS=60
```

Generate `JWT_SECRET` with a password manager or a cryptographically secure secret generator. Do not prefix a real value with `replace_`.

## 4. Run production migrations

Before using the API, open the Render Shell for the backend and run:

```bash
alembic -c alembic.ini upgrade head
alembic -c alembic.ini current
```

The application seeds the demo vendor only from the configured private environment values. Public registration can create students only.

## 5. Verify the backend

Open:

```text
https://<render-service>.onrender.com/health
https://<render-service>.onrender.com/docs
```

Do not continue until `/health` returns `status: ok` and the migration is current.

## 6. Deploy the Vercel frontend

Import the same repository into Vercel:

- Framework preset: Vite
- Root directory: `frontend`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<render-service>.onrender.com`

`VITE_API_URL` is public by design and must contain only the API base URL, never a database URL or secret.

## 7. Update CORS after Vercel assigns the domain

Copy the exact production Vercel origin, for example `https://fpk-express.vercel.app`. Update the Render backend:

```text
ALLOWED_ORIGINS=https://fpk-express.vercel.app
```

If multiple exact frontends are required, separate them with commas. Never use `*` while `APP_ENV=production`. Redeploy/restart the backend after changing the value.

## 8. Two-stage deployment sequence

1. Provision PostgreSQL.
2. Deploy Render with an exact temporary origin and all private values.
3. Run Alembic and verify `/health`.
4. Deploy Vercel with the real Render URL in `VITE_API_URL`.
5. Replace Render `ALLOWED_ORIGINS` with the exact Vercel URL.
6. Redeploy/restart the Render backend.
7. Redeploy the Vercel frontend so its final production environment is captured in the build.
8. Run the production smoke test.

## 9. Production smoke-test checklist

- Public landing loads with no browser console error.
- Dossier entrepreneurial opens in a new tab.
- Public menu returns production PostgreSQL data.
- Student registration, login and `/auth/me` work.
- A student creates a real order and sees only their history.
- Logout removes the session and protected pages require login.
- Private vendor login opens only the owned snack data.
- Vendor meal create/edit/availability is persisted.
- Vendor advances an order one state at a time.
- Collected order can be marked `PaidOnPickup`; earlier payment confirmation is rejected.
- Dark mode and mobile navigation work.
- API failure produces an error state and never fake success.
- Security headers and exact CORS origin are present.

Record the frontend URL, backend URL, migration revision and test date after this checklist passes.

## 10. Common mistakes and fixes

| Symptom | Check |
| --- | --- |
| Backend fails at startup | Run Alembic and verify `DATABASE_URL` is reachable |
| Production rejects configuration | Use a 32+ character `JWT_SECRET` and no wildcard origin |
| Browser CORS error | Set `ALLOWED_ORIGINS` to the exact Vercel origin, without a trailing slash |
| Frontend calls localhost | Rebuild Vercel with production `VITE_API_URL` |
| Vendor login missing | Set both private vendor variables, then restart the backend |
| Public menu is empty | Verify migration/seed logs and database connectivity |
| Vercel shows an old API URL | Trigger a new deployment because Vite variables are embedded at build time |
| Render cannot import the app | Confirm root directory is `backend` and start command is exact |

## 11. Deployment truthfulness

Codex or a contributor must not claim deployment success without an actual public Vercel URL, an actual public backend health URL, a current migration, and a completed production smoke test. This guide prepares deployment; it does not perform or certify it.
