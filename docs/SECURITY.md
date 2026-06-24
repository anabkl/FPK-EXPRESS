# Security Model

FPK-EXPRESS is a campus preorder MVP with real student accounts and a privately seeded vendor account. Its controls protect product data and role boundaries while keeping the system understandable for an early deployment.

## Current protections

- Student registration is public; vendor registration does not exist publicly.
- Passwords are hashed with Argon2 and are never returned or logged.
- Login returns a signed, expiring bearer token stored in browser `sessionStorage`.
- Backend dependencies return `401` for missing/invalid sessions and `403` for the wrong role.
- Students can read only their own orders and cancel only their own `Pending` order.
- Vendors can manage only their owned snack, meals and orders.
- Status and payment transitions are enforced server-side.
- Strict Pydantic schemas reject unknown fields and validate bounds, categories, URLs, stock and pickup shape.
- Production CORS accepts exact configured origins and rejects wildcard origins.
- Security headers disable MIME sniffing, framing and unnecessary browser permissions.
- A process-local IP rate limiter returns `429` after the configured request threshold.
- Request logs include method, path, status and duration only.
- PostgreSQL credentials and signing secrets are supplied only through backend environment values.

## Session and privacy boundaries

The frontend never stores a role as authorization. It restores the current user from `/auth/me`, and the backend remains the source of truth. Logout removes only the access token and obsolete role key; the non-sensitive theme preference can remain in `localStorage`.

The MVP collects only a name, email, password hash, department selection and order data needed to provide access and manage pickup orders. It does not request national identity, bank details, precise location or other sensitive data.

## Known MVP limitations

- Bearer tokens in `sessionStorage` are simpler than hardened secure-cookie sessions.
- There is no email verification, password reset, account recovery or multifactor authentication.
- There is no dedicated platform-admin role or protected vendor-provisioning interface.
- The rate limiter and cache are process-local and do not coordinate across instances.
- Alembic migrations exist, but backup/restore procedures remain an operator responsibility.
- The project has no payment processing and must not store or transfer money.
- Security controls reduce risk; they are not a claim of formal compliance certification.

## Production follow-up

- Add short-lived access plus rotating refresh tokens or secure server-side session cookies.
- Add password reset, email verification and optional multifactor authentication.
- If cookies are introduced, add CSRF tokens and strict cookie settings.
- Add an audited admin workflow for partner/vendor provisioning.
- Use distributed rate limiting and cache storage when scaling beyond one process.
- Add structured audit events for authentication and order-state changes without sensitive payloads.
- Enforce HTTPS, trusted proxy configuration and host restrictions at deployment.
- Store secrets in the hosting provider's secret manager and rotate them periodically.
- Automate database backups, restore testing and migration rollback review.
- Add dependency scanning, SAST and a vulnerability disclosure process.

Report suspected vulnerabilities privately to the project owner. Do not include passwords, access tokens or real student data in a public issue.
