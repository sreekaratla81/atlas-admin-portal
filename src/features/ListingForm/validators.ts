import { listingInputSchema } from '@/entities/Listing';
import { z } from 'zod';

export const listingFormSchema = listingInputSchema.extend({
  price: z.coerce.number().nonnegative('Price must be positive'),
});

export type ListingFormValues = z.infer<typeof listingFormSchema>;

export const listingFormDefaults: ListingFormValues = {
  title: '',
  propertyId: '',
  price: 0,
  status: 'draft',
};
