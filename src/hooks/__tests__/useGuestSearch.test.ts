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
});

