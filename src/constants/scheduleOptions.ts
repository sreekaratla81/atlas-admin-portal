/**
 * Human-readable schedule options for the "Schedule message" modal.
 * Matches ScheduleType and provides display labels and default values.
 */

import type { ScheduleType } from "@/types/messaging";

export interface ScheduleOption {
  value: ScheduleType;
  label: string;
  description?: string;
  /** Default offset in minutes (e.g. 5 for 5 min after, -1440 for 1 day before). */
  defaultOffsetMinutes?: number;
  /** Default send time for "before" rules (e.g. "10:00" for 10am). */
  defaultSendTimeLocal?: string;
}

export const SCHEDULE_OPTIONS: ScheduleOption[] = [
  { value: "none", label: "Don't schedule" },
  {
    value: "after_booking",
    label: "5 minutes after guest books",
    defaultOffsetMinutes: 5,
  },
  {
    value: "before_checkin",
    label: "1 day before check-in at 10:00am",
    defaultOffsetMinutes: -24 * 60,
    defaultSendTimeLocal: "10:00",
  },
  {
    value: "before_checkout",
    label: "1 day before checkout at 6:00pm",
    defaultOffsetMinutes: -24 * 60,
    defaultSendTimeLocal: "18:00",
  },
  {
    value: "custom",
    label: "Custom time",
    description: "Set relative time and clock time",
  },
];

/** Format schedule rule for display in preview. */
export function formatScheduleSummary(
  scheduleType: ScheduleType,
  offsetMinutes: number,
  sendTimeLocal?: string
): string {
  if (scheduleType === "none") return "Not scheduled";
  if (scheduleType === "after_booking") {
    if (offsetMinutes <= 0) return "Not scheduled";
    if (offsetMinutes < 60) return `${offsetMinutes} minutes after a guest books`;
    const h = Math.floor(offsetMinutes / 60);
    return h === 1 ? "1 hour after a guest books" : `${h} hours after a guest books`;
  }
  if (scheduleType === "before_checkin" || scheduleType === "before_checkout") {
    const abs = Math.abs(offsetMinutes);
    const days = Math.floor(abs / (24 * 60));
    const hours = Math.floor((abs % (24 * 60)) / 60);
    const timeStr = sendTimeLocal
      ? ` at ${formatTimeForDisplay(sendTimeLocal)}`
      : "";
    if (days >= 1) {
      const dayStr = days === 1 ? "1 day" : `${days} days`;
      const event =
        scheduleType === "before_checkin" ? "check-in" : "checkout";
      return `${dayStr} before ${event}${timeStr}`;
    }
    if (hours >= 1) {
      const hourStr = hours === 1 ? "1 hour" : `${hours} hours`;
      const event =
        scheduleType === "before_checkin" ? "check-in" : "checkout";
      return `${hourStr} before ${event}${timeStr}`;
    }
    return "Not scheduled";
  }
  if (scheduleType === "custom") {
    if (offsetMinutes >= 0)
      return `Custom: ${offsetMinutes} minutes after booking${sendTimeLocal ? ` at ${formatTimeForDisplay(sendTimeLocal)}` : ""}`;
    const abs = Math.abs(offsetMinutes);
    const days = Math.floor(abs / (24 * 60));
    const hours = Math.floor((abs % (24 * 60)) / 60);
    const timeStr = sendTimeLocal
      ? ` at ${formatTimeForDisplay(sendTimeLocal)}`
      : "";
    if (days >= 1) {
      const d = days === 1 ? "1 day" : `${days} days`;
      return `Custom: ${d} before${timeStr}`;
    }
    const h = hours === 1 ? "1 hour" : `${hours} hours`;
    return `Custom: ${h} before${timeStr}`;
  }
  return "Not scheduled";
}

function formatTimeForDisplay(hhmm: string): string {
  const parts = hhmm.split(":");
  const h = parseInt(parts[0] ?? "0", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  const h12 = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  const mStr = `:${String(m).padStart(2, "0")}`;
  return `${h12}${mStr} ${ampm}`;
}
