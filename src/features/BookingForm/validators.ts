import { bookingInputSchema } from '@/entities/Booking';
import { z } from 'zod';

export const bookingFormSchema = bookingInputSchema.extend({
  total: z.coerce.number().nonnegative('Total must be positive'),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const bookingFormDefaults: BookingFormValues = {
  listingId: '',
  guestId: '',
  checkIn: '',
  checkOut: '',
  status: 'pending',
  total: 0,
};
