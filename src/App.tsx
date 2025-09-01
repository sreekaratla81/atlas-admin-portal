import { Link, Navigate, Route, Routes } from "react-router-dom";
import BookingsPage from "./pages/Bookings";
import CallbackPage from "./pages/AuthCallback";
import Listings from "./pages/Listings";
import Properties from "./pages/Properties";
import Reports from "./pages/Reports";
import Guests from "./pages/Guests";
import BankAccountsPage from "./pages/BankAccountsPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useEffectiveAuth } from "./auth/useEffectiveAuth";

export default function AppRoutes() {
  const { effectiveIsAuthenticated, effectiveUser, logout, bypassEnabled } = useEffectiveAuth();

  return (
    <>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/properties">Properties</Link>{" "}
        <Link to="/listings">Listings</Link>{" "}
        <Link to="/bank-accounts">Bank Accounts</Link>{" "}
        <Link to="/guests">Guests</Link>{" "}
        <Link to="/bookings">Bookings</Link>{" "}
        <Link to="/reports">Reports</Link>{" "}
        {bypassEnabled && (
          <span style={{ marginLeft: 10, fontSize: "0.75rem", padding: "2px 4px", borderRadius: 4, backgroundColor: "#FEF08A" }}>
            AUTH BYPASS (LOCAL)
          </span>
        )}
        {effectiveIsAuthenticated && (
          <span style={{ marginLeft: 10 }}>
            {effectiveUser?.email}{" "}
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
              Logout
            </button>
          </span>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/bookings" replace />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
        <Route path="/guests" element={<ProtectedRoute><Guests /></ProtectedRoute>} />
        <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/bank-accounts" element={<ProtectedRoute><BankAccountsPage /></ProtectedRoute>} />
        {/* other protected routes here */}
        <Route path="*" element={<Navigate to="/bookings" replace />} />
      </Routes>
    </>
  );
}
