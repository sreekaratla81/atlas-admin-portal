export function buildBookingPayload({
  booking,
  selectedGuest,
  selectedGuestId,
  selectedListing,
  guestsPlanned,
  guestsActual,
  extraGuestCharge
}) {
  let guestId = selectedGuest ? selectedGuest.id : selectedGuestId;
  guestId = Number(guestId);

  const listingId = selectedListing ? selectedListing.id : parseInt(booking.listingId);

  return {
    ...booking,
    guestId: guestId,
    listingId: Number(listingId),
    notes: booking.notes?.trim() || '-',
    bankAccountId: booking.bankAccountId ? parseInt(booking.bankAccountId) : null,
    amountGuestPaid: parseFloat(booking.amountGuestPaid),
    commissionAmount: parseFloat(booking.commissionAmount),
    amountReceived: parseFloat(booking.amountReceived),
    guestsPlanned,
    guestsActual,
    extraGuestCharge
  };
}
