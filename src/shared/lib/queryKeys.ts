export const queryKeys = {
  properties: ['properties'] as const,
  property: (id: string) => ['properties', id] as const,
  listings: ['listings'] as const,
  listing: (id: string) => ['listings', id] as const,
  bookings: ['bookings'] as const,
  booking: (id: string) => ['bookings', id] as const,
  guests: ['guests'] as const,
  guest: (id: string) => ['guests', id] as const,
};
