import React from "react";
import routes from "@/router/routes";
import { safeMap } from "@/utils/array";

const navItems = safeMap(routes, (r) => r)
  .filter((r) => r.label)
  .map((r) => ({ path: r.path, label: r.label! }));

export default function Sidebar() {
  return (
    <nav>
      <ul>
        {navItems.map((i) => (
          <li key={i.path}>
            <a href={i.path}>{i.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
