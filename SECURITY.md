# Security Notes

## Secrets & Configuration

- Store secrets (Auth0 client ID, domain, API base) in environment variables prefixed with `VITE_`. Never commit `.env.local`. 【F:.env.example†L1-L12】【F:.gitignore†L1-L40】
- Production builds fail if `VITE_API_BASE` is empty or non-HTTPS, guarding against misdirected traffic. 【F:src/App.tsx†L7-L15】【F:vite.config.ts†L5-L20】
- `scripts/no-localhost.js` scans source files during build to prevent `http://localhost` URLs from shipping. 【F:scripts/no-localhost.js†L1-L24】

## Authentication & Authorization

- Auth0 handles primary authentication; bypass mode is for local development only and should remain disabled in hosted environments. 【F:src/auth/AuthProvider.tsx†L5-L35】
- Authorization is enforced client-side via an email allow list. Keep `VITE_ALLOWED_EMAILS` accurate and avoid storing privileged roles in the browser. 【F:src/auth/RequireAuth.tsx†L1-L15】【F:src/config/env.ts†L24-L35】

## Data Protection

- Guest data is cached locally in IndexedDB. Clearing the cache (`hydrateGuests(true)`) removes stored PII from the browser. 【F:src/services/guests.local.ts†L13-L25】【F:src/db/idb.ts†L1-L26】
- Axios responses are checked for JSON content type; non-JSON responses log errors for investigation. 【F:src/lib/api.ts†L1-L32】

## Dependency Hygiene

- Run `npm audit` regularly and address high severity findings. Automated builds should fail if unresolved critical vulnerabilities remain.
- Use `npm run lint` to surface risky patterns (unused code, missing hooks deps) before merging. 【F:package.json†L6-L12】【F:.eslintrc.cjs†L1-L27】

## Reporting Issues

Report suspected vulnerabilities privately to the maintainers before disclosure. Include reproduction steps, environment details, and any relevant network traces.
