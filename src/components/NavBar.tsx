import { NavLink, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

type NavItem = { path: string; label: string };

const primaryItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/calendar", label: "Calendar" },
  { path: "/channel-manager", label: "Channel Manager" },
];

const legacyItems: NavItem[] = [
  { path: "/bookings", label: "Bookings" },
  { path: "/reservation", label: "Reservation" },
  { path: "/listings", label: "Listings" },
  { path: "/guests", label: "Guests" },
  { path: "/properties", label: "Properties" },
  { path: "/reports", label: "Reports" },
  { path: "/bank-accounts", label: "Bank Accounts" },
];

export default function NavBar() {
  const { search } = useLocation();
  const [legacyOpen, setLegacyOpen] = useState(false);
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

        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {primaryItems.map((item) => (
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
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <details
          open={legacyOpen}
          onToggle={(evt) => setLegacyOpen(evt.currentTarget.open)}
          style={{ marginLeft: "auto", position: "relative" }}
        >
          <summary
            style={{
              cursor: "pointer",
              padding: kioskMode ? "12px 16px" : "10px 14px",
              borderRadius: 12,
              border: "1px solid #1f2937",
              background: "#111827",
              color: "#e2e8f0",
              listStyle: "none",
            }}
          >
            More
          </summary>
          <div
            role="menu"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              background: "#0b1224",
              border: "1px solid #1f2937",
              borderRadius: 12,
              padding: 8,
              minWidth: 240,
              boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ padding: "6px 10px", color: "var(--text-muted)", fontSize: 12, letterSpacing: 0.6 }}>
              Legacy navigation
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              {legacyItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  className={({ isActive }) => (isActive ? "active" : "")}
                  style={({ isActive }) => ({
                    padding: "10px 12px",
                    borderRadius: 10,
                    color: "#e2e8f0",
                    textDecoration: "none",
                    background: isActive ? "#1f2937" : "transparent",
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </details>
      </nav>
    </header>
  );
}
