import axios from "axios";
import { getApiBase } from "@/utils/env";
import { getTenantSlug } from "@/tenant/store";

const apiBase = getApiBase();
if (import.meta.env.PROD && !apiBase) {
  console.error("CONFIG: Missing VITE_API_BASE in production build.");
}

export const api = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

export function addTenantHeader(config: { headers: { set: (k: string, v: string) => void } }) {
  const slug = getTenantSlug();
  if (slug) config.headers.set("X-Tenant-Slug", slug);
  return config;
}

api.interceptors.request.use(addTenantHeader);

api.interceptors.response.use(
  (res) => {
    const ct = String(res.headers?.["content-type"] || "");

    // If Axios already parsed JSON, don't complain
    if (
      !ct.includes("application/json") &&
      typeof res.data === "string"
    ) {
      console.warn("Non-JSON response from API", {
        url: res.config?.url,
        ct,
        preview: res.data.slice(0, 120),
      });
    }

    return res;
  },
  (err) => {
    const status = err.response?.status;
    if (status === 404 || status === 403) {
      err.message =
        err.response?.data?.message ||
        (status === 404
          ? "Not found. It may have been removed or you don't have access."
          : "You don't have access to this resource.");
    }
    return Promise.reject(err);
  }
);


// Helper to ensure arrays before .map()
export function asArray<T>(val: unknown, label: string): T[] {
  if (Array.isArray(val)) return val as T[];
  console.error(`${label} expected array, got:`, val);
  return [];
}

