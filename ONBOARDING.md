# Onboarding Guide

Welcome to the Atlas Admin Portal project! This guide walks you from cloning the repo to shipping your first pull request in roughly 90 minutes.

## 0–30 Minutes: Environment Setup

1. **Clone & install**
   ```bash
   npm install
   ```
   Installs the React/Vite toolchain plus testing, linting, and formatting dependencies. 【F:package.json†L1-L32】
2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit the copy to point `VITE_API_BASE` at a backend, toggle Auth0 bypass, and seed allowed emails. 【F:.env.example†L1-L12】【F:src/config/env.ts†L1-L35】
3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Vite serves the app on http://localhost:5173 and proxies `/api` requests to the configured backend. 【F:package.json†L6-L12】【F:vite.config.ts†L21-L33】

## 30–60 Minutes: Smoke Tests & Checks

1. **Open the app** – Visit http://localhost:5173, log in via Auth0 or bypass mode, and confirm navigation across Bookings, Listings, Guests, Properties, Reports, and Bank Accounts. 【F:src/router/routes.tsx†L1-L37】
2. **Run automated tests**
   ```bash
   npm test -- --run
   ```
   Executes Vitest suites for hooks, routing, env helpers, and utilities. 【F:package.json†L6-L12】
3. **Run static analysis**
   ```bash
   npm run lint
   npm run format
   ```
   ESLint surfaces risky code patterns while Prettier validates Markdown/YAML/JSON formatting. 【F:package.json†L6-L12】【F:.eslintrc.cjs†L1-L27】

## 60–90 Minutes: Explore the Codebase

1. **Study routing & auth** – `src/router/routes.tsx` shows which pages are behind `<ProtectedRoute />`. Inspect `AuthProvider` to learn how Auth0 bypass and redirect handling work. 【F:src/router/routes.tsx†L1-L37】【F:src/auth/ProtectedRoute.tsx†L1-L24】【F:src/auth/AuthProvider.tsx†L5-L35】
2. **Review API access** – `src/lib/api.ts` centralizes Axios configuration, while `src/api/*` wrappers enumerate REST endpoints. 【F:src/lib/api.ts†L1-L32】【F:src/api/bookingsApi.js†L1-L21】
3. **Understand guest caching** – `src/services/guests.local.ts` hydrates `/guests` into IndexedDB, and `src/db/idb.ts` defines the schema. 【F:src/services/guests.local.ts†L1-L25】【F:src/db/idb.ts†L1-L26】
4. **Skim feature pages** – Each page under `src/pages/` is a self-contained view built atop MUI components and the shared API helpers. 【F:src/pages/Bookings.jsx†L1-L120】【F:src/pages/BankAccountsPage.jsx†L1-L120】

## First Contribution

Ready to try a change? Start with the “Remove unused report imports” task in [`docs/first-pr.md`](docs/first-pr.md). It trims unused imports from `src/pages/Reports.jsx` to silence lint warnings and improve clarity. 【F:src/pages/Reports.jsx†L1-L37】

## Glossary

- **Auth bypass** – Local-only mode that skips Auth0 when `VITE_AUTH_DISABLED` or `VITE_AUTH_BYPASS` is true. 【F:src/auth/AuthProvider.tsx†L5-L18】
- **Allowed emails** – Email allow-list enforced post-authentication via `RequireAuth`. 【F:src/auth/RequireAuth.tsx†L1-L15】【F:src/config/env.ts†L24-L35】
- **Hydrate guests** – Process of fetching `/guests`, normalizing results, and storing them in IndexedDB for typeahead search. 【F:src/services/guests.local.ts†L1-L25】【F:src/db/idb.ts†L1-L26】
- **API base** – Root URL for REST calls, derived from `VITE_API_BASE` with safeguards against localhost in production builds. 【F:src/utils/env.ts†L1-L8】【F:src/lib/api.ts†L1-L32】
