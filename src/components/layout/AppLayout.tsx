import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/NavBar";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-shell__main">
        <div className="app-shell__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
