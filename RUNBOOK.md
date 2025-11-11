# Runbook

This runbook captures the minimum steps to operate and troubleshoot the Atlas Admin Portal in development and production-like environments.

## Start & Smoke Test

1. **Start the frontend**

   ```bash
   npm run dev
   ```

   - Serves the SPA on http://localhost:5173.
   - Proxies `/api` to the backend defined by `VITE_API_BASE` (defaults to `http://localhost:5287`). 【F:vite.config.ts†L21-L33】

2. **Verify authentication**
   - With Auth0 enabled, confirm that the hosted login page loads and returns to `/bookings` post-login. 【F:src/auth/AuthProvider.tsx†L5-L35】【F:src/router/routes.tsx†L1-L26】
   - For local bypass, set `VITE_AUTH_BYPASS=true` and refresh; the nav bar should render without a redirect. 【F:src/auth/AuthProvider.tsx†L5-L18】
3. **Check core data flows**
   - Bookings list: inspect the network tab for `GET /bookings?include=bankAccount`. 【F:src/api/bookingsApi.js†L1-L21】
   - Guests search: ensure `/guests` loads once and subsequent searches hit IndexedDB. 【F:src/services/guests.local.ts†L1-L25】【F:src/db/idb.ts†L1-L26】
   - Reports: confirm `/admin/reports/earnings/monthly` and related endpoints respond. 【F:src/components/EarningsReport.jsx†L1-L80】

## Operational Checks

- **Build validation**
  ```bash
  npm run build
  ```
  Fails if `VITE_API_BASE` is missing or not HTTPS, preventing misconfigured deployments. 【F:package.json†L6-L12】【F:vite.config.ts†L5-L20】
- **Static analysis** – Run `npm run lint` to detect unused code or unsafe patterns before releases. 【F:package.json†L6-L12】
- **Dependency audit**
  ```bash
  npm audit
  ```
  Review reported vulnerabilities and upgrade dependencies as needed.

## Troubleshooting Playbook

- **Stuck on blank screen after login** – Ensure the signed-in email is present in `VITE_ALLOWED_EMAILS` or temporarily enable bypass. 【F:src/auth/RequireAuth.tsx†L1-L15】【F:src/config/env.ts†L24-L35】
- **Guest search returns nothing** – Force a hydration refresh by running `hydrateGuests(true)` in the browser console, which re-fetches `/guests` and resets the IndexedDB cache. 【F:src/services/guests.local.ts†L13-L25】
- **API requests go to localhost in production** – `getApiBase` throws if the base URL contains `localhost`. Verify deployment env variables for `VITE_API_BASE`. 【F:src/utils/env.ts†L1-L8】
- **403/401 errors after login** – Confirm Auth0 callback path (`VITE_AUTH0_CALLBACK_PATH`) matches the value configured in Auth0 and that allowed emails include the user. 【F:src/auth/AuthProvider.tsx†L20-L33】【F:src/auth/RequireAuth.tsx†L1-L15】
- **Proxy not forwarding** – Restart `npm run dev` after changing `VITE_API_BASE`; Vite reads env vars at process start. 【F:vite.config.ts†L21-L33】

## Reset Procedures

- **Clear guest cache** – Run in console:
  ```js
  await indexedDB.databases(); // confirm access
  await window.caches?.delete?.(''); // optional
  await import('/src/services/guests.local.ts').then((m) => m.hydrateGuests(true));
  ```
  Or manually clear localStorage key `guest_cache_ts_v1` and the `atlas-admin` IndexedDB database. 【F:src/services/guests.local.ts†L6-L25】【F:src/db/idb.ts†L1-L26】
- **Auth reset** – Delete Auth0 cookies/localStorage entries or toggle bypass flags to regain access during testing. 【F:src/auth/AuthProvider.tsx†L5-L18】

## Observability

- **Logs** – Use the browser console; network errors are surfaced via Axios interceptors logging non-JSON responses. 【F:src/lib/api.ts†L1-L32】
- **Metrics** – None built-in; rely on backend observability for API latency and error rates.

## Escalation

- For persistent backend failures, coordinate with the Atlas API maintainers (see `atlas-api` repository) and capture failing request payloads from the browser dev tools.
