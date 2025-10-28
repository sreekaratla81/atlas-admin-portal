import { z } from 'zod';

export const listingStatusSchema = z.enum(['draft', 'published']);

export const listingSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  propertyId: z.string().min(1, 'Property is required'),
  price: z.number().nonnegative('Price must be positive'),
  status: listingStatusSchema,
  createdAt: z.string().optional(),
});

export const listingListSchema = z.array(listingSchema);
export const listingInputSchema = listingSchema.omit({ id: true, createdAt: true });

export type Listing = z.infer<typeof listingSchema>;
export type ListingList = z.infer<typeof listingListSchema>;
export type ListingInput = z.infer<typeof listingInputSchema>;
