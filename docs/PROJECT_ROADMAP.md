# FPK-EXPRESS Project Roadmap

FPK-EXPRESS is a preorder and direct-pickup platform for FPK Khouribga students. This roadmap explains how the live MVP can evolve into a wider campus service without introducing delivery.

## Phase 1 — MVP

### Features
- Landing page with problem, survey validation, and solution.
- Student meal browsing and preorder flow.
- Vendor dashboard for meals and orders.
- Rule-based suggestions, waiting-time estimation, and peak-hour trends.
- Vendor-scoped analytics from persisted orders and menu prices.

### Technical Improvements
- Keep frontend responsive and mobile-first.
- Improve API error handling.
- Add loading states and empty states.
- Prepare environment variables with `.env.example`.
- Keep Docker Compose ready for local demos.

### Business Goals
- Validate the concept with FPK students.
- Demonstrate the value of reducing queue waiting time.
- Show a possible 1–2 MAD service fee model.

## Phase 2 — Pilot at FPK Khouribga

### Features
- QR pickup confirmation.
- Vendor stock limits and availability hours.
- Student order history.
- Better notification system for order status.
- Hygiene and verified vendor badges.

### Technical Improvements
- Add password recovery and account-verification workflows.
- Operate the existing PostgreSQL production path with backups.
- Expand backend authorization and workflow tests.
- Improve waiting-time estimation using measured preparation data.
- Deploy frontend and backend online.

### Business Goals
- Test the system with one or two campus vendors.
- Measure average time saved per student.
- Collect real feedback and improve the workflow.
- Prepare a short pitch deck for university or incubator support.

## Phase 3 — Scale to Other Moroccan Universities

### Features
- Multi-campus support.
- Admin dashboard for universities.
- Vendor onboarding flow.
- Advanced meal recommendations by budget, time, and preference.
- Analytics per campus and vendor.

### Technical Improvements
- Scalable cloud deployment.
- Role-based access control.
- Monitoring and logging.
- Explore payment only after legal validation and an official authorized-provider partnership.
- API versioning and documentation.

### Business Goals
- Expand beyond FPK Khouribga.
- Build partnerships with campus vendors.
- Create a sustainable revenue model through small service fees.
- Position FPK-EXPRESS as a Moroccan student-life startup.
