import axios from "axios";

const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const fallbackUrl = (import.meta.env.VITE_DEFAULT_API_BASE_URL || "").trim();

// Dev uses Vite proxy (/api). Non-dev falls back to configured default if env missing.
const baseURL = envUrl || (import.meta.env.DEV ? "/api" : fallbackUrl);

export const http = axios.create({ baseURL });

// Defensive guard: never allow localhost in non-dev
if (!import.meta.env.DEV && http.defaults.baseURL.startsWith("http://localhost")) {
  console.warn("Overriding localhost baseURL in non-dev to VITE_DEFAULT_API_BASE_URL");
  http.defaults.baseURL = fallbackUrl;
}
