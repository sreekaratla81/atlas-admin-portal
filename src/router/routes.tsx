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
import LegacyLayout from "@/components/layout/LegacyLayout";

export type AppRoute = {
  path: string;
  element: React.ReactNode;
  label?: string;
  icon?: React.ReactNode;
  children?: AppRoute[];
};

const withLegacy = (node: React.ReactNode, title?: string) => (
  <LegacyLayout title={title}>
    {node}
  </LegacyLayout>
);

const baseRoutes: AppRoute[] = [
  { path: "/", element: <Navigate to="/bookings" replace /> },
  { path: "/auth/callback", element: <CallbackPage /> },
  { path: "/dashboard", element: <ProtectedRoute><DashboardPage /></ProtectedRoute>, label: "Dashboard" },
  { path: "/calendar", element: <ProtectedRoute><UnifiedCalendarPage /></ProtectedRoute>, label: "Calendar" },
  { path: "/channel-manager", element: <ProtectedRoute><ChannelManagerPage /></ProtectedRoute>, label: "Channel Manager" },
  { path: "/bookings", element: <ProtectedRoute>{withLegacy(<BookingsPage />, "Bookings")}</ProtectedRoute>, label: "Bookings" },

  // ✅ NEW RESERVATION ROUTE
  { path: "/reservation", element: <ProtectedRoute>{withLegacy(<ReservationPage />, "Reservation")}</ProtectedRoute>, label: "Reservation" },

  { path: "/listings", element: <ProtectedRoute>{withLegacy(<Listings />, "Listings")}</ProtectedRoute>, label: "Listings" },
  { path: "/guests", element: <ProtectedRoute>{withLegacy(<Guests />, "Guests")}</ProtectedRoute>, label: "Guests" },
  { path: "/properties", element: <ProtectedRoute>{withLegacy(<Properties />, "Properties")}</ProtectedRoute>, label: "Properties" },
  { path: "/reports", element: <ProtectedRoute>{withLegacy(<Reports />, "Reports")}</ProtectedRoute>, label: "Reports" },
  { path: "/bank-accounts", element: <ProtectedRoute>{withLegacy(<BankAccountsPage />, "Bank Accounts")}</ProtectedRoute>, label: "Bank Accounts" },
  { path: "*", element: <Navigate to="/bookings" replace /> }
];

if (import.meta.env.DEV) {
  baseRoutes.push({ path: "/dev-config", element: <DevConfig /> });
}

export const routes = baseRoutes;

export default routes;
