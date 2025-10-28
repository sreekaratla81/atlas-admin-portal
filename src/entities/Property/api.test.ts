import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PropertyApi } from './api';

const mockFetch = vi.fn();

describe('PropertyApi', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // @ts-expect-error - assign global fetch mock
    global.fetch = mockFetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it('parses property list', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => [
        { id: '1', name: 'Atlas Loft', address: '123 Ocean Ave', status: 'active' },
      ],
    });

    const data = await PropertyApi.list();
    expect(data).toHaveLength(1);
    expect(data[0]).toMatchObject({ name: 'Atlas Loft' });
  });

  it('throws on invalid payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => [{ id: 1 }],
    });

    await expect(PropertyApi.list()).rejects.toThrow();
  });
});
