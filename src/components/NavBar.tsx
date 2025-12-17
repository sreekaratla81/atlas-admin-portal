import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/bookings", label: "Bookings" },

  // ✅ RESERVATION MENU
  { path: "/reservation", label: "Reservation" },

  { path: "/listings", label: "Listings" },
  { path: "/guests", label: "Guests" },
  { path: "/properties", label: "Properties" },
  { path: "/reports", label: "Reports" },
  { path: "/bank-accounts", label: "Bank Accounts" },
];

export default function NavBar() {
  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "2rem",
        background: "#333",
        padding: "0.75rem 1.5rem",
      }}
    >
      {/* ✅ LOGO — placed before Bookings */}
      <img
        src="https://atlashomestorage.blob.core.windows.net/listing-images/logo-removebg-preview (3).png"
        alt="Logo"
        style={{
          height: "40px",
          width: "auto",
          marginRight: "0.5rem",
        }}
      />

      {/* ✅ NAV ITEMS */}
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          style={({ isActive }) => ({
            color: isActive ? "#fff" : "#ccc",
            textDecoration: "none",
            borderBottom: isActive ? "2px solid #00aaff" : "none",
            paddingBottom: "0.25rem",
          })}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
