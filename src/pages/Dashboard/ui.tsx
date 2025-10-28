import { BookingApi } from '@/entities/Booking';
import { GuestApi } from '@/entities/Guest';
import { ListingApi } from '@/entities/Listing';
import { PropertyApi } from '@/entities/Property';
import { queryKeys } from '@/shared/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';

export function DashboardPage() {
  const propertiesQuery = useQuery({ queryKey: queryKeys.properties, queryFn: PropertyApi.list });
  const listingsQuery = useQuery({ queryKey: queryKeys.listings, queryFn: ListingApi.list });
  const bookingsQuery = useQuery({ queryKey: queryKeys.bookings, queryFn: BookingApi.list });
  const guestsQuery = useQuery({ queryKey: queryKeys.guests, queryFn: GuestApi.list });

  const cards = [
    { title: 'Properties', value: propertiesQuery.data?.length ?? 0 },
    { title: 'Listings', value: listingsQuery.data?.length ?? 0 },
    { title: 'Bookings', value: bookingsQuery.data?.length ?? 0 },
    { title: 'Guests', value: guestsQuery.data?.length ?? 0 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase text-slate-500">{card.title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export default DashboardPage;
