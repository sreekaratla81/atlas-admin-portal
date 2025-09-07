/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGuestSearch, type Guest } from '../useGuestSearch';

describe('useGuestSearch', () => {
  it('filters guests locally', async () => {
    const guests: Guest[] = [
      { id: '1', name: 'Lekana', email: 'l@example.com', phone: '123' },
      { id: '2', name: 'Ravi', email: 'r@example.com', phone: '456' },
    ];
    const { result } = renderHook(() => useGuestSearch(guests));
    const res = await result.current('lek');
    expect(res).toEqual([guests[0]]);
  });

  it('handles guests missing email or phone', async () => {
    const guests: Guest[] = [
      { id: '1', name: 'Alpha' },
      { id: '2', name: 'Beta', email: 'b@example.com' },
      { id: '3', name: 'Gamma', phone: '789' },
    ];
    const { result } = renderHook(() => useGuestSearch(guests));
    const res = await result.current('gam');
    expect(res).toEqual([guests[2]]);
  });
  it('ignores null or undefined guest entries', async () => {
    const guests: any[] = [undefined, { id: '1', name: 'Alpha' }, null];
    const { result } = renderHook(() => useGuestSearch(guests as Guest[]));
    const res = await result.current('alpha');
    expect(res).toEqual([{ id: '1', name: 'Alpha' }]);
  });
});

