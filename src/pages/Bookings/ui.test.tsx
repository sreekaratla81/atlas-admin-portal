import type { Booking } from '@/entities/Booking';
import type { Guest } from '@/entities/Guest';
import type { Listing } from '@/entities/Listing';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { BookingsPage } from './ui';

const bookings: Booking[] = [
  {
    id: 'b1',
    listingId: 'l1',
    guestId: 'g1',
    checkIn: '2024-05-01',
    checkOut: '2024-05-05',
    status: 'confirmed',
    total: 600,
  },
];

const listings: Listing[] = [
  { id: 'l1', title: 'Downtown Loft', propertyId: 'p1', price: 150, status: 'published' },
];

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

vi.mock('@/entities/Booking', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Booking')>();
  return {
    ...actual,
    BookingApi: {
      ...actual.BookingApi,
      list: vi.fn().mockResolvedValue(bookings),
      remove: vi.fn().mockResolvedValue(undefined),
    },
  };
});

vi.mock('@/entities/Listing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Listing')>();
  return {
    ...actual,
    ListingApi: {
      ...actual.ListingApi,
      list: vi.fn().mockResolvedValue(listings),
    },
  };
});

vi.mock('@/entities/Guest', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Guest')>();
  return {
    ...actual,
    GuestApi: {
      ...actual.GuestApi,
      list: vi.fn().mockResolvedValue(guests),
    },
  };
});

describe('BookingsPage', () => {
  it('renders bookings data', async () => {
    renderWithQuery(<BookingsPage />);

    expect(screen.getAllByTestId('datagrid-skeleton-row')).toHaveLength(10);

    await waitFor(() => {
      expect(screen.getByText('Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
  });
});
