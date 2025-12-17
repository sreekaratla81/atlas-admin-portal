import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";

type NavItem = { path: string; label: string };

const navItems: NavItem[] = [
  { path: "/reservations", label: "Reservations" },
  { path: "/bookings", label: "Bookings" },
  { path: "/guests", label: "Guests" },
  { path: "/listings", label: "Listings" },
  { path: "/properties", label: "Properties" },
  { path: "/calendar", label: "Calendar" },
  { path: "/channel-manager", label: "Channel Manager" },
  { path: "/reports", label: "Reports" },
  { path: "/bank-accounts", label: "Bank Accounts" },
  { path: "/dashboard", label: "Dashboard" },
];

export default function NavBar() {
  const { search } = useLocation();
  const kioskMode = useMemo(() => new URLSearchParams(search).get("kiosk") === "1", [search]);

  return (
    <header
      className="top-nav"
      style={{
        background: "var(--nav-bg)",
        color: "#e2e8f0",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      }}
    >
      <nav
        aria-label="Primary navigation"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          minHeight: "var(--nav-height)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="https://atlashomestorage.blob.core.windows.net/listing-images/logo-removebg-preview (3).png"
            alt="Atlas logo"
            style={{ height: 42, width: "auto" }}
          />
          <div style={{ fontWeight: 700, letterSpacing: 0.4, color: "#fff" }}>Atlas Admin</div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
            overflowX: "auto",
            padding: "8px 0",
            marginLeft: 16,
            flex: 1,
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "nav-pill",
                  isActive ? "active" : "",
                ].join(" ")
              }
              style={({ isActive }) => ({
                padding: kioskMode ? "12px 16px" : "10px 14px",
                borderRadius: 12,
                color: "inherit",
                textDecoration: "none",
                background: isActive ? "linear-gradient(135deg, #22d3ee, #0ea5e9)" : "#1e293b",
                border: isActive ? "1px solid #22d3ee" : "1px solid #1f2937",
                boxShadow: isActive ? "0 8px 20px rgba(14,165,233,0.35)" : undefined,
                fontWeight: 700,
                transition: "transform 0.15s ease, box-shadow 0.2s ease",
                whiteSpace: "nowrap",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
