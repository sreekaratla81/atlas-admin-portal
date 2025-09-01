import axios from "axios";
import { getApiBaseUrl } from "./env";

const base = getApiBaseUrl();

if (import.meta.env.PROD && !base) {
  // make it very obvious in prod if not configured
  // eslint-disable-next-line no-console
  console.error("CONFIG: Missing VITE_API_BASE_URL (or VITE_API_BASE) in production build.");
}

export const api = axios.create({
  baseURL: base || "", // dev may use Vite proxy; prod MUST be non-empty
  headers: { Accept: "application/json" },
});

api.interceptors.response.use(
  (res) => {
    const ct = String(res.headers?.["content-type"] || "");
    if (!ct.includes("application/json")) {
      // eslint-disable-next-line no-console
      console.error("Non-JSON response from API", { url: res.config?.url, ct, preview: String(res.data).slice(0, 120) });
    }
    return res;
  },
  (err) => Promise.reject(err)
);

// Helper to ensure arrays before .map()
export function asArray<T>(val: unknown, label: string): T[] {
  if (Array.isArray(val)) return val as T[];
  // eslint-disable-next-line no-console
  console.error(`${label} expected array, got:`, val);
  return [];
}

