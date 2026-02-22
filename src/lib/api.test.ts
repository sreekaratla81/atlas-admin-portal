import { describe, it, expect, afterEach, vi } from "vitest";
import { addTenantHeader } from "./api";

const USER_KEY = 'atlas_admin_user';

describe("api client", () => {
  afterEach(() => {
    localStorage.removeItem(USER_KEY);
    vi.unstubAllEnvs();
  });

  it("addTenantHeader sets X-Tenant-Slug when tenant is stored in auth", () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ tenantSlug: "atlas" }));
    const headers = { set: vi.fn() };
    addTenantHeader({ headers } as never);
    expect(headers.set).toHaveBeenCalledWith("X-Tenant-Slug", "atlas");
  });

  it("addTenantHeader does not set header when no tenant stored", () => {
    const headers = { set: vi.fn() };
    addTenantHeader({ headers } as never);
    expect(headers.set).not.toHaveBeenCalled();
  });
});
