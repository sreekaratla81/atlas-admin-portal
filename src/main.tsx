import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./auth/AuthContext";
import "./style.css";
import { getApiBase } from "@/utils/env";
import { setupMocks } from "@/mocks";
import { validateEnv } from "@/utils/env-validation";

validateEnv();

let teardownMocks: (() => void) | undefined;

if (import.meta.env.DEV) {
  console.log('apiBase', getApiBase());
  teardownMocks = setupMocks();
} else if (import.meta.env.PROD && getApiBase().includes('localhost')) {
  console.warn('apiBase points to localhost in production');
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    teardownMocks?.();
  });
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
