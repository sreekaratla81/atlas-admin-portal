# Atlas Admin Portal

Modern React/Vite dashboard used by Atlas Homestays staff to review bookings, listings, guests, and payout reports against the Atlas API. It authenticates with Auth0 (or a local bypass) and caches guest lookups in IndexedDB for responsive search. 【F:src/main.tsx†L4-L30】【F:src/auth/AuthProvider.tsx†L5-L35】【F:src/services/guests.local.ts†L1-L25】【F:src/db/idb.ts†L1-L26】

## TL;DR

- React 18 + Vite SPA that talks to the REST API configured by `VITE_API_BASE` via a shared Axios client. 【F:src/lib/api.ts†L1-L32】【F:src/utils/env.ts†L1-L8】
- Auth0-powered login with optional local bypass and email allow list enforcement. 【F:src/auth/AuthProvider.tsx†L5-L35】【F:src/auth/ProtectedRoute.tsx†L1-L24】【F:src/auth/RequireAuth.tsx†L1-L15】
- Guest search hydrates the `/guests` endpoint into IndexedDB for offline-friendly lookups. 【F:src/services/guests.local.ts†L1-L25】【F:src/db/idb.ts†L1-L26】

## Quickstart

1. **Install prerequisites** – Node.js 18+ and npm 9+.
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Copy the sample environment**
   ```bash
   cp .env.example .env.local
   ```
   Update `VITE_API_BASE`, Auth0 fields, and `VITE_ALLOWED_EMAILS` for your tenant. 【F:.env.example†L1-L12】
4. **Run the dev server**
   ```bash
   npm run dev
   ```
   The app serves at http://localhost:5173. API calls are proxied to `VITE_API_BASE` during development. Do not commit `.env` or `.env.local`; they may contain secrets. 【F:vite.config.ts†L1-L33】
5. **Execute checks**

   ```bash
   npm test -- --run
   npm run lint
   npm run format
   ```

   - `npm test` runs the Vitest suite (React components, hooks, utilities). 【F:package.json†L6-L12】
   - `npm run lint` enforces ESLint with React/TypeScript rules. 【F:package.json†L6-L12】【F:.eslintrc.cjs†L1-L27】
   - `npm run format` verifies Markdown/YAML/JSON formatting with Prettier. 【F:package.json†L6-L12】

**CI:** The CI workflow (`.github/workflows/ci.yml`) runs `npm ci` → lint → build → `npx vitest run` on push to `main`/`dev` and on pull requests. See `CONTRIBUTING.md` for the full PR checklist.

## Documentation

- **CONTRIBUTING.md** — PR checklist, gate workflow, branch rules.
- **docs/messaging-templates-implementation-plan.md** — Messaging templates UI and API integration.
- **docs/admin-design-system.md** — Semantic tokens, status colors, theming.
- **docs/admin-calendar.md** — Availability calendar operator guide.
- **AGENTS.md** — Instructions for AI assistants (gate, CONTRIBUTING).

## Project Map

- `src/main.tsx` – entry point wiring React Query, AuthProvider, router, and error boundary. 【F:src/main.tsx†L4-L30】
- `src/App.tsx` – top-level layout and config guard for API base. 【F:src/App.tsx†L1-L25】
- `src/router/` – route table and `<AppRouter />` tests. 【F:src/router/routes.tsx†L1-L37】【F:src/router/AppRouter.tsx†L1-L33】
- `src/pages/` – feature pages for bookings, guests, listings, properties, bank accounts, and reports. 【F:src/pages/Bookings.jsx†L1-L120】【F:src/pages/Reports.jsx†L1-L37】
- `src/components/` – reusable MUI components (forms, reports, nav bar, error boundary). 【F:src/components/BankAccountForm.jsx†L1-L40】【F:src/components/NavBar.tsx†L1-L120】
- `src/api/` – thin REST clients over the shared Axios instance. 【F:src/api/bookingsApi.js†L1-L21】【F:src/lib/api.ts†L1-L32】
- `src/services/` & `src/db/` – guest hydration service backed by IndexedDB. 【F:src/services/guests.local.ts†L1-L25】【F:src/db/idb.ts†L1-L26】
- `src/config/env.ts` – normalizes Vite env vars (Auth0, email allow-list). 【F:src/config/env.ts†L1-L35】
- `scripts/no-localhost.js` – CI guard against shipping hard-coded `http://localhost` URLs. 【F:scripts/no-localhost.js†L1-L24】
- `docs/admin-design-system.md` – semantic token catalog, status color rules, and seasonal theming guidance for the admin UI.
- `docs/admin-calendar.md` – operator guide to the availability calendar, selection behavior, and bulk actions.

## Common Tasks

- **Authenticate locally** – set `VITE_AUTH_BYPASS=true` and edit `public/auth-bypass.json` with a mock Auth0 profile. 【F:src/auth/AuthProvider.tsx†L5-L18】
- **Update allowed users** – adjust `VITE_ALLOWED_EMAILS` (JSON array or CSV). 【F:src/config/env.ts†L24-L35】
- **Refresh guest cache** – call `hydrateGuests(true)` in DevTools console to force a `/guests` sync. 【F:src/services/guests.local.ts†L13-L25】
- **Use availability mocks** – the dev-only `setupMocks` hook registers an Axios request interceptor that assigns per-request adapters for calendar and property endpoints. Mocking should not overwrite Axios defaults globally. 【F:src/main.tsx†L10-L31】【F:src/mocks/index.ts†L1-L15】【F:src/mocks/availability.ts†L120-L152】
- **Build for production**
  ```bash
  npm run build
  ```
  The build step enforces HTTPS API bases and produces assets in `dist/`. 【F:package.json†L6-L12】【F:vite.config.ts†L5-L20】

## Troubleshooting

- **Blank screen after login** – ensure `VITE_ALLOWED_EMAILS` includes your Auth0 email or disable allow-listing locally. 【F:src/auth/RequireAuth.tsx†L1-L15】
- **API requests hitting localhost in production** – `getApiBase` throws if a production build points to localhost; confirm deployment env vars. 【F:src/utils/env.ts†L1-L8】
- **Auth redirect loops** – Auth0 redirect uses `VITE_AUTH0_CALLBACK_PATH`; verify the callback is allowed in your Auth0 app. 【F:src/auth/AuthProvider.tsx†L20-L33】
- **CORS errors during development** – Vite proxies `/api` to `VITE_API_BASE`; set it to your backend origin or adjust the proxy target. 【F:vite.config.ts†L21-L33】
