# ElectriCity — Backend

**v1.0.0**

Express API for the ElectriCity EV storefront. This package owns authentication, catalog, cart, checkout, payments, reviews, wishlist, media, analytics, email jobs, queues, and the Gemini chatbot tools.

For the full monorepo (Docker, seed accounts, frontend), see the root [`README.md`](../README.md).

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Acronyms](#2-acronyms)
3. [Architecture](#3-architecture)
4. [The 12 services](#4-the-12-services)
5. [Underscore sub-services](#5-underscore-sub-services)
6. [Design patterns](#6-design-patterns)
7. [Notable techniques](#7-notable-techniques)
8. [HTTP API map](#8-http-api-map)
9. [Environment](#9-environment)
10. [Scripts and tests](#10-scripts-and-tests)
11. [Resources and references](#11-resources-and-references)

---

## 1. Quick start

```bash
cd backend
cp .env-sample .env   # fill secrets
npm install
npm run docker:up     # MySQL, Redis, API, frontend
npm run db:schema:apply
npm run db:seed:apply
```

Typical local API: `http://localhost:8080` (see `PORT` in `.env`).  
CORS sample includes `http://localhost:3000` for the Docker frontend.

Seed logins (password `Password1!`):

- Customer: `maya.singh@example.com`
- Admin: `admin.one@example.com`

---

## 2. Acronyms

| Term | Meaning |
|------|---------|
| **GoF** | Gang of Four design patterns |
| **DP** | Design pattern |
| **FE / BE** | Frontend / Backend |
| **MW** | Middleware |
| **DAO** | Data Access Object |
| **DTO** | Data Transfer Object |
| **CQRS** | Command Query Responsibility Segregation |
| **CoR** | Chain of Responsibility |
| **HO function** | Higher-order function |
| **SOA** | Service-oriented architecture (facades per domain) |

---

## 3. Architecture

The backend is a **service-oriented, layered** Express app:

```text
HTTP request
  → middlewares (Helmet, CORS, cookies, rate limits, auth)
  → controllers
  → service facades (*.service.js)
      → validators (Zod)
      → query / mutation modules (CQRS)
      → DAOs (SQL via mysql2 pool)
      → DTOs (response shaping)
  → envelope response { success, status, data, timestamp }
```

Folder map:

```text
backend/
  configs/        env, db, redis, mail, AI, Sentry, constants
  controllers/    route handlers
  middlewares/    auth, helmet, rate limit, errors
  models/         schema.sql, seeds, apply scripts
  routes/api/     /api/auth, /api/shop, /api/dashboard
  services/       12 domain facades (+ underscore subfolders)
  utils/          BaseDAO, errors, tryCatch, pagination, logger, …
  tests/          unit/ + TC_*.test.js
  index.js        app entry
```

Shared DB access goes through `utils/BaseDAO.js` and per-service DAOs. Controllers stay thin; business rules live in services.

---

## 4. The 12 services

| Service | Facade | What it does |
|---------|--------|----------------|
| **IAM** | `iam/iam.service.js` | Register/login, JWT sessions, roles, profile, addresses |
| **Catalog** | `catalog/catalog.service.js` | Browse/search/facets/details/compare, brands, options, configs, promos |
| **Cart** | `cart/cart.service.js` | Guest + customer carts, summary, merge on login |
| **Order** | `order/order.service.js` | Tax/totals preview, checkout, order status |
| **Payment** | `payment/payment.service.js` | Payment attempts + method strategies (mock gateway) |
| **Wishlist** | `wishlist/wishlist.service.js` | Save/list/remove wishlist items |
| **Review** | `review/review.service.js` | Publish + customer/admin review queries |
| **Media** | `media/media.service.js` | Images/PDFs resolve, link, admin list |
| **Analytics** | `analytics/analytics.service.js` | Event capture, reports, dashboard overviews |
| **Email** | `email/email.service.js` | Queue welcome / order-confirm / account-deletion mail |
| **Queue** | `queue/queue.service.js` | BullMQ producers, queues, workers |
| **Chatbot** | `chatbot/chatbot.service.js` | Gemini chat + catalog/FAQ tools |

Cross-service adapters (not separate “12th” domains, but important):

- `catalog/MediaAdapter.js` → Media
- `iam/EmailAdaptor.js` / `order/EmailAdaptor.js` → Email

---

## 5. Underscore sub-services

We use a leading `_` folder to mean **“sub-domain inside a larger service.”**  
That keeps related CQRS files together without inventing another top-level service.

### IAM (`services/iam/`)

| Subfolder | Role |
|-----------|------|
| `_access` | Auth mutations/queries: register, login, logout, refresh, sessions, authorize |
| `_identity` | Profile + address CRUD, admin user list/search |

### Catalog (`services/catalog/`)

| Subfolder | Role |
|-----------|------|
| `_product` | Vehicle browse/search/facets/details/compare |
| `_brand` | Brand list, detail, models |
| `_options` | Customization options for a catalog item |
| `_configurations` | Saved option configurations |
| `_promotions` | Promo filters (hot deal, seasonal, clearance, featured) |

### Analytics (`services/analytics/`)

| Subfolder | Role |
|-----------|------|
| `_track` | Event capture, event types, admin reports (breakdown, trend, list) |
| `_dashboard` | Admin + customer overview KPIs |

### Queue (`services/queue/`)

| Subfolder | Role |
|-----------|------|
| `_producers` | Job producers (email, analytics) |
| `_queues` | Queue strategies / BullMQ queue wiring |
| `_workers` | Worker starters + processors |

Other services (`cart`, `order`, `payment`, `media`, `review`, `wishlist`, `email`, `chatbot`) usually keep strategies or ownership helpers as sibling folders (`strategies/`, `ownership/`, `builder/`) instead of `_` prefixes.

---

## 6. Design patterns

The original starter list is kept and expanded to match what is actually in the code.

### From the original notes

- **Builder / Singleton**: Email templates (`EmailTemplateBuilder`) and a shared Nodemailer transporter in `configs/mail.js`. Chatbot prompts use the same Builder + Director idea (`PromptTemplateBuilder`, `PromptDirector`).
- **Decorator**: `utils/tryCatch.js` wraps controllers so errors funnel into the global handler.
- **Chain of Responsibility**: Express middleware pipeline (`next()`), including Helmet, CORS, rate limits, and auth.

### Added / clarified from the codebase

| Pattern | Where you see it |
|---------|------------------|
| **Facade** | Each `*.service.js` exports a stable API for controllers |
| **CQRS** | Paired `*Query.js` / `*Mutation.js` under most services |
| **DAO** | `*DAO.js` + shared `BaseDAO` for SQL and error mapping |
| **DTO** | `DTOs/` folders shape public responses |
| **Strategy** | Payment methods, media types, checkout actors, promo SQL fragments, chatbot tools, queue/producer strategies |
| **Context** | `PaymentContext`, `CheckoutContext`, `MediaContext`, `ToolContext`, `QueueContext`, `ProducerContext` hold the selected strategy |
| **Registry** | Maps names/kinds to strategies or handlers (`CartRegistry`, `DetailsRegistry`, `CompareRegistry`, `PromoStrategyRegistry`, payment/media/tool indexes) |
| **Template Method** | Cart ownership handlers; catalog details/compare handlers (shared skeleton, specialized steps). See Refactoring Guru links in those files |
| **Adapter** | `MediaAdapter`, IAM/Order `EmailAdaptor` so Catalog/IAM/Order do not import Media/Email internals directly |
| **Director** | `EmailDirector`, `PromptDirector` orchestrate builders for a finished product |
| **Builder** | `EmailTemplateBuilder`, `PromptTemplateBuilder` (+ product objects like `PromptTemplate`) |

MVC still applies at the HTTP edge (routes → controllers → services → models/DAOs), with the frontend as the view.

---

## 7. Notable techniques

- Higher-order wrappers (`tryCatch`) for controllers
- Barrel exports (`services/index.js` and strategy `index.js` files)
- Mix of functional modules and small OOP classes (strategies, registries, builders)
- Centralized config in `configs/` (especially `configs/env.js`)
- Zod validation at service boundaries
- JSDoc on public service APIs
- DRY helpers for pagination, envelopes, and error types
- Redis for analytics event-type cache / invalidation and BullMQ connection
- Parameterized SQL via mysql2 (bound params), not string-concatenated queries

---

## 8. HTTP API map

| Prefix | Audience | Examples |
|--------|----------|----------|
| `/api/auth` | Public + authenticated | register, login, refresh, `/me`, sessions, addresses |
| `/api/shop/catalog` | Public / customer | vehicles, brands, compare, configurations, item reviews |
| `/api/shop/cart` | Guest or customer | view, add, update, remove, clear, merge |
| `/api/shop/checkout` | Guest or customer | calculate totals, checkout |
| `/api/shop/chatbot` | Public | send message |
| `/api/dashboard/customer` | Customer JWT | overview, orders, payments, wishlist, reviews |
| `/api/dashboard/admin` | Admin JWT | overview, analytics, users, orders, payments, reviews, media |

Rate limiters are applied per area (`auth`, `shop`, `dashboard`) in `index.js`.

---

## 9. Environment

Copy `.env-sample` → `.env`. Important groups:

- Server: `PORT`, `CORS_ORIGINS`, `NODE_ENV`, `JWT_SIGN_KEY`
- MySQL: `DB_*`, `MYSQL_*`
- Redis: `REDIS_*`
- Email SMTP: `EMAIL_*`
- Gemini: `GEMINI_API_KEY`, `GEMINI_MODEL`
- Sentry: `SENTRY_*` (optional)

Docker Compose overrides `DB_HOST=mysql` and `REDIS_HOST=redis` for the backend container.

---

## 10. Scripts and tests

| Script | Purpose |
|--------|---------|
| `npm start` | Nodemon API (also used in Docker) |
| `npm run db:schema:apply` | Apply `models/schema.sql` |
| `npm run db:seed:apply` | Apply seed data |
| `npm test` | Jest (`tests/unit/**`, `tests/TC_*.test.js`) |
| `npm run test:coverage` | Coverage (global thresholds ~80%) |
| `npm run test:tc:fresh` | Reseed then coverage |
| `npm run docker:up` / `down` / `logs` | Compose helpers |

Coverage HTML: `tests/coverage/`. Some chatbot/email/queue worker files are intentionally excluded in `jest.config.js`.

---

## 11. Resources and references

Unique links only. Original README resources are kept first, then code-cited docs and inspirations.

### Original resources (kept)

- BullMQ + Express overview: https://www.thisdot.co/blog/bullmq-with-expressjs
- Strategy pattern guide: https://medium.com/@robinviktorsson/a-guide-to-the-strategy-design-pattern-in-typescript-and-node-js-with-practical-examples-c3d6984a2050
- JSDoc: https://jsdoc.app/
- Custom errors in JS: https://adamcoster.com/blog/javascript-custom-errors
- Storefront auth reference (guest/session ideas): https://docs.scalev.com/en/storefront-api/auth
- Guest cart merge API reference: https://docs.scalev.com/api-reference/storefront/merge-a-guest-cart-into-the-authenticated-customer-cart

### Config and infrastructure (cited in code)

| Topic | Link |
|-------|------|
| Env config inspiration | https://github.com/GonzaloHirsch/jwt-nodejs-security/blob/main/src/config/index.ts |
| mysql2 | https://github.com/sidorares/node-mysql2 |
| mysql2 connection pools | https://sidorares.github.io/node-mysql2/docs#using-connection-pools |
| BaseDAO / mysql2 write-up | https://oneuptime.com/blog/post/2026-03-31-mysql-nodejs-mysql2-driver/view |
| MySQL generated columns (schema) | https://dev.mysql.com/doc/refman/8.4/en/create-table-generated-columns.html |
| ioredis | https://github.com/redis/ioredis |
| BullMQ connections | https://docs.bullmq.io/guide/connections |
| BullMQ workers | https://docs.bullmq.io/guide/workers |
| BullMQ job age retention | https://docs.bullmq.io/guide/queues/auto-removal-of-jobs#keep-jobs-based-on-their-age |
| BullMQ exponential retry | https://docs.bullmq.io/guide/retrying-failing-jobs#exponential |
| Helmet | https://helmetjs.github.io/
| express-rate-limit | https://www.npmjs.com/package/express-rate-limit |
| Nodemailer | https://nodemailer.com/ |
| Nodemailer + Mailtrap blog | https://mailtrap.io/blog/sending-emails-with-nodemailer/ |
| Nodemailer Express article | https://medium.com/coox-tech/send-mail-using-node-js-express-js-with-nodemailer-93f4d62c83ee |
| Gemini API docs | https://ai.google.dev/gemini-api/docs |

### Sentry (cited in `configs/sentry.js` / `utils/sentryHelpers.js`)

- https://docs.sentry.io/platforms/javascript/guides/express/
- https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
- https://docs.sentry.io/platforms/javascript/enriching-events/scopes/
- https://docs.sentry.io/platforms/javascript/guides/node/enriching-events/tags/
- https://docs.sentry.io/platforms/react-native/enriching-events/context/#structured-context
- https://docs.sentry.io/platforms/javascript/guides/node/configuration/hooks/
- https://docs.sentry.io/platforms/javascript/data-management/sensitive-data/#scrubbing-data
- https://docs.sentry.io/platforms/javascript/guides/node/enriching-events/request-isolation/
- https://docs.sentry.io/platforms/javascript/migration/v7-to-v8/v8-new-performance-api/

### Errors, responses, barrels, Zod

| Topic | Link |
|-------|------|
| Global Express error handler inspiration | https://javascript.plainenglish.io/how-i-set-up-a-global-error-handler-in-express-js-and-why-you-should-too-800d80770cce |
| HTTP status codes | https://nodejs.org/api/http.html#httpstatus_codes |
| API response util inspiration | https://npmx.dev/package/express-api-utils/v/1.0.4 |
| Barrel exports | https://medium.com/@klauskpm/do-a-barrel-export-aa5b79b76b05 |
| Zod error customization | https://zod.dev/error-customization |
| Zod v4 simplified errors | https://zod.dev/v4?id=simplified-error-customization#simplified-error-customization |
| Zod preprocess | https://zod.dev/api?id=preprocess#preprocess |
| Zod pipes | https://zod.dev/api?id=pipes#pipes |
| Zod superRefine | https://zod.dev/api?id=superrefine#superrefine |
| Template Method (Refactoring Guru) | https://refactoring.guru/design-patterns/template-method |
| Jest environment variables | https://jestjs.io/docs/environment-variables |

### Runtime / product URLs (listed once)

- Production site: https://project-electricity.app
- Local frontend origin (CORS sample): http://localhost:3000

Seed data may include third-party brand websites (Tesla, Ford, …) as sample `website_url` values. Those are catalog content, not backend design references.

---

## License

ISC
