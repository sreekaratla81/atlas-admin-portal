import { z } from 'zod';

export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled']);

export const bookingSchema = z.object({
  id: z.string(),
  listingId: z.string().min(1, 'Listing is required'),
  guestId: z.string().min(1, 'Guest is required'),
  checkIn: z.string().min(1, 'Check-in is required'),
  checkOut: z.string().min(1, 'Check-out is required'),
  status: bookingStatusSchema,
  total: z.number().nonnegative('Total must be positive'),
});

export const bookingListSchema = z.array(bookingSchema);
export const bookingInputSchema = bookingSchema.omit({ id: true });

export type Booking = z.infer<typeof bookingSchema>;
export type BookingList = z.infer<typeof bookingListSchema>;
export type BookingInput = z.infer<typeof bookingInputSchema>;
