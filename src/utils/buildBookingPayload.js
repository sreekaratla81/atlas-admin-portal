export function buildBookingPayload({
  booking,
  selectedGuest,
  selectedGuestId,
  guestsPlanned,
  guestsActual,
  extraGuestCharge
}) {
  let guestId = selectedGuest ? selectedGuest.id : selectedGuestId;
  guestId = Number(guestId);

  const listingId = booking?.listingId != null && booking.listingId !== ''
    ? Number(booking.listingId)
    : undefined;
  const normalizedListingId = Number.isFinite(listingId) ? listingId : null;

  return {
    ...booking,
    guestId,
    listingId: normalizedListingId,
    notes: booking.notes?.trim() || '-',
    bankAccountId: booking.bankAccountId ? parseInt(booking.bankAccountId) : null,
    commissionAmount: parseFloat(booking.commissionAmount),
    amountReceived: parseFloat(booking.amountReceived),
    guestsPlanned,
    guestsActual,
    extraGuestCharge
  };
}
