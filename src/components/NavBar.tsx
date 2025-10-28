import { NavLink } from "react-router-dom";
import { navigationRoutes } from "@/app/routes";

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
      {navigationRoutes.map((item) => (
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
