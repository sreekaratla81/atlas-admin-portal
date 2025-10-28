import type { Listing } from '@/entities/Listing';
import type { Property } from '@/entities/Property';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { ListingsPage } from './ui';

const listings: Listing[] = [
  { id: 'l1', title: 'Downtown Loft', propertyId: 'p1', price: 150, status: 'published' },
];

const properties: Property[] = [
  { id: 'p1', name: 'Atlas Loft', address: '123 Ocean Ave', status: 'active' },
];

vi.mock('@/entities/Listing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Listing')>();
  return {
    ...actual,
    ListingApi: {
      ...actual.ListingApi,
      list: vi.fn().mockResolvedValue(listings),
      remove: vi.fn().mockResolvedValue(undefined),
    },
  };
});

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

describe('ListingsPage', () => {
  it('renders listings data', async () => {
    renderWithQuery(<ListingsPage />);

    expect(screen.getAllByTestId('datagrid-skeleton-row')).toHaveLength(10);

    await waitFor(() => {
      expect(screen.getByText('Downtown Loft')).toBeInTheDocument();
      expect(screen.getByText('Atlas Loft')).toBeInTheDocument();
    });
  });
});
