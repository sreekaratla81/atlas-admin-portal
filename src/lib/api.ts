import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !baseURL) {
  // Visible, actionable error instead of white screen
  // eslint-disable-next-line no-console
  console.error("Missing VITE_API_BASE_URL in production environment");
}

export const api = axios.create({
  baseURL: baseURL || "", // dev may use proxy; prod MUST be set
  withCredentials: false,
  headers: { Accept: "application/json" },
});

// Content-type sanity check + JSON shape guard
api.interceptors.response.use(
  (res) => {
    const ct = res.headers?.["content-type"] || "";
    if (!ct.includes("application/json")) {
      // eslint-disable-next-line no-console
      console.error("Non-JSON response from API", {
        url: res.config?.url,
        ct,
        data: res.data,
      });
    }
    return res;
  },
  (err) => Promise.reject(err)
);

export function asArray<T>(val: unknown, label: string): T[] {
  if (Array.isArray(val)) return val as T[];
  // eslint-disable-next-line no-console
  console.error(`${label} is not an array`, val);
  return [];
}

