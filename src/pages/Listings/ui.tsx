import { ListingApi, type Listing } from '@/entities/Listing';
import { PropertyApi } from '@/entities/Property';
import { DataGrid, type ColumnDef } from '@/features/DataGrid';
import { ListingForm } from '@/features/ListingForm';
import { queryKeys } from '@/shared/lib/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

const emptyMessage = 'No listings available. Publish a listing to make it discoverable.';

export function ListingsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Listing | null>(null);

  const listingsQuery = useQuery({ queryKey: queryKeys.listings, queryFn: ListingApi.list });
  const propertiesQuery = useQuery({ queryKey: queryKeys.properties, queryFn: PropertyApi.list });

  const deleteMutation = useMutation({
    mutationFn: ListingApi.remove,
    onSuccess: () => {
      toast.success('Listing deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      setSelected(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to delete listing';
      toast.error(message);
    },
  });

  useEffect(() => {
    if (import.meta.env.DEV && listingsQuery.data) {
      // eslint-disable-next-line no-console
      console.info('[empty-state]', '/listings', listingsQuery.data.length);
    }
  }, [listingsQuery.data]);

  const propertyLookup = useMemo(() => {
    const map = new Map<string, string>();
    propertiesQuery.data?.forEach((property) => {
      map.set(property.id, property.name);
    });
    return map;
  }, [propertiesQuery.data]);

  const columns = useMemo<ColumnDef<Listing>[]>(
    () => [
      { accessorKey: 'title', header: 'Title' },
      {
        accessorKey: 'propertyId',
        header: 'Property',
        cell: ({ getValue }) => propertyLookup.get(getValue<string>()) ?? getValue<string>(),
      },
      {
        accessorKey: 'price',
        header: 'Nightly Rate',
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
                if (window.confirm('Delete this listing?')) {
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
    [deleteMutation.isPending, propertyLookup],
  );

  return (
    <div className="space-y-6">
      <ListingForm
        listing={selected}
        onSuccess={() => setSelected(null)}
        onCancel={() => setSelected(null)}
      />
      {listingsQuery.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(listingsQuery.error as Error).message}
        </div>
      ) : null}
      <DataGrid
        data={listingsQuery.data ?? []}
        columns={columns}
        isLoading={listingsQuery.isLoading}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default ListingsPage;
