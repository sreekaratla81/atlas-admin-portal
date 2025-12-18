import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";

type NavItem = {
  path: string;
  label: string;
};

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
      style={{
        background: "var(--nav-bg)",
        color: "var(--color-text-inverse)",
        padding: "0 20px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      <nav
        aria-label="Primary navigation"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          minHeight: 72,
          overflowX: "auto",      // 🔑 prevents wrapping
          whiteSpace: "nowrap",   // 🔑 keeps single line
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <img
            src="https://atlashomestorage.blob.core.windows.net/listing-images/logo-removebg-preview (3).png"
            alt="Atlas logo"
            style={{ height: 42 }}
          />
          <div style={{ fontWeight: 700, color: "var(--color-text-inverse)" }}>
            Atlas Admin
          </div>
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
              style={({ isActive }) => ({
                padding: kioskMode ? "12px 16px" : "10px 14px",
                borderRadius: 12,
                color: "var(--color-text-inverse)",
                textDecoration: "none",

                /* 🔑 LAYOUT FIX */
                boxSizing: "border-box",
                border: `1px solid ${isActive ? "var(--color-accent-primary)" : "var(--color-divider-strong)"}`,
                whiteSpace: "nowrap",
                flexShrink: 0,

                background: isActive
                  ? "linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-strong))"
                  : "var(--nav-bg)",

                boxShadow: isActive
                  ? "var(--shadow-elevated)"
                  : "var(--shadow-soft)",

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
