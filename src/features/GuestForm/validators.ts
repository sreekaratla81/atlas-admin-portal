import { guestInputSchema } from '@/entities/Guest';
import { z } from 'zod';

export const guestFormSchema = guestInputSchema;
export type GuestFormValues = z.infer<typeof guestFormSchema>;

export const guestFormDefaults: GuestFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
};
