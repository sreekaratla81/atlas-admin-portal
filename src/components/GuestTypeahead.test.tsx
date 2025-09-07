/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import GuestTypeahead from './GuestTypeahead';

describe('GuestTypeahead', () => {
  it('shows "Add new guest" when no matches and triggers onAddNew', async () => {
    const user = userEvent.setup();
    const onAddNew = vi.fn();
    render(<GuestTypeahead allGuests={[]} onSelect={() => {}} onAddNew={onAddNew} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'Bob');
    await new Promise(r => setTimeout(r, 350));
    const addNew = await screen.findByText(/Add new guest/i);
    await user.click(addNew);
    expect(onAddNew).toHaveBeenCalled();
  });
});
