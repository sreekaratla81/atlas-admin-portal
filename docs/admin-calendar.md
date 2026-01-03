# Admin Calendar (Availability)

The Admin Calendar page lets operations teams review day-level availability and update blocks or prices in bulk for a listing. It lives at **Calendar → Availability** (route: `/calendar/availability`).

## How to use the page

1. **Filter the grid**
   - **Property**: choose a property to scope the listings; leave blank for all properties.
   - **Range**: pick 30/60/90 days to control how many columns load.
   - **From**: select the starting date for the grid.
   - **Listing search**: narrow the listing rows by name.
2. **Review day status**
   - Each row represents a listing.
   - Each cell shows the nightly price (₹) or “—” if no price is set.
   - Background colors indicate open vs blocked days (weekends have a slightly stronger tint).
   - Hover a cell to see the status tooltip (block type/reason, if present).
3. **Refresh**
   - Use **Refresh** to re-fetch the property list and calendar data with the current filters.

## API assumptions

The page assumes the following endpoints and response shapes:

- **GET `/properties`**
  - Returns `{ properties: [{ id, name }] }` or a top-level array.
- **GET `/availability/calendar`** with query params:
  - `propertyId` (optional), `from` (YYYY-MM-DD), `to` (YYYY-MM-DD).
  - Returns a `listings` array (or `data`/top-level array) with:
    - `listingId`, `listingName`
    - `days`: either an array of `{ date, status, price?, blockType?, reason? }` or a keyed object by date.
- **POST `/availability/blocks/bulk`**
  - Payload: `{ listingId, dates, status: "blocked" | "open", blockType? }`
- **POST `/pricing/daily/bulk`**
  - Payload: `{ listingId, dates, price }`

The UI normalizes array-form `days` into a `Record<date, day>` and treats missing entries as open days with no price.

## Selection behavior

- **Single listing selection**: you can only select dates within one listing row at a time.
- **Click + drag**: click a cell to set the anchor date, then drag to expand the contiguous range.
- **Shift-click**: when the anchor date is set, shift-click sets the range from the anchor to the clicked date.
- **Range normalization**: if the drag ends before the anchor date, the selection is normalized to the earlier → later date.
- **Selection resets**: changing the property filter, date range, or start date clears the selection.

## Bulk actions

Bulk actions apply to the current selection and open a modal to confirm settings before saving:

- **Block**
  - Sets selected dates to `blocked` and requires a block type (`Maintenance`, `OwnerHold`, `OpsHold`).
- **Unblock**
  - Sets selected dates to `open` and clears existing block metadata.
- **Set Price**
  - Sets the nightly price for the selected dates (leave blank to skip price updates).

When you click **Save**:

- The UI applies an optimistic update in the grid.
- It sends the relevant bulk request(s) based on the chosen action(s).
- On failure, it reverts the grid and shows an error notice.
