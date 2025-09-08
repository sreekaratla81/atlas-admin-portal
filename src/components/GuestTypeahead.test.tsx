/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import GuestTypeahead from './GuestTypeahead';

describe('GuestTypeahead', () => {
  afterEach(() => cleanup());
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

  it('displays the provided value', () => {
    const guest = { id: '1', name: 'Alice' } as any;
    render(<GuestTypeahead allGuests={[guest]} value={guest} onSelect={() => {}} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('Alice');
  });
});
