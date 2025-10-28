import { BookingApi } from '@/entities/Booking';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { BookingForm } from './ui';

vi.mock('@/entities/Booking', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Booking')>();
  return {
    ...actual,
    BookingApi: {
      ...actual.BookingApi,
      create: vi.fn().mockResolvedValue({
        id: 'b1',
        listingId: 'l1',
        guestId: 'g1',
        checkIn: '2024-05-01',
        checkOut: '2024-05-05',
        status: 'confirmed',
        total: 600,
      }),
    },
  };
});

describe('BookingForm', () => {
  it('submits successfully', async () => {
    renderWithQuery(<BookingForm />);

    await userEvent.type(screen.getByLabelText('Listing ID'), 'l1');
    await userEvent.type(screen.getByLabelText('Guest ID'), 'g1');
    await userEvent.type(screen.getByLabelText('Check-in'), '2024-05-01');
    await userEvent.type(screen.getByLabelText('Check-out'), '2024-05-05');
    await userEvent.type(screen.getByLabelText('Total ($)'), '600');
    await userEvent.click(screen.getByRole('button', { name: /create booking/i }));

    await waitFor(() => {
      expect(BookingApi.create).toHaveBeenCalled();
    });
  });
});
