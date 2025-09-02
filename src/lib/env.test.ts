import { describe, it, expect, afterEach, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAllowedEmails", () => {
  it("parses JSON array", async () => {
    vi.stubEnv("VITE_ALLOWED_EMAILS", '["a@example.com","b@example.com"]');
    vi.resetModules();
    const { getAllowedEmails } = await import("./env");
    expect(getAllowedEmails()).toEqual(["a@example.com", "b@example.com"]);
  });

  it("parses CSV list", async () => {
    vi.stubEnv("VITE_ALLOWED_EMAILS", "a@example.com,b@example.com");
    vi.resetModules();
    const { getAllowedEmails } = await import("./env");
    expect(getAllowedEmails()).toEqual(["a@example.com", "b@example.com"]);
  });
});

describe('ENV', () => {
  it('throws when VITE_API_BASE missing', async () => {
    vi.stubEnv('VITE_API_BASE', '');
    vi.stubEnv('VITE_API_BASE_URL', '');
    vi.resetModules();
    await expect(import('../config/env')).rejects.toThrow();
  });
});
