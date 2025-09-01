import { describe, it, expect, afterEach, vi } from "vitest";
import { isEmailAllowed } from "./RequireAuth";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isEmailAllowed", () => {
  it("returns true for allowed email", () => {
    vi.stubEnv("VITE_ALLOWED_EMAILS", '["user@example.com"]');
    expect(isEmailAllowed("user@example.com")).toBe(true);
  });

  it("returns false for disallowed email", () => {
    vi.stubEnv("VITE_ALLOWED_EMAILS", '["user@example.com"]');
    expect(isEmailAllowed("other@example.com")).toBe(false);
  });
});
