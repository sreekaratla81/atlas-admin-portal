import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./App";
import AuthProvider from "./auth/AuthProvider";
import { AuthBypassProvider } from "./auth/authBypass";
import "./style.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthBypassProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </AuthBypassProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
