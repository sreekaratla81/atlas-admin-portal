import { z } from 'zod';

export const propertyStatusSchema = z.enum(['active', 'inactive']);

export const propertySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  status: propertyStatusSchema,
  createdAt: z.string().optional(),
});

export const propertyListSchema = z.array(propertySchema);
export const propertyInputSchema = propertySchema.omit({ id: true, createdAt: true });

export type Property = z.infer<typeof propertySchema>;
export type PropertyList = z.infer<typeof propertyListSchema>;
export type PropertyInput = z.infer<typeof propertyInputSchema>;
