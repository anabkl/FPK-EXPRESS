# Security Model

FPK-EXPRESS is a V1 campus MVP. The current security model is designed for a safe local demo, not for production identity or payment workflows.

## Current Protections

- Public landing/demo sections remain accessible without login.
- Student and Vendor dashboards are protected in the UI by a local role gate.
- The role is validated before it is saved in `localStorage`.
- Invalid or missing roles redirect to the login flow instead of opening protected dashboards.
- Wrong-role access shows a clean unauthorized state.
- Frontend forms sanitize and trim user input before API submission.
- Backend Pydantic schemas validate departments, statuses, bounds, and URL shape.
- FastAPI responses include basic security headers.
- CORS is controlled by `ALLOWED_ORIGINS` and blocks wildcard origins in production mode.
- A lightweight in-memory IP rate limiter returns HTTP 429 when a client exceeds the configured limit.
- API logs include method, path, status, and duration only.

## Known MVP Limitations

- The local role is not real authentication and can be modified by a user in the browser.
- There are no passwords, JWTs, session cookies, or server-side user accounts yet.
- The in-memory rate limiter resets when the backend process restarts and does not coordinate across multiple server instances.
- SQLite is suitable for the V1 demo but not the final production persistence layer.
- No payment, wallet, or personally sensitive production data should be handled by this MVP.

## Future Improvements

- Real authentication with JWT or secure server-side session cookies.
- Password hashing with a modern password-hashing algorithm.
- CSRF protection if cookie-based sessions are used.
- Database migrations with Alembic or a similar migration workflow.
- Audit logging for security-relevant actions.
- HTTPS deployment with secure proxy headers.
- Secret management through environment-specific secret stores.
- Role and permission checks enforced server-side for vendor-only write endpoints.
- Distributed rate limiting for production deployments.
