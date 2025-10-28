import { GuestApi } from '@/entities/Guest';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { GuestForm } from './ui';

vi.mock('@/entities/Guest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Guest')>();
  return {
    ...actual,
    GuestApi: {
      ...actual.GuestApi,
      create: vi.fn().mockResolvedValue({
        id: 'g1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '555-1234',
        notes: '',
      }),
    },
  };
});

describe('GuestForm', () => {
  it('submits successfully', async () => {
    renderWithQuery(<GuestForm />);

    await userEvent.type(screen.getByLabelText('First Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Last Name'), 'Lovelace');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Phone'), '555-1234');
    await userEvent.click(screen.getByRole('button', { name: /create guest/i }));

    await waitFor(() => {
      expect(GuestApi.create).toHaveBeenCalled();
    });
  });
});
