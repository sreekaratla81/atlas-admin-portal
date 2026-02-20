import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { setTenantSlug } from "@/tenant/store";
import { getTenantSlugFromEnv } from "@/config/env";

/**
 * Syncs tenant slug from Auth0 user profile (app_metadata.tenantSlug) into tenant store
 * so the API client can attach X-Tenant-Slug. If profile has no tenant, keeps env default
 * set by initTenantFromEnv(). Do not read tenant from URL or user input.
 */
export default function TenantSync() {
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && user) {
      const fromProfile =
        (user as { app_metadata?: { tenantSlug?: string } }).app_metadata?.tenantSlug;
      if (typeof fromProfile === "string" && fromProfile.trim()) {
        setTenantSlug(fromProfile.trim());
        return;
      }
    }
    setTenantSlug(getTenantSlugFromEnv() ?? null);
  }, [isAuthenticated, user]);

  return null;
}
