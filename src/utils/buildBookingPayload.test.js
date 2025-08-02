import { describe, it, expect } from 'vitest';
import { buildBookingPayload } from './buildBookingPayload';

describe('buildBookingPayload', () => {
  it('constructs payload with guest and listing ids and defaults notes', () => {
    const booking = {
      id: 1,
      listingId: '',
      checkinDate: '2024-01-01',
      checkoutDate: '2024-01-02',
      bookingSource: 'Walk-in',
      commissionAmount: '10',
      amountReceived: '90',
      notes: '',
      bankAccountId: ''
    };

    const payload = buildBookingPayload({
      booking,
      selectedGuest: { id: 5, name: 'John' },
      selectedGuestId: '',
      selectedListing: { id: 3, name: 'Villa' },
      guestsPlanned: 2,
      guestsActual: 2,
      extraGuestCharge: 0
    });

    expect(payload.guestId).toBe(5);
    expect(payload.listingId).toBe(3);
    expect(payload.notes).toBe('-');
  });
});
