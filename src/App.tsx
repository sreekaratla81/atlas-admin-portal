import React from "react";
import AppRouter from "@/router/AppRouter";
import { getApiBase } from "@/utils/env";

function ConfigGuard({ children }: React.PropsWithChildren) {
  if (import.meta.env.PROD && !getApiBase()) {
    return (
      <div style={{ padding: 16, color: "var(--color-status-error-text)" }}>
        <h2>Configuration error</h2>
        <p>
          VITE_API_BASE is not set. Set it in Cloudflare Pages → Build → Variables and Secrets.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigGuard>
      <AppRouter />
    </ConfigGuard>
  );
}
