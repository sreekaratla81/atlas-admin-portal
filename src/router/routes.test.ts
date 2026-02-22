import { expect, test, vi } from "vitest";

// Avoid loading full app (MUI icons etc.) to prevent EMFILE on Windows
vi.mock("@/pages/Bookings", () => ({ default: () => null }));
vi.mock("@/pages/Listings", () => ({ default: () => null }));
vi.mock("@/pages/Properties", () => ({ default: () => null }));
vi.mock("@/pages/Reports", () => ({ default: () => null }));
vi.mock("@/pages/Guests", () => ({ default: () => null }));
vi.mock("@/pages/BankAccountsPage", () => ({ default: () => null }));
vi.mock("@/auth/ProtectedRoute", () => ({ default: ({ children }: { children: unknown }) => children }));
vi.mock("@/pages/DevConfig", () => ({ default: () => null }));
vi.mock("@/pages/Reservation", () => ({ default: () => null }));
vi.mock("@/pages/Dashboard", () => ({ default: () => null }));
vi.mock("@/pages/calendar/AvailabilityCalendar", () => ({ default: () => null }));
vi.mock("@/pages/ChannelManager", () => ({ default: () => null }));
vi.mock("@/components/layout/AppLayout", () => ({ default: ({ children }: { children: unknown }) => children }));

import routes from "@/router/routes";

test("routes is an array with path+element", () => {
  expect(Array.isArray(routes)).toBe(true);
  routes.forEach((r) => {
    expect(typeof r.path).toBe("string");
    expect(r.element).toBeTruthy();
  });
});
