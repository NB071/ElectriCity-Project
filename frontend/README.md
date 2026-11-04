# ElectriCity - Frontend

React + TypeScript storefront and dashboards for ElectriCity.  
This package talks to the Express API (`/api/auth`, `/api/shop`, `/api/dashboard`) and ships the public shop, auth screens, customer dashboard, and admin dashboard.

For the full project (Docker, seed accounts, backend services), see the **root** [`README.md`](../README.md).

---

## Stack

| Concern        | Library                                    |
| -------------- | ------------------------------------------ |
| UI             | React 19, TypeScript                       |
| Bundler        | Vite 8                                     |
| Routing        | TanStack Router                            |
| Data fetching  | TanStack Query + Axios                     |
| Tables         | TanStack Table                             |
| Local UI state | Zustand                                    |
| Forms          | Formik + Zod (`zod-formik-adapter`)        |
| Styling        | Tailwind CSS v4, shadcn/ui (Radix), Lucide |
| Charts / maps  | Recharts, Leaflet / React-Leaflet          |
| Motion         | Framer Motion / Motion                     |
| Toasts         | Sonner                                     |
| Monitoring     | `@sentry/react`                            |

---

## Quick start

### With Docker (recommended)

From repo root / backend (uses Compose + `backend/.env` + `frontend/.env`):

```bash
cd backend
npm run docker:up
```

Frontend is served at **http://localhost:3000**.

### Standalone Vite

```bash
cd frontend
npm install
npm run dev
```

Point `VITE_DEV_API_URL` at your API (default in schema: `http://localhost:8080`).

### Scripts

| Command                               | Description                             |
| ------------------------------------- | --------------------------------------- |
| `npm run dev`                         | Vite dev server                         |
| `npm run build`                       | Typecheck (`tsc -b`) + production build |
| `npm run preview`                     | Preview production build                |
| `npm run lint`                        | ESLint                                  |
| `npm run format` / `format:check`     | Prettier                                |
| `npm run docker:up` / `down` / `logs` | Compose helpers (via `../backend/.env`) |

### Environment

Validated in `src/zod/env.ts`:

| Variable              | Role                                                           |
| --------------------- | -------------------------------------------------------------- |
| `VITE_ENVIRONMENT`    | `development` \| `production` \| `test`                        |
| `VITE_VERSION`        | App version string                                             |
| `VITE_DEV_API_URL`    | Local API base URL                                             |
| `VITE_PROD_API_URL`   | Production API (default `https://api.project-electricity.app`) |
| `VITE_STORAGE_SECRET` | Client storage secret (min 8 chars)                            |
| `VITE_SENTRY_*`       | Optional browser Sentry                                        |

---

## Source layout

```text
src/
  routes/           # TanStack file routes (shop, auth, dashboard)
  components/       # UI + shop/dashboard/layout pieces
  components/ui/    # shadcn primitives
  hooks/api/        # API hooks by domain
  stores/           # Zustand stores
  integrations/     # Axios client, Sentry
  zod/              # Env + form schemas
  lib/              # Helpers (media URLs, formatters, …)
  styles/           # Global CSS / Tailwind
```

Route groups of interest:

- Shop: `/`, `/catalog`, `/brands`, `/cart`, `/checkout`, `/chatbot`, static pages
- Auth: `/auth/login`, `/auth/register`
- Dashboard: `/dashboard/customer/*`, `/dashboard/admin/*`, `/dashboard/settings/*`

---

## Resources & references

Links below are **unique** (no duplicates). They include docs we used while building, plus URLs cited in source comments or config.

### Environment & tooling

- Env validation approach: https://github.com/noahtigner/validate-env-vars
- Prettier options: https://prettier.io/docs/options
- Prettier CLI: https://prettier.io/docs/cli
- VS Code settings: https://code.visualstudio.com/docs/configure/settings
- Vite config docs: https://vite.dev/config/
- Vite + Docker file watching (ref in `vite.config.ts`): https://stackoverflow.com/questions/79838167/laravel-and-vite-within-a-docker-container

### TanStack

- Router + Vite: https://tanstack.com/router/latest/docs/installation/with-vite
- Router manual install: https://tanstack.com/router/latest/docs/installation/manual
- Router Devtools: https://tanstack.com/router/latest/docs/devtools
- Table install: https://tanstack.com/table/latest/docs/installation
- React Query install: https://tanstack.com/query/latest/docs/framework/react/installation
- React Query quick start: https://tanstack.com/query/latest/docs/framework/react/quick-start
- React Query Devtools: https://tanstack.com/query/latest/docs/framework/react/devtools

### UI kits & block libraries

- shadcn/ui manual install: https://ui.shadcn.com/docs/installation/manual
- shadcn schema (`components.json`): https://ui.shadcn.com/schema.json
- Efferd: https://efferd.com/
- shadcnspace: https://shadcnspace.com/
- shadcn UI blocks: https://www.shadcn-ui-blocks.com/
- Component registries (see `components.json`):
    - https://shadcnspace.com/r/{name}.json
    - https://shadcnuikit.com/r/{name}.json

### Ideas & code inspirations (cited in source)

| Where                                                               | Link                                                                                                    | Notes                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `src/integrations/axios/client.ts`                                  | https://github.com/bezkoder/react-refresh-token-hooks/blob/master/src/services/api.js                   | Refresh-token Axios flow inspiration |
| `src/integrations/axios/client.ts`                                  | https://axios.rest/pages/advanced/interceptors                                                          | Interceptor docs                     |
| `src/components/dashboard/ContentSection.tsx`                       | https://github.com/satnaing/shadcn-admin/blob/main/src/features/settings/components/content-section.tsx | Settings content-section layout      |
| `src/components/common/Typewriter.tsx` / `hooks/use-typewriter.tsx` | https://medium.com/@hamzamakh/typewriter-effect-in-react-a103a4f385c9                                   | Typewriter effect                    |
| `src/components/shop/chatbot/ChatbotPrompt.tsx`                     | https://blocks.so/ai                                                                                    | Chat prompt UI inspiration           |
| `src/components/popover4.tsx`                                       | https://shadcnuikit.com/components/popover                                                              | Share popover idea                   |

### Maps & media attributions

- OpenStreetMap copyright (contact map): https://www.openstreetmap.org/copyright
- Map tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` (Leaflet)
- **Unsplash** - used for auth layout imagery and mock catalog photos (`AuthLayout.tsx`, `mockVehicles.ts`)
- **Avatar placeholders** - GitHub / Unavatar sample faces in `Testimonial2.tsx` (demo content only)

### Runtime / product URLs (not “inspiration”, listed once for clarity)

- Production API default: https://api.project-electricity.app
- Local API default (env schema): http://localhost:8080
- Share intents used by the catalog share popover: Twitter/X intent + Facebook sharer (built at runtime from the current page URL)

---

## Notes for markers

- Guest cart uses cookie / `X-Cart-Session`; login can merge into the user cart.
- Chatbot UI is session-light on the client (Zustand messages); backend tools are catalog/FAQ oriented.
- Prefer the root README for seed logins, Docker MySQL/Redis, and backend testing.

---

## License

ISC
