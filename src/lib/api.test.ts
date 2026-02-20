import { describe, it, expect, afterEach, vi } from "vitest";
import { setTenantSlug } from "@/tenant/store";
import { addTenantHeader } from "./api";

describe("api client", () => {
  afterEach(() => {
    setTenantSlug(null);
  });

  it("addTenantHeader sets X-Tenant-Slug when tenant is set", () => {
    setTenantSlug("atlas");
    const headers = { set: vi.fn() };
    addTenantHeader({ headers } as never);
    expect(headers.set).toHaveBeenCalledWith("X-Tenant-Slug", "atlas");
  });

  it("addTenantHeader does not set header when tenant is null", () => {
    setTenantSlug(null);
    const headers = { set: vi.fn() };
    addTenantHeader({ headers } as never);
    expect(headers.set).not.toHaveBeenCalled();
  });
});
