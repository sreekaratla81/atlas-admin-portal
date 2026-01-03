import React from "react";
import { Navigate } from "react-router-dom";
import BookingsPage from "@/pages/Bookings";
import CallbackPage from "@/pages/AuthCallback";
import Listings from "@/pages/Listings";
import Properties from "@/pages/Properties";
import Reports from "@/pages/Reports";
import Guests from "@/pages/Guests";
import BankAccountsPage from "@/pages/BankAccountsPage";
import ProtectedRoute from "@/auth/ProtectedRoute";
import DevConfig from "@/pages/DevConfig";
import ReservationPage from "@/pages/Reservation"; // ✅ NEW IMPORT
import DashboardPage from "@/pages/Dashboard";
import UnifiedCalendarPage from "@/pages/Calendar";
import ChannelManagerPage from "@/pages/ChannelManager";
import AppLayout from "@/components/layout/AppLayout";

export type AppRoute = {
  path?: string;
  element?: React.ReactNode;
  label?: string;
  icon?: React.ReactNode;
  children?: AppRoute[];
  index?: boolean;
};

const baseRoutes: AppRoute[] = [
  { path: "/auth/callback", element: <CallbackPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/reservations" replace /> },
      { path: "dashboard", element: <DashboardPage />, label: "Dashboard" },
      { path: "calendar", element: <Navigate to="/calendar/availability" replace /> },
      { path: "calendar/availability", element: <UnifiedCalendarPage />, label: "Calendar" },
      { path: "channel-manager", element: <ChannelManagerPage />, label: "Channel Manager" },
      { path: "bookings", element: <BookingsPage />, label: "Bookings" },
      { path: "reservations", element: <ReservationPage />, label: "Reservations" },
      { path: "reservation", element: <Navigate to="/reservations" replace /> },
      { path: "listings", element: <Listings />, label: "Listings" },
      { path: "guests", element: <Guests />, label: "Guests" },
      { path: "properties", element: <Properties />, label: "Properties" },
      { path: "reports", element: <Reports />, label: "Reports" },
      { path: "bank-accounts", element: <BankAccountsPage />, label: "Bank Accounts" },
      { path: "*", element: <Navigate to="/reservations" replace /> },
    ],
  },
];

if (import.meta.env.DEV) {
  baseRoutes.push({ path: "/dev-config", element: <DevConfig /> });
}

export const routes = baseRoutes;

export default routes;
