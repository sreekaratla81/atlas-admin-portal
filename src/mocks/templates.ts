/**
 * Mock message templates for local UI development and tests.
 * Use when API is unavailable or VITE_USE_MOCK_TEMPLATES=true.
 */

import type { MessageTemplate, ScheduleRule } from "@/types/messaging";

export const mockTemplates: MessageTemplate[] = [
  {
    id: 1,
    tenantId: 1,
    name: "Booking confirmation",
    templateKey: "booking-confirmation",
    eventType: "booking.confirmed",
    channel: "SMS",
    body: "Hi {GuestFirstName}, your booking at {PropertyName} is confirmed. Check-in: {CheckInDate} at {CheckInTime}. Code: {BookingCode}. Questions? {SupportPhone}",
    subject: null,
    variablesUsed: ["GuestFirstName", "PropertyName", "CheckInDate", "CheckInTime", "BookingCode", "SupportPhone"],
    isActive: true,
    scopeType: "Global",
    scopeId: null,
    language: "en",
    templateVersion: 1,
    createdAtUtc: "2025-01-15T10:00:00Z",
    updatedAtUtc: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    tenantId: 1,
    name: "Pre check-in reminder",
    templateKey: "pre-checkin-reminder",
    eventType: "stay.welcome.due",
    channel: "WhatsApp",
    body: "Hello {GuestFirstName}! We look forward to hosting you at {ListingName}. Check-in: {CheckInDate} at {CheckInTime}. Address: {Address}.",
    subject: null,
    variablesUsed: ["GuestFirstName", "ListingName", "CheckInDate", "CheckInTime", "Address"],
    isActive: true,
    scopeType: "Global",
    scopeId: null,
    language: "en",
    templateVersion: 1,
    createdAtUtc: "2025-01-16T09:00:00Z",
    updatedAtUtc: "2025-01-16T09:00:00Z",
  },
];

export const mockScheduleRule: ScheduleRule = {
  scheduleType: "before_checkin",
  offsetMinutes: -24 * 60,
  sendTimeLocal: "10:00",
  timezoneSource: "listing",
  isEnabled: true,
};

export const mockListingIdsByTemplate: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [1, 2],
};
