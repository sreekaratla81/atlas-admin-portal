export interface Booking {
  id: number;
  listingId: number;
  guestId: number;
  checkinDate: string;
  checkoutDate: string;
  paymentStatus: string;
  bookingSource: string;
  guestsPlanned: number;
  guestsActual: number;
  extraGuestCharge: number;
  commissionAmount: number;
  amountReceived: number;
  bankAccountId?: number | null;
  bankAccount?: { bankName?: string; accountNumber?: string } | null;
  // NEW (from API projection)
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  // keep existing optional nested guest if it ever arrives
  guest?: { name?: string; phone?: string; email?: string } | null;
}
