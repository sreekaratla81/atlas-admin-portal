import type { Booking } from '@/entities/Booking';
import type { Guest } from '@/entities/Guest';
import type { Listing } from '@/entities/Listing';
import type { Property } from '@/entities/Property';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { DashboardPage } from './ui';

const properties: Property[] = [
  { id: 'p1', name: 'Atlas Loft', address: '123 Ocean Ave', status: 'active' },
];

const listings: Listing[] = [
  { id: 'l1', title: 'Downtown Loft', propertyId: 'p1', price: 150, status: 'published' },
];

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

vi.mock('@/entities/Property', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Property')>();
  return {
    ...actual,
    PropertyApi: {
      ...actual.PropertyApi,
      list: vi.fn().mockResolvedValue(properties),
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

vi.mock('@/entities/Booking', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Booking')>();
  return {
    ...actual,
    BookingApi: {
      ...actual.BookingApi,
      list: vi.fn().mockResolvedValue(bookings),
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

describe('DashboardPage', () => {
  it('shows entity counts', async () => {
    renderWithQuery(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Properties')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
