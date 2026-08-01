# ElectriCity

**EECS 4413 · Group G · v1.0.0**

ElectriCity is a full-stack **electric-vehicle e-commerce** platform. Customers can browse and compare EVs, customize options, use a guest or account cart, check out, leave reviews, manage a wishlist, and chat with a Gemini-powered shop assistant. Admins get dashboards for users, orders, payments, reviews, media, and analytics.

This README is written so a marker/TA can run the project locally, understand the architecture, and verify the main features without digging through the whole codebase first.

---

## Table of contents

1. [Live demo & test accounts](#1-live-demo--test-accounts)
2. [What you can do in the app](#2-what-you-can-do-in-the-app)
3. [Tech stack](#3-tech-stack)
4. [Repository layout](#4-repository-layout)
5. [Architecture overview](#5-architecture-overview)
6. [API surface (backend)](#6-api-surface-backend)
7. [Frontend routes](#7-frontend-routes)
8. [Prerequisites](#8-prerequisites)
9. [Environment configuration](#9-environment-configuration)
10. [Local setup (recommended: Docker)](#10-local-setup-recommended-docker)
11. [Running tests](#11-running-tests)
12. [Useful scripts](#12-useful-scripts)
13. [Suggested grading walkthrough](#13-suggested-grading-walkthrough)
14. [Known limitations](#14-known-limitations)
15. [Docs & license](#15-docs--license)

---

## 1. Live demo & test accounts

| Service                            | URL                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Frontend (storefront + dashboards) | [https://project-electricity.app/](https://project-electricity.app/)       |
| Backend API                        | [https://api.project-electricity.app](https://api.project-electricity.app) |

### Seeded accounts

After `npm run db:seed:apply` (or on the live seeded environment), use:

| Role         | Email                    | Password     |
| ------------ | ------------------------ | ------------ |
| **Customer** | `maya.singh@example.com` | `Password1!` |
| **Admin**    | `admin.one@example.com`  | `Password1!` |

> There are additional seeded customers (`daniel.osei@example.com`, etc.) and a second admin (`admin.two@example.com`) with the same password. See `backend/models/seeds/seed.sql`.

---

## 2. What you can do in the app

### Public / shop (no login required for most of this)

- Landing page, about, FAQ, contact, terms, privacy, careers (static/mock content)
- Catalog browse / search / filters / deals
- Vehicle detail pages (images, specs, history PDF when present, share)
- Compare vehicles
- Brand list + brand detail
- Guest cart (`cart_session` cookie / `X-Cart-Session` header)
- Checkout (guest or customer)
- Loan calculator (client-side)
- Chatbot (Gemini; catalog + FAQ tools - cannot mutate cart/orders)

### Customer dashboard (after login)

- Overview
- Orders & payments
- Wishlist & reviews
- Settings: profile, addresses, security (sessions)
- Delete account (profile settings)

### Admin dashboard

- Overview + analytics (events, reports)
- Users (list/search)
- Orders & payments
- Reviews moderation
- Media management

---

## 3. Tech stack

### Frontend (`frontend/`)

| Area            | Choice                            |
| --------------- | --------------------------------- |
| UI              | React 19, TypeScript              |
| Build           | Vite 8                            |
| Routing         | TanStack Router                   |
| Server state    | TanStack Query + Axios            |
| Local UI state  | Zustand                           |
| Forms           | Formik + Zod                      |
| Styling         | Tailwind CSS v4, shadcn/ui, Radix |
| Tables / charts | TanStack Table, Recharts          |
| Monitoring      | `@sentry/react`                   |

### Backend (`backend/`)

| Area                | Choice                                |
| ------------------- | ------------------------------------- |
| Runtime             | Node.js (ESM), Express 5              |
| Data                | MySQL 8 (`mysql2`)                    |
| Cache / jobs        | Redis 7, BullMQ                       |
| Auth                | JWT access + refresh sessions, bcrypt |
| Validation          | Zod                                   |
| Email               | Nodemailer (queued)                   |
| AI                  | Google Gemini (`@google/genai`)       |
| Security middleware | Helmet, CORS, rate limits             |
| Logging / errors    | Winston, Sentry                       |
| Tests               | Jest (unit + TC suites)               |

### Infrastructure

- **Local:** Docker Compose (`docker/docker-compose.yml`) - MySQL, Redis, backend, frontend
- **Production:** Railway (API + DB/Redis as configured), Cloudflare in front of the public site

---

## 4. Repository layout

```text
ElectriCity-Project/
├── backend/                 # Express API
│   ├── configs/             # env, db, redis, sentry, constants
│   ├── controllers/         # HTTP controllers
│   ├── middlewares/         # auth, helmet, rate limit, errors
│   ├── models/              # schema + seed SQL + apply scripts
│   ├── routes/api/          # /api/auth, /api/shop, /api/dashboard
│   ├── services/            # 12 business services (facades)
│   ├── tests/               # unit/ + TC_*.test.js
│   ├── utils/               # errors, pagination, logger, …
│   ├── index.js             # app entry
│   ├── package.json
│   └── .env-sample          # copy → .env and fill values
├── frontend/                # React SPA
│   ├── src/routes/          # file-based TanStack routes
│   ├── src/hooks/api/       # API hooks
│   ├── src/components/      # UI
│   ├── src/zod/             # env + form schemas
│   └── package.json
├── docker/                  # docker-compose.yml
├── docs/                    # API docs, design, report materials
└── README.md
```

---

## 5. Architecture overview

### Backend style

The API is **service-oriented**. Controllers stay thin; business logic lives in `backend/services/*` behind facades (for example `catalog.service.js`, `iam.service.js`).

Common pattern inside a service:

- `*Query.js` / `*Mutation.js` - CQRS-style read/write split
- `*Validator.js` - Zod input validation
- `*DAO.js` - SQL / DB access
- `DTOs/` - response shaping
- Underscored folders (`_access`, `_identity`, `_product`, …) = **sub-domains** inside a larger service

### The 12 services

| Service       | Responsibility                                                         | Notable sub-areas                                                  |
| ------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **IAM**       | Register/login, JWT sessions, roles, profile, addresses                | `_access`, `_identity`                                             |
| **Catalog**   | Browse/search/facets/details/compare, brands, options, configs, promos | `_product`, `_brand`, `_options`, `_configurations`, `_promotions` |
| **Cart**      | Guest + customer carts, merge on login                                 | ownership handlers                                                 |
| **Order**     | Checkout totals, place order, status updates                           | guest/customer checkout strategies                                 |
| **Payment**   | Payment attempts + method strategies (mock gateway)                    | card / wallet strategies                                           |
| **Wishlist**  | Save / list / remove catalog items                                     |                                                                    |
| **Review**    | Publish + customer/admin review views                                  |                                                                    |
| **Media**     | Images/PDFs; resolve, link, admin list                                 | image/PDF strategies                                               |
| **Analytics** | Event capture, reports, dashboard overviews                            | `_track`, `_dashboard`                                             |
| **Email**     | Queue welcome / order-confirm / account-deletion mail                  |                                                                    |
| **Queue**     | BullMQ producers, queues, workers                                      | `_producers`, `_queues`, `_workers`                                |
| **Chatbot**   | Gemini assistant with catalog/FAQ tools                                |                                                                    |

### How the pieces talk

- **Shop UI** → `/api/shop/*` (catalog, cart, checkout, chatbot)
- **Auth / profile** → `/api/auth/*`
- **Dashboards** → `/api/dashboard/customer/*` or `/api/dashboard/admin/*` (JWT + role checks)
- **Catalog** pulls media through a **MediaAdapter**
- **Order/IAM** enqueue mail through **Email** → **Queue** workers
- **Analytics** may use Redis (event-type cache / invalidation) and the queue for background work

### Frontend style

- File-based routes under `frontend/src/routes`
- TanStack Query for API caching/refetch
- Zustand for UI-only state (modals, chatbot messages, compare selections, …)
- Role guards send users to login or the correct dashboard area

---

## 6. API surface (backend)

Base URL locally (Docker / sample env): **`http://localhost:8080`**

| Prefix                                | Purpose                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `POST/GET/PATCH/DELETE /api/auth/...` | Register, login, refresh, logout, `/me`, sessions, addresses                  |
| `/api/shop/catalog/...`               | Vehicles, brands, compare, configurations, reviews on items, wishlist toggles |
| `/api/shop/cart/...`                  | Cart CRUD + summary                                                           |
| `/api/shop/checkout/...`              | Calculate totals + checkout                                                   |
| `/api/shop/chatbot/...`               | Chat message                                                                  |
| `/api/dashboard/customer/...`         | Customer overview, orders, payments, wishlist, reviews                        |
| `/api/dashboard/admin/...`            | Admin overview, analytics, users, orders, payments, reviews, media            |

Response envelope (typical): `{ success, status, data, timestamp }`.

OpenAPI / HTML API docs (if present): `docs/api/`.

---

## 7. Frontend routes

### Shop

| Path                                                              | Page               |
| ----------------------------------------------------------------- | ------------------ |
| `/`                                                               | Home               |
| `/catalog`, `/catalog/$cid`, `/catalog/deals`, `/catalog/compare` | Catalog            |
| `/brands`, `/brands/$bid`                                         | Brands             |
| `/cart`, `/checkout`, `/checkout-success`                         | Cart & checkout    |
| `/chatbot`, `/loan-calculator`                                    | Tools              |
| `/about`, `/faq`, `/contact`, `/terms`, `/privacy`, `/careers`    | Static / marketing |

### Auth

| Path             | Page     |
| ---------------- | -------- |
| `/auth/login`    | Login    |
| `/auth/register` | Register |

### Dashboard

| Path                      | Page                                                           |
| ------------------------- | -------------------------------------------------------------- |
| `/dashboard/customer/...` | Customer home, orders, payments, wishlist, reviews             |
| `/dashboard/admin/...`    | Admin home, analytics, users, orders, payments, reviews, media |
| `/dashboard/settings/...` | Profile, addresses, security                                   |

---

## 8. Prerequisites

Install before local setup:

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. [Node.js LTS](https://nodejs.org/en/download) (project Docker images use Node 20)
3. Git

---

## 9. Environment configuration

### Backend

1. Copy the sample file:

```bash
cd backend
cp .env-sample .env
```

2. Fill in real values (especially passwords, `JWT_SIGN_KEY`, email, and `GEMINI_API_KEY` if you want the chatbot to work).

Important variables (see `.env-sample` for the full list):

| Variable                          | Meaning                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `PORT`                            | API port (sample uses `8080`)                                                 |
| `CORS_ORIGINS`                    | Allowed browser origins (include `http://localhost:3000` for Docker frontend) |
| `DB_*` / `MYSQL_*`                | MySQL connection + Compose bootstrap                                          |
| `REDIS_*`                         | Redis host/port/password                                                      |
| `JWT_SIGN_KEY`                    | Signing key for tokens                                                        |
| `EMAIL_*`                         | SMTP for queued mail                                                          |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Chatbot                                                                       |
| `SENTRY_*`                        | Optional backend error monitoring                                             |

When containers start, Compose overrides `DB_HOST=mysql` and `REDIS_HOST=redis` for the backend service.

### Frontend

Create `frontend/.env` (used by Compose and/or `npm run dev`):

| Variable              | Meaning                                        |
| --------------------- | ---------------------------------------------- |
| `VITE_ENVIRONMENT`    | `development` / `production` / `test`          |
| `VITE_DEV_API_URL`    | Local API, e.g. `http://localhost:8080`        |
| `VITE_PROD_API_URL`   | Production API                                 |
| `VITE_STORAGE_SECRET` | Client storage encryption secret (min 8 chars) |
| `VITE_SENTRY_*`       | Optional frontend Sentry                       |

---

## 10. Local setup (recommended: Docker)

This is the path we expect TAs to use.

### Step A - Install backend dependencies (for DB scripts)

```bash
cd backend
npm install
```

### Step B - Start MySQL, Redis, API, and frontend

```bash
cd backend
npm run docker:up
```

This runs:

```text
docker compose -f ../docker/docker-compose.yml --env-file .env up -d --build
```

Containers:

| Container              | Role            | Host port (typical)                |
| ---------------------- | --------------- | ---------------------------------- |
| `electricity-mysql`    | MySQL 8.4       | `3306`                             |
| `electricity-redis`    | Redis 7         | `6379`                             |
| `electricity-backend`  | Express API     | `PORT` from `.env` (sample `8080`) |
| `electricity-frontend` | Vite on `:3000` | `http://localhost:3000`            |

Wait until MySQL is healthy (first boot can take a minute).

```bash
npm run docker:logs
```

### Step C - Create tables and seed data

```bash
cd backend
npm run db:schema:apply
npm run db:seed:apply
```

### Step D - Open the app

1. Browser: [http://localhost:3000](http://localhost:3000)
2. API smoke check: [http://localhost:8080](http://localhost:8080) (or your configured `PORT`)
3. Log in with the customer or admin seed account above

### Stop the stack

```bash
cd backend
npm run docker:down
```

### Frontend-only iteration (optional)

If Docker is already running the API/DB:

```bash
cd frontend
npm install
npm run dev
```

Use whatever port Vite prints; ensure `VITE_DEV_API_URL` matches the API.

---

## 11. Running tests

Backend tests live under `backend/tests/`:

- `tests/unit/**` - mocked unit tests (DAO/query/mutation/validator/DTO)
- `tests/TC_*.test.js` - broader test cases (may expect DB depending on suite)

From `backend/`:

```bash
npm test                 # all matching tests
npm run test:coverage    # coverage (thresholds: 80% statements/branches/functions/lines)
npm run test:tc:fresh    # reseed, then coverage
```

Notes for markers:

- Jest runs with `maxWorkers: 1` (avoids DB row lock issues).
- Coverage HTML output: `backend/tests/coverage/`.
- Some chatbot/email/queue worker files are excluded from coverage collection on purpose (see `jest.config.js`).

---

## 12. Useful scripts

### Backend (`backend/package.json`)

| Script                               | Description                                          |
| ------------------------------------ | ---------------------------------------------------- |
| `npm start`                          | Nodemon API (also used inside the backend container) |
| `npm run db:schema:apply`            | Apply MySQL schema                                   |
| `npm run db:seed:apply`              | Seed demo data                                       |
| `npm test` / `npm run test:coverage` | Jest                                                 |
| `npm run docker:up`                  | Build/start Compose stack                            |
| `npm run docker:down`                | Stop stack                                           |
| `npm run docker:logs`                | Tail logs                                            |
| `npm run docker:npm-ci`              | `npm ci` inside the backend container                |

### Frontend (`frontend/package.json`)

| Script                                | Description                                 |
| ------------------------------------- | ------------------------------------------- |
| `npm run dev`                         | Vite dev server                             |
| `npm run build`                       | `tsc -b` + production build                 |
| `npm run lint`                        | ESLint                                      |
| `npm run format` / `format:check`     | Prettier                                    |
| `npm run docker:up` / `down` / `logs` | Same Compose stack (uses `../backend/.env`) |

---

## 13. Suggested grading walkthrough

A short path that hits most of the product:

1. **Open** `http://localhost:3000` (or the live site).
2. **Browse catalog** → open a vehicle → check images / details / share.
3. **Add to cart as guest** → open `/cart` → proceed toward checkout.
4. **Register or log in** as `maya.singh@example.com` → confirm cart merge behaviour if you still have a guest cart.
5. **Checkout** (mock payment - every few attempts may fail by design in the mock strategy).
6. **Customer dashboard** → orders, wishlist, leave/view a review.
7. **Chatbot** → ask for a brand or filtered browse (needs `GEMINI_API_KEY`).
8. **Log out**, log in as `admin.one@example.com` → users, orders, payments, reviews, media, analytics.

---

## 14. Known limitations

Be aware when marking / demoing:

| Topic                     | Reality in v1.0.0                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Payments                  | Mock gateway strategies (Stripe package may exist; live charging is not the demo path)               |
| Tax                       | Simplified province-based tax helpers, not a full tax engine                                         |
| Media storage             | App/DB-oriented media URLs - not dedicated object storage (S3, etc.)                                 |
| Admin catalog CRUD        | Admin catalog router is effectively a stub; media linking is the main admin catalog-adjacent feature |
| Chatbot                   | Not a durable multi-session transcript store; tools are read-oriented (catalog/FAQ)                  |
| Auth extras               | No MFA / password-reset / email-verification flows yet                                               |
| Careers / loan calculator | Frontend (or static) experiences - not full backend domains                                          |

---

## 15. Docs & license

- Design / report materials: `docs/`
- API reference HTML (when generated): `docs/api/api-docs.html`
- Author: **EECS 4413 Group G**
- License: **ISC** (see `package.json` files)

---

If something fails on first boot, check `npm run docker:logs`, confirm `.env` matches `.env-sample`, and wait for the MySQL healthcheck before running schema/seed.
