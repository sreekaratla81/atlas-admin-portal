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

export type AppRoute = {
  path: string;
  element: React.ReactNode;
  label?: string;
  icon?: React.ReactNode;
  children?: AppRoute[];
};

const baseRoutes: AppRoute[] = [
  { path: "/", element: <Navigate to="/bookings" replace /> },
  { path: "/auth/callback", element: <CallbackPage /> },
  { path: "/bookings", element: <ProtectedRoute><BookingsPage /></ProtectedRoute>, label: "Bookings" },

  // ✅ NEW RESERVATION ROUTE
  { path: "/reservation", element: <ProtectedRoute><ReservationPage /></ProtectedRoute>, label: "Reservation" },

  { path: "/listings", element: <ProtectedRoute><Listings /></ProtectedRoute>, label: "Listings" },
  { path: "/guests", element: <ProtectedRoute><Guests /></ProtectedRoute>, label: "Guests" },
  { path: "/properties", element: <ProtectedRoute><Properties /></ProtectedRoute>, label: "Properties" },
  { path: "/reports", element: <ProtectedRoute><Reports /></ProtectedRoute>, label: "Reports" },
  { path: "/bank-accounts", element: <ProtectedRoute><BankAccountsPage /></ProtectedRoute>, label: "Bank Accounts" },
  { path: "*", element: <Navigate to="/bookings" replace /> }
];

if (import.meta.env.DEV) {
  baseRoutes.push({ path: "/dev-config", element: <DevConfig /> });
}

export const routes = baseRoutes;

export default routes;
