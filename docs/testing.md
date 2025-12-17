# UI smoke tests

Run the vitest suite:

```
npm test
```

Coverage:
- Ensures Reservation page renders and the **Create Manual Booking** CTA is present.
- Confirms existing routes (Listings, Guests, Properties, Reports, Bank Accounts) render without auth redirects when ProtectedRoute is mocked.
- Confirms new routes render: `/dashboard`, `/calendar`, `/channel-manager`.
