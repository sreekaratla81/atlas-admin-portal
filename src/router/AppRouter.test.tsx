/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi, test, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import AppRouter from "@/router/AppRouter";

vi.mock("@/auth/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
  asArray: (v: unknown) => (Array.isArray(v) ? v : []),
}));

test("renders BookingsPage for /bookings", () => {
  render(
    <MemoryRouter initialEntries={["/bookings"]}>
      <AppRouter />
    </MemoryRouter>
  );
  expect(screen.getByText(/Booking Details/i)).toBeInTheDocument();
});
