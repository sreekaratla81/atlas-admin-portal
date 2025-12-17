# Admin UI shell and navigation strategy

## Layout approach
- A new `AdminShellLayout` introduces the HomeyHuts-inspired top navigation, shared spacing tokens, and reusable primitives (`Card`, `Button`, `Tabs`, `DataTable`).
- Legacy pages stay on `LegacyLayout` (keeps the existing experience) so that no existing routes break. New pages opt into the shell first.
- Consistent spacing comes from `src/style.css` variables (padding, radii, nav height) and the `shell-*` utility classes.
- `?kiosk=1` query flag activates kiosk-friendly nav sizing inside the shell.

## Navigation rules
- Default landing route: `/reservations` (root `/` redirects here; legacy `/reservation` also forwards).
- Top nav order (left → right): Reservations, Bookings, Guests, Listings, Properties, Calendar, Channel Manager, Dashboard.
- Reports and Bank Accounts remain accessible directly in the top nav (no **More** menu).
- No “More” menu; on small screens the nav wraps or scrolls horizontally so every item stays visible.
- Do not remove legacy navigation; additions only.

## DTO notes
- Dashboard queues (`useDashboardQueues`):
  ```ts
  type DashboardBooking = {
    bookingId: string;
    dateRange: string;
    property: string;
    guest: { name: string; phone: string };
    source: string;
    status: string;
  };
  ```
- Unified calendar (`useUnifiedCalendar`):
  ```ts
  type CalendarProperty = { id: string; name: string; location?: string };
  type CalendarBooking = { id: string; propertyId: string; guest: string; source?: string; start: string; end: string };
  ```
- Both hooks currently mock data but are structured so React Query/REST calls can replace them without touching the UI.

## Reservation UI polish (no behavior changes)
- Filters are aligned into a padded bar; table headers are sticky with row hover states.
- Status chips now use consistent badge styling; pagination and dialogs remain unchanged.
- Left filter groups retain all counts but use tighter spacing and subtle backgrounds for hierarchy.

## Future changes
- When converting legacy pages to the shell, ensure feature parity before removing `LegacyLayout` wrappers.
- Add real API integrations to dashboard/calendar hooks to avoid UI rewrites.
