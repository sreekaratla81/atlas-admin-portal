import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./App";
import AuthProvider from "./auth/AuthProvider";
import { AuthBypassProvider } from "./auth/authBypass";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthBypassProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AuthBypassProvider>
    </BrowserRouter>
  </React.StrictMode>
);
