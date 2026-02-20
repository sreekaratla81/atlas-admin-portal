/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { formatScheduleSummary } from "./scheduleOptions";

describe("formatScheduleSummary", () => {
  it("returns Not scheduled for none", () => {
    expect(formatScheduleSummary("none", 0)).toBe("Not scheduled");
  });

  it("formats after_booking in minutes", () => {
    expect(formatScheduleSummary("after_booking", 5, undefined)).toBe("5 minutes after a guest books");
    expect(formatScheduleSummary("after_booking", 60, undefined)).toBe("1 hour after a guest books");
    expect(formatScheduleSummary("after_booking", 120, undefined)).toBe("2 hours after a guest books");
  });

  it("formats before_checkin with time", () => {
    expect(formatScheduleSummary("before_checkin", -24 * 60, "10:00")).toContain("1 day");
    expect(formatScheduleSummary("before_checkin", -24 * 60, "10:00")).toContain("10:00 AM");
  });

  it("formats before_checkout with time", () => {
    expect(formatScheduleSummary("before_checkout", -24 * 60, "18:00")).toContain("6:00 PM");
  });
});
