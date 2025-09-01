import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import BookingsPage from "./pages/Bookings";
import CallbackPage from "./pages/AuthCallback";
import Listings from "./pages/Listings";
import Properties from "./pages/Properties";
import Reports from "./pages/Reports";
import Guests from "./pages/Guests";
import BankAccountsPage from "./pages/BankAccountsPage";
import { useAuthMaybeBypass } from "./auth/authBypass";

const BYPASS = import.meta.env.VITE_AUTH_DISABLED === "true";

function Protected({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuthMaybeBypass();
  const location = useLocation();

  if (isLoading) return <div>Loading…</div>;
  if (!isAuthenticated) {
    void loginWithRedirect({ appState: { returnTo: location.pathname + location.search } });
    return <div>Loading…</div>;
  }
  return children;
}

export default function AppRoutes() {
  const { isAuthenticated, user, logout } = useAuthMaybeBypass();

  return (
    <>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/properties">Properties</Link>{" "}
        <Link to="/listings">Listings</Link>{" "}
        <Link to="/bank-accounts">Bank Accounts</Link>{" "}
        <Link to="/guests">Guests</Link>{" "}
        <Link to="/bookings">Bookings</Link>{" "}
        <Link to="/reports">Reports</Link>{" "}
        {BYPASS && (
          <span style={{ marginLeft: 10, fontSize: "0.75rem", padding: "2px 4px", borderRadius: 4, backgroundColor: "#FEF08A" }}>
            AUTH BYPASS (LOCAL)
          </span>
        )}
        {isAuthenticated && (
          <span style={{ marginLeft: 10 }}>
            {user?.email}{" "}
            <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
              Logout
            </button>
          </span>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/bookings" replace />} />
        <Route path="/auth/callback" element={<CallbackPage />} />
        <Route
          path="/bookings"
          element={
            <Protected>
              <BookingsPage />
            </Protected>
          }
        />
        <Route
          path="/listings"
          element={
            <Protected>
              <Listings />
            </Protected>
          }
        />
        <Route
          path="/guests"
          element={
            <Protected>
              <Guests />
            </Protected>
          }
        />
        <Route
          path="/properties"
          element={
            <Protected>
              <Properties />
            </Protected>
          }
        />
        <Route
          path="/reports"
          element={
            <Protected>
              <Reports />
            </Protected>
          }
        />
        <Route
          path="/bank-accounts"
          element={
            <Protected>
              <BankAccountsPage />
            </Protected>
          }
        />
        {/* other protected routes here */}
        <Route path="*" element={<Navigate to="/bookings" replace />} />
      </Routes>
    </>
  );
}
