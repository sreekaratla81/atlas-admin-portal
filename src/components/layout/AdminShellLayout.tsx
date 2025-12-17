import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import NavBar from "@/components/NavBar";

type AdminShellLayoutProps = {
  title?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

export default function AdminShellLayout({ title, rightSlot, children }: AdminShellLayoutProps) {
  const [params] = useSearchParams();
  const kioskMode = useMemo(() => params.get("kiosk") === "1", [params]);

  return (
    <div className={["admin-shell", kioskMode ? "kiosk-mode" : ""].join(" ")}>
      <NavBar />
      <div className="shell-content">
        {(title || rightSlot) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 6,
            }}
          >
            {title && <h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>}
            {rightSlot}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
