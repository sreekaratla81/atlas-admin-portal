# Navigation defaults

- Default landing page: `/reservations`. The root route `/` and legacy `/reservation` path both redirect here so admins land on the reservations queue after login.
- Rationale: Reservations is the primary operational view, so it should be the first stop instead of Bookings while keeping `/bookings` available.
- Top nav order (left → right): Reservations, Bookings, Guests, Listings, Properties, Calendar, Channel Manager, Dashboard. Reports and Bank Accounts stay visible alongside these items.
- No “More” menu; on narrow screens the nav wraps or scrolls horizontally so every destination remains reachable.
