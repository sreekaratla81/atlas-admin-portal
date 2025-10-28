import { BookingApi, type Booking } from '@/entities/Booking';
import { GuestApi } from '@/entities/Guest';
import { ListingApi } from '@/entities/Listing';
import { BookingForm } from '@/features/BookingForm';
import { DataGrid, type ColumnDef } from '@/features/DataGrid';
import { queryKeys } from '@/shared/lib/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

const emptyMessage = 'No bookings recorded yet. Capture reservations as they come in.';

export function BookingsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Booking | null>(null);

  const bookingsQuery = useQuery({ queryKey: queryKeys.bookings, queryFn: BookingApi.list });
  const listingsQuery = useQuery({ queryKey: queryKeys.listings, queryFn: ListingApi.list });
  const guestsQuery = useQuery({ queryKey: queryKeys.guests, queryFn: GuestApi.list });

  const deleteMutation = useMutation({
    mutationFn: BookingApi.remove,
    onSuccess: () => {
      toast.success('Booking deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      setSelected(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to delete booking';
      toast.error(message);
    },
  });

  useEffect(() => {
    if (import.meta.env.DEV && bookingsQuery.data) {
      // eslint-disable-next-line no-console
      console.info('[empty-state]', '/bookings', bookingsQuery.data.length);
    }
  }, [bookingsQuery.data]);

  const listingLookup = useMemo(() => {
    const map = new Map<string, string>();
    listingsQuery.data?.forEach((listing) => {
      map.set(listing.id, listing.title);
    });
    return map;
  }, [listingsQuery.data]);

  const guestLookup = useMemo(() => {
    const map = new Map<string, string>();
    guestsQuery.data?.forEach((guest) => {
      map.set(guest.id, `${guest.firstName} ${guest.lastName}`);
    });
    return map;
  }, [guestsQuery.data]);

  const columns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: 'listingId',
        header: 'Listing',
        cell: ({ getValue }) => listingLookup.get(getValue<string>()) ?? getValue<string>(),
      },
      {
        accessorKey: 'guestId',
        header: 'Guest',
        cell: ({ getValue }) => guestLookup.get(getValue<string>()) ?? getValue<string>(),
      },
      {
        accessorKey: 'checkIn',
        header: 'Check-in',
        cell: ({ getValue }) => format(new Date(getValue<string>()), 'MMM d, yyyy'),
      },
      {
        accessorKey: 'checkOut',
        header: 'Check-out',
        cell: ({ getValue }) => format(new Date(getValue<string>()), 'MMM d, yyyy'),
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <span className="uppercase text-slate-600">{getValue<string>()}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              onClick={() => setSelected(row.original)}
            >
              Edit
            </button>
            <button
              type="button"
              className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              onClick={() => {
                if (window.confirm('Delete this booking?')) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation.isPending, guestLookup, listingLookup],
  );

  return (
    <div className="space-y-6">
      <BookingForm
        booking={selected}
        onSuccess={() => setSelected(null)}
        onCancel={() => setSelected(null)}
      />
      {bookingsQuery.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(bookingsQuery.error as Error).message}
        </div>
      ) : null}
      <DataGrid
        data={bookingsQuery.data ?? []}
        columns={columns}
        isLoading={bookingsQuery.isLoading}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default BookingsPage;
