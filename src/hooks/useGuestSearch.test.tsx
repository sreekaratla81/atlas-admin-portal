import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useGuestSearch from './useGuestSearch';
import { test, expect } from 'vitest';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

test('digits-only queries use min length 1', () => {
  const { rerender, result } = renderHook((q) => useGuestSearch(q), { wrapper, initialProps: '' });
  rerender('9');
  expect(result.current.minLength).toBe(1);
});
