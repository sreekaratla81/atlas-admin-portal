/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import { vi, test, expect } from "vitest";
import "@testing-library/jest-dom/vitest";

// Avoid loading full app (MUI icons etc.) to prevent EMFILE on Windows
vi.mock("@/pages/Bookings", () => ({ default: () => <h1>Booking Details</h1> }));
vi.mock("@/pages/AuthCallback", () => ({ default: () => null }));
vi.mock("@/pages/Listings", () => ({ default: () => null }));
vi.mock("@/pages/Properties", () => ({ default: () => null }));
vi.mock("@/pages/Reports", () => ({ default: () => null }));
vi.mock("@/pages/Guests", () => ({ default: () => null }));
vi.mock("@/pages/BankAccountsPage", () => ({ default: () => null }));
vi.mock("@/auth/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/pages/DevConfig", () => ({ default: () => null }));
vi.mock("@/pages/Reservation", () => ({ default: () => null }));
vi.mock("@/pages/Dashboard", () => ({ default: () => null }));
vi.mock("@/pages/calendar/AvailabilityCalendar", () => ({ default: () => null }));
vi.mock("@/pages/ChannelManager", () => ({ default: () => null }));
vi.mock("@/components/layout/AppLayout", () => ({
  default: () => <Outlet />,
}));
vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
  asArray: (v: unknown) => (Array.isArray(v) ? v : []),
}));
vi.mock("@/services/guests.local", () => ({ hydrateGuests: vi.fn().mockResolvedValue(0) }));
vi.mock("@/db/idb", () => ({ getAllGuests: vi.fn().mockResolvedValue([]) }));
vi.mock("@/workers/guestSearch.worker?worker", () => ({
  default: class {
    onmessage: unknown;
    postMessage() {}
    terminate() {}
  },
}));

import AppRouter from "@/router/AppRouter";

test("renders BookingsPage for /bookings", () => {
  render(
    <MemoryRouter initialEntries={["/bookings"]}>
      <AppRouter />
    </MemoryRouter>
  );
  expect(screen.getByText(/Booking Details/i)).toBeInTheDocument();
});
