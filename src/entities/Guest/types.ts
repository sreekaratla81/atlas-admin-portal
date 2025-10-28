import { z } from 'zod';

export const guestSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Email is invalid'),
  phone: z.string().min(7, 'Phone is required'),
  notes: z.string().optional(),
});

export const guestListSchema = z.array(guestSchema);
export const guestInputSchema = guestSchema.omit({ id: true });

export type Guest = z.infer<typeof guestSchema>;
export type GuestList = z.infer<typeof guestListSchema>;
export type GuestInput = z.infer<typeof guestInputSchema>;
