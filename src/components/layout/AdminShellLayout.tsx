import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type AdminShellLayoutProps = {
  title?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

export default function AdminShellLayout({ title, rightSlot, children }: AdminShellLayoutProps) {
  const [params] = useSearchParams();
  const kioskMode = useMemo(() => params.get("kiosk") === "1", [params]);

  return (
    <section className={["admin-shell", kioskMode ? "kiosk-mode" : ""].join(" ")}>
      <div className="shell-content">
        {(title || rightSlot) && (
          <div className="shell-header">
            {title && <h1 className="shell-header__title">{title}</h1>}
            {rightSlot ? <div className="shell-header__actions">{rightSlot}</div> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
