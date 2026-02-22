import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/NavBar";
import LockBanner from "@/components/LockBanner";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <NavBar />
      <LockBanner />
      <main className="app-shell__main">
        <div className="app-shell__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
