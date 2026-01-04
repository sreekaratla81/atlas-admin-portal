// @vitest-environment jsdom
import React from "react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import AppRouter from "@/router/AppRouter";

vi.mock("@/auth/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/pages/Dashboard", () => ({ default: () => <div>Mock Dashboard</div> }));
vi.mock("@/pages/Calendar", () => ({ default: () => <div>Mock Calendar</div> }));
vi.mock("@/pages/calendar/AvailabilityCalendar", () => ({
  default: () => <div>Mock Calendar</div>,
}));
vi.mock("@/pages/ChannelManager", () => ({ default: () => <div>Mock Channel Manager</div> }));
vi.mock("@/pages/Reservation", () => ({ default: () => <button>CREATE MANUAL BOOKING</button> }));
vi.mock("@/pages/Listings", () => ({ default: () => <h1>Listings</h1> }));
vi.mock("@/pages/Guests", () => ({ default: () => <h1>Guests</h1> }));
vi.mock("@/pages/Properties", () => ({ default: () => <h1>Properties</h1> }));
vi.mock("@/pages/Reports", () => ({ default: () => <h1>Reports</h1> }));
vi.mock("@/pages/BankAccountsPage", () => ({ default: () => <h1>Bank Accounts</h1> }));
vi.mock("@/pages/Bookings", () => ({ default: () => <h1>Bookings</h1> }));

vi.mock("@/lib/api", () => ({
  api: { get: vi.fn(() => Promise.resolve({ data: [] })) },
  asArray: (data: any) => (Array.isArray(data) ? data : data ? [] : []),
}));

vi.mock("@/api/bankAccountsApi", () => ({
  getBankAccounts: vi.fn(() => Promise.resolve([])),
  createBankAccount: vi.fn(() => Promise.resolve({})),
  updateBankAccount: vi.fn(() => Promise.resolve({})),
  deleteBankAccount: vi.fn(() => Promise.resolve({})),
  getBankAccountEarnings: vi.fn(() => Promise.resolve([])),
}));

vi.mock("@/services/guests.local", () => ({
  hydrateGuests: vi.fn(() => Promise.resolve()),
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
expect.extend(matchers);

describe("App routes", () => {
  const renderAt = (path: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <AppRouter />
      </MemoryRouter>
    );

  it("renders dashboard", () => {
    renderAt("/dashboard");
    expect(screen.getByText(/Mock Dashboard/i)).toBeInTheDocument();
  });

  it("renders calendar", () => {
    renderAt("/calendar");
    expect(screen.getByText(/Mock Calendar/i)).toBeInTheDocument();
  });

  it("renders channel manager", () => {
    renderAt("/channel-manager");
    expect(screen.getByText(/Mock Channel Manager/i)).toBeInTheDocument();
  });

  it("lands on reservations by default", async () => {
    renderAt("/");
    await waitFor(() => expect(screen.getAllByText(/CREATE MANUAL BOOKING/i).length).toBeGreaterThan(0));
  });

  it("renders reservations", async () => {
    renderAt("/reservations");
    await waitFor(() => expect(screen.getAllByText(/CREATE MANUAL BOOKING/i).length).toBeGreaterThan(0));
  });

  it("redirects legacy reservation path", async () => {
    renderAt("/reservation");
    await waitFor(() => expect(screen.getAllByText(/CREATE MANUAL BOOKING/i).length).toBeGreaterThan(0));
  });

  const legacyRoutes = [
    { path: "/listings", text: /Listings/i },
    { path: "/guests", text: /Guests/i },
    { path: "/properties", text: /Properties/i },
    { path: "/reports", text: /Reports/i },
    { path: "/bank-accounts", text: /Bank Accounts/i },
    { path: "/bookings", text: /Bookings/i },
  ];

  legacyRoutes.forEach(({ path, text }) => {
    it(`renders ${path}`, () => {
      renderAt(path);
      expect(screen.queryAllByText(text).length).toBeGreaterThan(0);
    });
  });
});
