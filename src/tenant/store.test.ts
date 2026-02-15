import { describe, it, expect, afterEach, vi } from "vitest";
import { getTenantSlug, setTenantSlug, initTenantFromEnv } from "./store";

describe("tenant store", () => {
  afterEach(() => {
    setTenantSlug(null);
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns null when no slug set", () => {
    expect(getTenantSlug()).toBeNull();
  });

  it("setTenantSlug and getTenantSlug roundtrip", () => {
    setTenantSlug("atlas");
    expect(getTenantSlug()).toBe("atlas");
    setTenantSlug("contoso");
    expect(getTenantSlug()).toBe("contoso");
  });

  it("setTenantSlug trims and treats empty as null", () => {
    setTenantSlug("  my-tenant  ");
    expect(getTenantSlug()).toBe("my-tenant");
    setTenantSlug("");
    expect(getTenantSlug()).toBeNull();
    setTenantSlug("  ");
    expect(getTenantSlug()).toBeNull();
  });

  it("initTenantFromEnv runs without throwing", () => {
    expect(() => initTenantFromEnv()).not.toThrow();
  });
});
