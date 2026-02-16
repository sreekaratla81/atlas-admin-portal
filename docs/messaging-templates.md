# Message Templates & Scheduling

This document describes the Message Templates and Scheduling feature in the admin portal (Airbnb-like flow) and how to test it.

## Overview

Staff can:

- **Create and edit message templates** for SMS, WhatsApp, and Email.
- **Insert variable chips** (e.g. `{GuestFirstName}`, `{PropertyName}`, `{CheckInDate}`) into the message body.
- **Assign templates to listings** (multi-select) and **schedule send timing** relative to booking/check-in/checkout (in listing timezone).
- **Review** template, selected listings, and schedule before saving.
- The backend scheduler/Service Bus pipeline sends messages; the admin portal configures templates and schedules.

## User flows

### 1. Create a template

1. Go to **Message templates** in the top nav.
2. Click **New template**.
3. Enter **Template name** (e.g. "Booking confirmation").
4. Select **Channel**: SMS, WhatsApp, or Email.
5. (Optional for Email) Enter **Subject**.
6. In **Message**, type your text and click variable chips to insert placeholders (e.g. `{GuestFirstName}`, `{CheckInDate}`).
7. In the right **Review template** panel:
   - **Choose listings**: multi-select the listings this template applies to (e.g. "8 selected").
   - **Scheduled for**: click **Schedule message** to open the modal.
8. In **Schedule message** modal:
   - Choose one of: **Don't schedule**, **5 minutes after guest books**, **1 day before check-in at 10:00am**, **1 day before checkout at 6:00pm**, or **Custom time**.
   - For custom, set offset (minutes) and optional send time (HH:mm) in listing timezone.
   - Click **Apply**.
9. Click **Save**.

### 2. Edit / Duplicate / Enable / Disable / Delete

- **Template list**: use filters by **Channel** and **Status** (Enabled/Disabled).
- **Edit**: open a template and change name, channel, body, listings, or schedule; save.
- **Duplicate**: creates a copy (opens new template form with same content; name has " (copy)").
- **Enable / Disable**: toggle without opening the form.
- **Delete**: confirm and remove the template.

### 3. Messages page

- **Messages** in the nav is a stub: it will show template runs and scheduled items once the API is connected.

## Variable placeholders

Supported chips (inserted as `{Name}` in the body):

| Variable         | Description          |
|------------------|----------------------|
| GuestFirstName   | Guest first name     |
| GuestLastName    | Guest last name      |
| PropertyName     | Property name        |
| ListingName      | Listing name         |
| CheckInDate      | Check-in date        |
| CheckInTime      | Check-in time        |
| CheckOutDate     | Check-out date       |
| CheckOutTime     | Check-out time       |
| BookingCode      | Booking code         |
| SupportPhone     | Support phone        |
| Address          | Address              |

## Schedule options

| Option                          | Meaning                                      |
|---------------------------------|----------------------------------------------|
| Don't schedule                  | No automatic send.                           |
| 5 minutes after guest books     | Send 5 minutes after booking confirmation.  |
| 1 day before check-in at 10:00am | Send at 10:00 AM in listing timezone, 1 day before check-in. |
| 1 day before checkout at 6:00pm  | Send at 6:00 PM in listing timezone, 1 day before checkout.  |
| Custom time                     | Set offset (minutes, before/after) and optional clock time.   |

The preview panel shows a short summary (e.g. "5 minutes after a guest books", "1 day before check-in at 10:00 AM").

## API contract

The portal uses:

- `GET/POST /api/message-templates`, `GET/PUT/DELETE /api/message-templates/{id}` (Atlas API).
- `GET /listings` for the listing selector.
- Optional (if added): `POST /api/template-assignments`, `PUT /api/message-templates/{id}/schedule`.

Tenant context is sent via the existing `X-Tenant-Slug` header (tenant store / env).

## Screenshots (placeholders)

- _Screenshot: Template list with filters and table._
- _Screenshot: Create/Edit template with message editor, variable chips, and preview panel._
- _Screenshot: Schedule message modal with options._

---

## Sanity test checklist (manual E2E)

Use this to verify the feature end-to-end.

- [ ] **Nav**: "Message templates" and "Messages" appear in the top nav and link to the correct pages.
- [ ] **List**: Open Message templates; table loads (or mock data if API unavailable). Filters (Channel, Status) work.
- [ ] **New template**: Click New template. Enter name, select SMS, type a message, insert a variable chip; body updates. Save (with API) or see validation (name required, SMS length).
- [ ] **Preview panel**: On create/edit, right panel shows "Choose listings" and "Scheduled for". Select a few listings; count or "X selected" updates.
- [ ] **Schedule modal**: Click "Schedule message". Select "5 minutes after guest books"; Apply. Preview shows "5 minutes after a guest books". Reopen; select "1 day before check-in at 10:00am"; Apply. Preview shows "1 day before check-in at 10:00 AM".
- [ ] **Edit**: Open an existing template; change body; save. List reflects change.
- [ ] **Duplicate**: Duplicate a template; new form opens with same content and " (copy)" in name.
- [ ] **Enable/Disable**: Toggle a template; list status chip updates.
- [ ] **Delete**: Delete a template (confirm); it disappears from the list.
- [ ] **Messages page**: Open Messages; stub text is visible (no errors).
