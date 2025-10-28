import type { Guest } from '@/entities/Guest';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { GuestsPage } from './ui';

const guests: Guest[] = [
  {
    id: 'g1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '555-1234',
    notes: '',
  },
];

vi.mock('@/entities/Guest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Guest')>();
  return {
    ...actual,
    GuestApi: {
      ...actual.GuestApi,
      list: vi.fn().mockResolvedValue(guests),
      remove: vi.fn().mockResolvedValue(undefined),
    },
  };
});

describe('GuestsPage', () => {
  it('renders guest data', async () => {
    renderWithQuery(<GuestsPage />);

    expect(screen.getAllByTestId('datagrid-skeleton-row')).toHaveLength(10);

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    });
  });
});
