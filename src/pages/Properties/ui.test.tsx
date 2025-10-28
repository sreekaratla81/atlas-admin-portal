import { PropertyApi, type Property } from '@/entities/Property';
import { renderWithQuery } from '@/test/utils';
import { screen, waitFor } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { PropertiesPage } from './ui';

const properties: Property[] = [
  { id: '1', name: 'Atlas Loft', address: '123 Ocean Ave', status: 'active' },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PropertiesPage', () => {
  it('renders skeleton then data rows', async () => {
    vi.spyOn(PropertyApi, 'list').mockResolvedValue(properties);
    vi.spyOn(PropertyApi, 'remove').mockResolvedValue(undefined);

    renderWithQuery(<PropertiesPage />);

    expect(screen.getAllByTestId('datagrid-skeleton-row')).toHaveLength(10);

    await waitFor(() => {
      expect(screen.getByText('Atlas Loft')).toBeInTheDocument();
    });
  });
});
