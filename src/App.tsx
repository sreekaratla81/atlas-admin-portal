import React from "react";
import AppRouter from "@/router/AppRouter";
import NavBar from "@/components/NavBar";

function ConfigGuard({ children }: React.PropsWithChildren) {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.PROD && !base) {
    return (
      <div style={{ padding: 16, color: "#b00020" }}>
        <h2>Configuration error</h2>
        <p>
          VITE_API_BASE_URL is not set. API calls will fail. Please configure it in
          Cloudflare Pages.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ConfigGuard>
      <NavBar />
      <AppRouter />
    </ConfigGuard>
  );
}
