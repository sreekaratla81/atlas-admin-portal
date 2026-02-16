# Message Templates + Scheduling — Implementation Plan

**Objective:** Airbnb-like Message Templates and Scheduling in atlas-admin-portal, wired to Atlas API.

## File checklist

### 1. Types & constants
- [ ] **Create** `src/types/messaging.ts` — `MessageTemplate`, `ScheduleRule`, `TemplateAssignment`, `TEMPLATE_VARIABLES` (chips), schedule type enum
- [ ] **Create** `src/constants/scheduleOptions.ts` — human-readable schedule options (none, 5 min after booking, 1 day before check-in 10am, etc.)

### 2. API client
- [ ] **Create** `src/api/templatesApi.ts` — `getTemplates()`, `getTemplate(id)`, `createTemplate()`, `updateTemplate()`, `deleteTemplate()` (use existing `/api/message-templates`)
- [ ] **Create** `src/api/templateAssignmentsApi.ts` — `saveAssignments(templateId, listingIds[])` (POST template-assignments or extend API)
- [ ] **Create** `src/api/templateScheduleApi.ts` — `updateSchedule(templateId, scheduleRule)` (PUT templates/{id}/schedule or extend API)
- [ ] **Use** existing `api.get('/listings')` for listing selector

### 3. Mock data (for UI-first)
- [ ] **Create** `src/mocks/templates.ts` — mock templates, assignments, schedule rules for local dev
- [ ] **Optional** feature flag or env to use mock vs real API

### 4. Template list page
- [ ] **Create** `src/pages/messaging/TemplatesPage.tsx` — table/grid, filters (channel, status, schedule type), quick actions (Edit, Duplicate, Enable/Disable, Delete)
- [ ] **Create** `src/pages/messaging/index.ts` — barrel export

### 5. Template create/edit page
- [ ] **Create** `src/pages/messaging/TemplateEditPage.tsx` — template name, channel (SMS/WhatsApp/Email), message editor with variable chips, preview panel (listings count, schedule summary), "Schedule message" button → modal
- [ ] **Create** `src/components/messaging/VariableChipBar.tsx` — clickable chips to insert `{GuestFirstName}`, `{PropertyName}`, etc. into body
- [ ] **Create** `src/components/messaging/ScheduleMessageModal.tsx` — options: Don't schedule, 5 min after booking, 1 day before check-in 10:00am, 1 day before checkout 6:00pm, Custom (relative + time); Apply/Cancel
- [ ] **Create** `src/components/messaging/ListingMultiSelect.tsx` — multi-select listings with "X selected"
- [ ] **Create** `src/components/messaging/PreviewPanel.tsx` — "Review template" right side: selected listings count, schedule summary

### 6. Messages page (stub)
- [ ] **Create** `src/pages/messaging/MessagesPage.tsx` — simple stub (e.g. "Template runs / scheduled items" placeholder), ready for API later

### 7. Navigation & routing
- [ ] **Edit** `src/router/routes.tsx` — add `/messaging`, `/messaging/templates`, `/messaging/templates/new`, `/messaging/templates/:id`, `/messaging/messages`
- [ ] **Edit** `src/components/NavBar.tsx` — add "Messages" (or "Messaging") with sub-links or single entry to templates

### 8. Validation & UX
- [ ] Template name required; body length limits for SMS; variables must be from known list; schedule rule coherent
- [ ] Human-readable schedule summary: "5 minutes after a guest books", "1 day before check-in at 10:00 AM", "Custom: 2 hours before checkout at 6:00 PM"

### 9. Atlas API (if missing)
- [ ] **Optional** `POST /api/template-assignments` — body `{ templateId, listingIds[] }` (create controller/table if needed)
- [ ] **Optional** `PUT /api/message-templates/{id}/schedule` — body `{ scheduleType, offsetMinutes, sendTimeLocal, timezoneSource, isEnabled }` (extend MessageTemplatesController or new table)
- **Note:** Schedule rule and selected listing IDs are held in portal state; when these endpoints exist, wire them in `templatesApi.ts` and persist on save.

### 10. Docs & testing
- [ ] **Create** `docs/messaging-templates.md` — user steps, screenshot placeholders
- [ ] **Add** sanity test checklist (manual E2E steps)
- [ ] **Add** basic component tests where project supports (e.g. ScheduleMessageModal, VariableChipBar)

---

## API contract (portal ↔ atlas-api)

| Endpoint | Method | Notes |
|----------|--------|--------|
| `/api/message-templates` | GET | Query: eventType?, channel?, isActive?, page, pageSize |
| `/api/message-templates` | POST | Body: TemplateKey?, EventType, Channel, ScopeType, ScopeId?, Language, TemplateVersion, IsActive, Subject?, Body |
| `/api/message-templates/{id}` | GET, PUT, DELETE | Same DTOs |
| `/api/template-assignments` | POST | Body: { templateId, listingIds[] } — *add if missing* |
| `/api/message-templates/{id}/schedule` | PUT | Body: scheduleRule — *add if missing* |
| `/listings` | GET | Existing; for listing selector |

**Field mapping (API → portal):**  
- `name` → TemplateKey (or EventType for display)  
- `isEnabled` → IsActive  
- `variablesUsed` → derived on frontend from body (e.g. `\{(\w+)\}`)

---

## Implementation order

1. Types + constants + mock data  
2. API client (message-templates only first)  
3. Templates list page  
4. Template edit page + variable chips + preview panel + schedule modal  
5. Messages stub + routes + nav  
6. Optional API extensions (assignments, schedule)  
7. Docs + sanity checklist + tests  
