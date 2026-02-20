/**
 * Message templates and scheduling types.
 * Aligns with Atlas API message-templates and optional assignment/schedule APIs.
 */

export type Channel = "SMS" | "WhatsApp" | "Email";

export type ScheduleType =
  | "none"
  | "after_booking"
  | "before_checkin"
  | "before_checkout"
  | "custom";

export interface ScheduleRule {
  scheduleType: ScheduleType;
  offsetMinutes: number;
  sendTimeLocal?: string;
  timezoneSource: "listing";
  isEnabled: boolean;
}

export interface MessageTemplate {
  id: number;
  tenantId: number;
  name?: string;
  templateKey?: string | null;
  eventType: string;
  channel: Channel;
  body: string;
  subject?: string | null;
  variablesUsed?: string[];
  isActive: boolean;
  scopeType: string;
  scopeId?: number | null;
  language: string;
  templateVersion: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface MessageTemplateCreateUpdate {
  templateKey?: string | null;
  eventType: string;
  channel: Channel;
  scopeType: string;
  scopeId?: number | null;
  language: string;
  templateVersion: number;
  isActive: boolean;
  subject?: string | null;
  body: string;
}

export interface TemplateAssignment {
  templateId: number;
  listingIds: number[];
}

/** Variable placeholders for chips (use {Name} in body). */
export const TEMPLATE_VARIABLES = [
  { key: "GuestFirstName", label: "Guest first name" },
  { key: "GuestLastName", label: "Guest last name" },
  { key: "PropertyName", label: "Property name" },
  { key: "ListingName", label: "Listing name" },
  { key: "CheckInDate", label: "Check-in date" },
  { key: "CheckInTime", label: "Check-in time" },
  { key: "CheckOutDate", label: "Check-out date" },
  { key: "CheckOutTime", label: "Check-out time" },
  { key: "BookingCode", label: "Booking code" },
  { key: "SupportPhone", label: "Support phone" },
  { key: "Address", label: "Address" },
] as const;

export type TemplateVariableKey = (typeof TEMPLATE_VARIABLES)[number]["key"];

/** Extract variable keys from body (e.g. {GuestFirstName} -> GuestFirstName). */
export function parseVariablesFromBody(body: string): string[] {
  const matches = body.match(/\{(\w+)\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}
