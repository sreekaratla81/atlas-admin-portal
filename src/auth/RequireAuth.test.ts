import { describe, it, expect, afterEach, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isEmailAllowed", () => {
  it("returns true for allowed email", async () => {
    vi.stubEnv("VITE_ALLOWED_EMAILS", '["user@example.com"]');
    const { isEmailAllowed } = await import("./RequireAuth");
    expect(isEmailAllowed("user@example.com")).toBe(true);
  });

  it("returns false for disallowed email", async () => {
    vi.stubEnv("VITE_ALLOWED_EMAILS", '["user@example.com"]');
    const { isEmailAllowed } = await import("./RequireAuth");
    expect(isEmailAllowed("other@example.com")).toBe(false);
  });
});
