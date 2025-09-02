/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import axios from 'axios';
import { useGuestSearch, type Guest } from '../useGuestSearch';

vi.mock('axios');
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe('useGuestSearch', () => {
  it('filters locally and does not call axios in local mode', async () => {
    vi.stubEnv('VITE_GUEST_SEARCH_MODE', 'local');
    const guests: Guest[] = [
      { id: '1', name: 'Lekana', email: 'l@example.com', phone: '123' },
      { id: '2', name: 'Ravi', email: 'r@example.com', phone: '456' },
    ];
    const { result } = renderHook(() => useGuestSearch(guests));
    const res = await result.current('lek');
    expect(res).toEqual([guests[0]]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('calls axios in remote mode and returns results', async () => {
    vi.stubEnv('VITE_GUEST_SEARCH_MODE', 'remote');
    vi.stubEnv('VITE_API_BASE', 'https://api.test');
    mockedAxios.get = vi.fn().mockResolvedValue({ data: [{ id: '3', name: 'Neo' }] });
    const { result } = renderHook(() => useGuestSearch(null));
    const res = await result.current('neo');
    expect(mockedAxios.get).toHaveBeenCalledWith('https://api.test/api/guests/search?q=neo', expect.any(Object));
    expect(res).toEqual([{ id: '3', name: 'Neo' }]);
  });

  it('falls back to local on remote failure when guests provided', async () => {
    vi.stubEnv('VITE_GUEST_SEARCH_MODE', 'remote');
    vi.stubEnv('VITE_API_BASE', 'https://api.test');
    mockedAxios.get = vi.fn().mockRejectedValue(new Error('network'));
    const guests: Guest[] = [{ id: '1', name: 'Lekana' }];
    const { result } = renderHook(() => useGuestSearch(guests));
    const res = await result.current('lek');
    expect(res).toEqual([guests[0]]);
  });
});
