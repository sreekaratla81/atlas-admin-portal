import React from "react";
import { Navigate } from "react-router-dom";
import BookingsPage from "@/pages/Bookings";
import LoginPage from "@/pages/LoginPage";
import Listings from "@/pages/Listings";
import Properties from "@/pages/Properties";
import Reports from "@/pages/Reports";
import Guests from "@/pages/Guests";
import BankAccountsPage from "@/pages/BankAccountsPage";
import ProtectedRoute from "@/auth/ProtectedRoute";
import DevConfig from "@/pages/DevConfig";
import ReservationPage from "@/pages/Reservation";
import DashboardPage from "@/pages/Dashboard";
import AvailabilityCalendarPage from "@/pages/calendar/AvailabilityCalendar";
import ChannelManagerPage from "@/pages/ChannelManager";
import { TemplatesPage, TemplateEditPage, MessagesPage } from "@/pages/messaging";
import OnboardingDashboard from "@/pages/OnboardingDashboard";
import HostProfile from "@/pages/HostProfile";
import HostDocuments from "@/pages/HostDocuments";
import BillingPage from "@/pages/BillingPage";
import AppLayout from "@/components/layout/AppLayout";
import NotFound from "@/pages/NotFound";

export type AppRoute = {
  path?: string;
  element?: React.ReactNode;
  label?: string;
  icon?: React.ReactNode;
  children?: AppRoute[];
  index?: boolean;
};

const baseRoutes: AppRoute[] = [
  { path: "/login", element: <LoginPage /> },
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
      { path: "calendar/availability", element: <AvailabilityCalendarPage />, label: "Calendar" },
      { path: "channel-manager", element: <ChannelManagerPage />, label: "Channel Manager" },
      { path: "bookings", element: <BookingsPage />, label: "Bookings" },
      { path: "reservations", element: <ReservationPage />, label: "Reservations" },
      { path: "reservation", element: <Navigate to="/reservations" replace /> },
      { path: "listings", element: <Listings />, label: "Listings" },
      { path: "guests", element: <Guests />, label: "Guests" },
      { path: "properties", element: <Properties />, label: "Properties" },
      { path: "reports", element: <Reports />, label: "Reports" },
      { path: "bank-accounts", element: <BankAccountsPage />, label: "Bank Accounts" },
      { path: "messaging", element: <Navigate to="/messaging/templates" replace /> },
      { path: "messaging/templates", element: <TemplatesPage />, label: "Templates" },
      { path: "messaging/templates/new", element: <TemplateEditPage /> },
      { path: "messaging/templates/:id", element: <TemplateEditPage /> },
      { path: "messaging/messages", element: <MessagesPage />, label: "Messages" },
      { path: "onboarding", element: <OnboardingDashboard />, label: "Onboarding" },
      { path: "onboarding/profile", element: <HostProfile /> },
      { path: "onboarding/documents", element: <HostDocuments /> },
      { path: "billing", element: <BillingPage />, label: "Billing" },
      { path: "*", element: <NotFound /> },
    ],
  },
];

if (import.meta.env.DEV) {
  baseRoutes.push({ path: "/dev-config", element: <DevConfig /> });
}

export const routes = baseRoutes;

export default routes;
