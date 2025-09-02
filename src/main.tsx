import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AuthProvider from "./auth/AuthProvider";
import "./style.css";
import { getApiBase, getGuestSearchMode } from "@/utils/env";

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('apiBase', getApiBase(), 'guestSearchMode', getGuestSearchMode());
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
