/**
 * Tenant slug for API context.
 * Primary source: JWT claims (stored user -> tenantSlug).
 * Fallback: VITE_TENANT_SLUG env var (for dev convenience).
 */
import { getStoredTenantSlug } from '@/auth/AuthContext';

export function getTenantSlug(): string | null {
  return getStoredTenantSlug()
    ?? ((import.meta.env.VITE_TENANT_SLUG ?? '').trim() || null);
}
