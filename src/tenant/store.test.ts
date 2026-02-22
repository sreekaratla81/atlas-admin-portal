import { describe, it, expect, vi, afterEach } from "vitest";

const TOKEN_KEY = 'atlas_admin_token';
const USER_KEY = 'atlas_admin_user';

describe("tenant store", () => {
  afterEach(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns tenant slug from stored user", async () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ tenantSlug: "sunrise" }));
    const { getTenantSlug } = await import("./store");
    expect(getTenantSlug()).toBe("sunrise");
  });

  it("falls back to VITE_TENANT_SLUG when no stored user", async () => {
    vi.stubEnv("VITE_TENANT_SLUG", "atlas");
    const { getTenantSlug } = await import("./store");
    expect(getTenantSlug()).toBe("atlas");
  });

  it("returns null when nothing is configured", async () => {
    const { getTenantSlug } = await import("./store");
    expect(getTenantSlug()).toBeNull();
  });
});
