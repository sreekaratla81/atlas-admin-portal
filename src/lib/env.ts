export function getApiBaseUrl(): string | undefined {
  // Support both names; prefer the *_URL form
  const url = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE;
  if (!url) return undefined;
  // normalize: strip trailing slash
  const trimmed = String(url).trim().replace(/\/+$/, "");
  return trimmed || undefined;
}

export function getAuthConfig() {
  return {
    disabled: String(import.meta.env.VITE_AUTH_DISABLED || "").toLowerCase() === "true",
    domain: import.meta.env.VITE_AUTH0_DOMAIN || "",
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "",
    callbackPath: import.meta.env.VITE_AUTH0_CALLBACK_PATH || "/auth/callback",
    afterLogin: import.meta.env.VITE_DEFAULT_AFTER_LOGIN || "/bookings",
    // optional bypass for local use only
    bypass: String(import.meta.env.VITE_AUTH_BYPASS || "").toLowerCase() === "true",
  } as const;
}

export function getGuestSearchMode(): "local" | "api" {
  const v = String(import.meta.env.VITE_GUEST_SEARCH_MODE || "api").toLowerCase();
  return v === "local" ? "local" : "api";
}

export function getAllowedEmails(): string[] {
  const raw = import.meta.env.VITE_ALLOWED_EMAILS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(x => String(x).trim()).filter(Boolean);
  } catch { /* CSV fallback */ }
  return String(raw).split(",").map(s => s.trim()).filter(Boolean);
}
