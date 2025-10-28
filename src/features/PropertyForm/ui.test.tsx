import { PropertyApi } from '@/entities/Property';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { PropertyForm } from './ui';

vi.mock('@/entities/Property', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/Property')>();
  return {
    ...actual,
    PropertyApi: {
      ...actual.PropertyApi,
      create: vi.fn().mockResolvedValue({
        id: '1',
        name: 'Atlas Loft',
        address: '123 Ocean Ave',
        status: 'active',
      }),
      update: vi.fn().mockResolvedValue({
        id: '1',
        name: 'Updated Loft',
        address: '123 Ocean Ave',
        status: 'inactive',
      }),
    },
  };
});

describe('PropertyForm', () => {
  it('submits successfully', async () => {
    const onSuccess = vi.fn();
    renderWithQuery(<PropertyForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText('Property Name'), 'Atlas Loft');
    await userEvent.type(screen.getByLabelText('Address'), '123 Ocean Ave');
    await userEvent.click(screen.getByRole('button', { name: /create property/i }));

    await waitFor(() => {
      expect(PropertyApi.create).toHaveBeenCalledWith({
        name: 'Atlas Loft',
        address: '123 Ocean Ave',
        status: 'active',
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
