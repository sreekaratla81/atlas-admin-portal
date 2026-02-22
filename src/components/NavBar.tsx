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
  { path: "/calendar/availability", label: "Calendar" },
  { path: "/channel-manager", label: "Channel Manager" },
  { path: "/messaging/templates", label: "Message templates" },
  { path: "/messaging/messages", label: "Messages" },
  { path: "/reports", label: "Reports" },
  { path: "/bank-accounts", label: "Bank Accounts" },
  { path: "/onboarding", label: "Onboarding" },
  { path: "/billing", label: "Billing" },
  { path: "/dashboard", label: "Dashboard" },
];

const GUEST_PORTAL_URL = import.meta.env.VITE_GUEST_PORTAL_URL || "https://atlashomestays.com";

export default function NavBar() {
  const { search } = useLocation();
  const kioskMode = useMemo(() => new URLSearchParams(search).get("kiosk") === "1", [search]);

  return (
    <header className={["top-nav", kioskMode ? "is-kiosk" : ""].join(" ")}>
      <nav aria-label="Primary navigation" className="top-nav__inner">
        {/* LOGO */}
        <div className="top-nav__brand">
          <img
            src="https://atlashomestorage.blob.core.windows.net/listing-images/logo-removebg-preview (3).png"
            alt="Atlas logo"
            className="top-nav__logo"
          />
          <div className="top-nav__title">Atlas Admin</div>
        </div>

        <div className="top-nav__items">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "top-nav__link",
                  isActive ? "is-active" : "",
                  kioskMode ? "is-kiosk" : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href={GUEST_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="top-nav__link"
            style={{ marginLeft: "auto", opacity: 0.8, fontSize: 13 }}
          >
            Switch to Guest View ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
