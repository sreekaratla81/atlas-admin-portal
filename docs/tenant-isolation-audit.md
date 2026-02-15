# Admin Portal — Tenant Isolation Audit

## Step 1 — Integration points (no code changes)

### API client
- **`src/lib/api.ts`**: Axios instance with `baseURL` from `getApiBase()` (`src/utils/env.ts`). No interceptors that add headers. No tenant header attached.
- **`src/lib/http.ts`**: `apiFetch(path, init)` uses `getApiBase()` for relative paths; no tenant header. Used by DevConfig for `/api/health` only.

### Auth and user profile
- **`src/auth/AuthProvider.tsx`**: Wraps app with Auth0Provider (domain, clientId, redirectUri). No tenant in config.
- **`src/auth/useEffectiveAuth.ts`**: Returns `effectiveUser` (Auth0 user or `{ email: 'local@dev' }` when bypass), `effectiveIsAuthenticated`, `loginWithRedirect`, `logout`. No tenantId/tenantSlug read from user.
- **`src/config/env.ts`**: `getAuthConfig()`, `getAllowedEmails()`, `ENV`. No `VITE_TENANT_SLUG` or tenant storage.

### Tenant storage
- No tenantId/tenantSlug in localStorage, sessionStorage, or URL query params.
- No tenant picker or tenant selection UI.

### Screens and API usage
| Screen | File | API calls |
|--------|------|-----------|
| Properties | `src/pages/Properties.jsx` | `GET/POST/PUT/DELETE /properties` via `api` |
| Listings | `src/pages/Listings.jsx` | `GET /listings`, `GET /properties`, `POST/PUT/DELETE /listings` |
| Bookings | `src/pages/Bookings.jsx` | `GET /bookings?checkinStart&checkinEnd`, `GET /listings`, `GET /bankaccounts`, `GET /guests`, `POST/PUT/DELETE /bookings` |
| Guests | `src/pages/Guests.jsx` | `GET/POST/PUT/DELETE /guests` |
| Reservation | `src/pages/Reservation.tsx` | `GET /bookings`, `GET /listings` |
| Calendar | `src/pages/calendar/AvailabilityCalendar.tsx` | `GET /properties`, `GET /listings`, `fetchCalendarData` → `GET /availability/listing-availability`, `patchAvailabilityAdmin` → `PATCH /availability/update-inventory` (and update-price) |
| Dashboard | `src/pages/Dashboard.tsx` | `GET /bookings` |
| Bank Accounts | `src/pages/BankAccountsPage.jsx` + `src/api/bankAccountsApi.js` | `GET/POST/PUT/DELETE /bankaccounts`, `GET /reports/bank-account-earnings` |
| Reports | EarningsReport, SingleCalendarEarningsReport, etc. | `GET /admin/reports/earnings/monthly`, `GET /admin/reports/bookings`, `GET /admin/reports/listings`, etc. |

All calls use the shared `api` (axios) from `@/lib/api`; no call attaches a tenant header.

---

## Step 2 — Tenant isolation audit

### Contract (api-contract.md)
- **Tenant resolution**: `X-Tenant-Slug` header. Precedence: (1) header, (2) subdomain, (3) default `atlas` in dev only. Production rejects requests without a resolvable tenant.
- **Backend**: Tenant-scoped via EF global filters (`TenantId`). Clients must **not** pass `tenantId` in payloads.

### Per-screen audit

| Screen | Endpoint(s) | Tenant context source | Tenant header attached? | Cross-tenant by ID risk |
|--------|-------------|------------------------|-------------------------|--------------------------|
| Properties | GET/POST/PUT/DELETE /properties | None | No | Yes — user could call PUT /properties/999 (other tenant’s id); API returns 404 if not owned. |
| Listings | GET /listings, /properties, POST/PUT/DELETE /listings | None | No | Same — edit/delete by id; API 404 when wrong tenant. |
| Bookings | GET /bookings, POST/PUT/DELETE /bookings, GET /listings, /bankaccounts, /guests | None | No | PUT/DELETE /bookings/{id}; API 404 for wrong tenant. List is already tenant-scoped once header is sent. |
| Guests | GET/POST/PUT/DELETE /guests | None | No | Same. |
| Reservation | GET /bookings, GET /listings | None | No | List only; no by-id route. |
| Calendar | GET /listings, /properties, /availability/listing-availability, PATCH update-inventory (update-price) | None | No | Listing ids come from tenant-scoped list once header is set. |
| Dashboard | GET /bookings | None | No | List only. |
| Bank Accounts | GET/POST/PUT/DELETE /bankaccounts, GET /reports/... | None | No | By-id operations; API 404 when wrong tenant. |
| Reports | GET /admin/reports/* | None | No | Tenant-scoped by backend when header is sent. |

### Summary
- **Tenant context**: Currently **none**. Must be derived from (1) authenticated user profile (e.g. Auth0 `app_metadata.tenantSlug`) or (2) build-time/env fallback (`VITE_TENANT_SLUG`) for single-tenant or dev.
- **Header**: **X-Tenant-Slug** must be attached to **every** request. Single place: axios request interceptor in `lib/api.ts`.
- **Cross-tenant by ID**: Backend returns 404 (or 403) for resources not owned by the resolved tenant. UI must **not** send TenantId in payloads; UI should show “Not found” and optionally navigate back when API returns 404/403.

---

## Deliverables (implementation summary)

### Files changed
- **New**: `docs/tenant-isolation-audit.md`, `src/tenant/store.ts`, `src/tenant/store.test.ts`, `src/auth/TenantSync.tsx`, `src/lib/api.test.ts`.
- **Modified**: `src/config/env.ts` (VITE_TENANT_SLUG, getTenantSlugFromEnv), `src/lib/api.ts` (request interceptor X-Tenant-Slug, response interceptor 404/403 message, export addTenantHeader), `src/main.tsx` (initTenantFromEnv, TenantSync), `src/pages/Bookings.jsx` (GET /bookings with params.include and date params).

### Tenant flow (source → storage → header)
1. **Source**: (1) Auth0 user `app_metadata.tenantSlug` when present (set in Auth0 dashboard or rules), (2) fallback `VITE_TENANT_SLUG` from env (build/deploy config). Never from URL or user input.
2. **Storage**: In-memory only in `src/tenant/store.ts` (`getTenantSlug()` / `setTenantSlug()`). No localStorage/query. `initTenantFromEnv()` runs at app load; `TenantSync` (inside AuthProvider) sets slug from user profile when authenticated.
3. **Header**: Axios request interceptor in `src/lib/api.ts` calls `getTenantSlug()` and, when non-null, sets `X-Tenant-Slug` on every request. No component can override or omit it; single source of truth.

### Endpoint updates (before → after)
| Area | Before | After |
|------|--------|--------|
| All API requests | No tenant header | **X-Tenant-Slug** set by interceptor when slug is resolved |
| GET /bookings (Bookings.jsx) | Query string built manually; no include | `params.checkinStart`, `checkinEnd`, `include: 'guest'` |
| 404/403 responses | Generic axios error | `err.message` set to “Not found…” / “You don’t have access…” for consistent UX |

### Test commands + results
- `npx vitest run src/tenant/store.test.ts src/lib/api.test.ts` — **6 tests passed** (store get/set/trim/init; addTenantHeader sets/omits header).
- `npm run build` — (run locally to confirm).
- Existing routes test “renders calendar” may still fail (pre-existing “Mock Calendar” text); tenant/API tests are green.
