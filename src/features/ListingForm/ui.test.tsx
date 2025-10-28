import { ListingApi } from '@/entities/Listing';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { ListingForm } from './ui';

vi.mock('@/entities/Listing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Listing')>();
  return {
    ...actual,
    ListingApi: {
      ...actual.ListingApi,
      create: vi.fn().mockResolvedValue({
        id: 'l1',
        title: 'Downtown Loft',
        propertyId: 'p1',
        price: 150,
        status: 'published',
      }),
    },
  };
});

describe('ListingForm', () => {
  it('submits successfully', async () => {
    renderWithQuery(<ListingForm />);

    await userEvent.type(screen.getByLabelText('Title'), 'Downtown Loft');
    await userEvent.type(screen.getByLabelText('Property ID'), 'p1');
    await userEvent.type(screen.getByLabelText('Nightly Rate'), '150');
    await userEvent.click(screen.getByRole('button', { name: /create listing/i }));

    await waitFor(() => {
      expect(ListingApi.create).toHaveBeenCalledWith({
        title: 'Downtown Loft',
        propertyId: 'p1',
        price: 150,
        status: 'draft',
      });
    });
  });
});
