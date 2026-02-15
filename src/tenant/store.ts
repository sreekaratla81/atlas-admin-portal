/**
 * Tenant slug for API context. Source: Auth0 user app_metadata.tenantSlug (set by TenantSync)
 * or env VITE_TENANT_SLUG. Never from URL or user input.
 */

let tenantSlug: string | null = null;

export function getTenantSlug(): string | null {
  return tenantSlug;
}

export function setTenantSlug(slug: string | null): void {
  tenantSlug = slug == null ? null : String(slug).trim() || null;
}

/**
 * Initialize from env (e.g. at app load). Call from main or after env is ready.
 */
export function initTenantFromEnv(): void {
  const raw = (import.meta.env.VITE_TENANT_SLUG ?? '').trim();
  if (raw) tenantSlug = raw;
}
