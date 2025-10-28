import { GuestApi, type Guest } from '@/entities/Guest';
import { DataGrid, type ColumnDef } from '@/features/DataGrid';
import { GuestForm } from '@/features/GuestForm';
import { queryKeys } from '@/shared/lib/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

const emptyMessage = 'No guests yet. Add a guest when they book their stay.';

export function GuestsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Guest | null>(null);

  const guestsQuery = useQuery({ queryKey: queryKeys.guests, queryFn: GuestApi.list });

  const deleteMutation = useMutation({
    mutationFn: GuestApi.remove,
    onSuccess: () => {
      toast.success('Guest deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.guests });
      setSelected(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to delete guest';
      toast.error(message);
    },
  });

  useEffect(() => {
    if (import.meta.env.DEV && guestsQuery.data) {
      // eslint-disable-next-line no-console
      console.info('[empty-state]', '/guests', guestsQuery.data.length);
    }
  }, [guestsQuery.data]);

  const columns = useMemo<ColumnDef<Guest>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: 'Name',
        cell: ({ row }) => (
          <span className="font-medium text-slate-700">
            {row.original.firstName} {row.original.lastName}
          </span>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ getValue }) => <span className="text-slate-500">{getValue<string>() ?? '—'}</span>,
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
                if (window.confirm('Delete this guest?')) {
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
    [deleteMutation.isPending],
  );

  return (
    <div className="space-y-6">
      <GuestForm
        guest={selected}
        onSuccess={() => setSelected(null)}
        onCancel={() => setSelected(null)}
      />
      {guestsQuery.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(guestsQuery.error as Error).message}
        </div>
      ) : null}
      <DataGrid
        data={guestsQuery.data ?? []}
        columns={columns}
        isLoading={guestsQuery.isLoading}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default GuestsPage;
