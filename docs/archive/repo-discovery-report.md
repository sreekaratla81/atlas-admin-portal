# Atlas Admin Portal — Discovery Report

**Archived:** Moved to docs/archive/ as part of Documentation IA Phase 2. Historical reference only.

---

## Stack Profile

- **Framework:** React 18 SPA bootstrapped with Vite 4 and React Router 6. 【F:package.json†L1-L32】【F:src/main.tsx†L4-L30】【F:src/router/AppRouter.tsx†L1-L33】
- **State & data:** React Query for caching, Axios for REST calls, IndexedDB (via `idb`) for guest search hydration. 【F:src/main.tsx†L4-L30】【F:src/lib/api.ts†L1-L32】【F:src/services/guests.local.ts†L1-L25】【F:src/db/idb.ts†L1-L26】
- **UI:** MUI 7 (core, lab, x-date-pickers), Recharts, jsPDF, PapaParse. 【F:package.json†L13-L32】【F:src/components/EarningsReport.jsx†L1-L80】
- **Auth:** Auth0 React SDK with local bypass and email allow list enforcement. 【F:src/auth/AuthProvider.tsx†L5-L35】【F:src/auth/RequireAuth.tsx†L1-L15】
- **Build tooling:** ESLint, Prettier (docs), Vitest, Vite build-time guard ensuring HTTPS API base. 【F:package.json†L6-L32】【F:.eslintrc.cjs†L1-L27】【F:vite.config.ts†L5-L33】

## Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server on http://localhost:5173
npm test -- --run    # run Vitest suite
npm run lint         # ESLint (React/TS rules)
npm run format       # Prettier check for docs/config
npm run build        # production build with HTTPS API guard
npm audit            # dependency vulnerability report
```

【F:package.json†L6-L32】【F:vite.config.ts†L5-L33】【0fae28†L1-L16】

## High-Level Architecture

(Original content preserved in full — see git history for complete report.)

---

For current architecture and setup, see README.md and docs/admin-design-system.md.
