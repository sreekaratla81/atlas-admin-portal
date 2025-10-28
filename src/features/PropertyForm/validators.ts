import { propertyInputSchema } from '@/entities/Property';
import { z } from 'zod';

export const propertyFormSchema = propertyInputSchema.extend({
  status: propertyInputSchema.shape.status.default('active'),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export const propertyFormDefaults: PropertyFormValues = {
  name: '',
  address: '',
  status: 'active',
};
