import { PropertyApi, type Property } from '@/entities/Property';
import { DataGrid, type ColumnDef } from '@/features/DataGrid';
import { PropertyForm } from '@/features/PropertyForm';
import { queryKeys } from '@/shared/lib/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

const emptyMessage = 'No properties yet. Create your first property to get started.';

export function PropertiesPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Property | null>(null);

  const listQuery = useQuery({ queryKey: queryKeys.properties, queryFn: PropertyApi.list });

  const deleteMutation = useMutation({
    mutationFn: PropertyApi.remove,
    onSuccess: () => {
      toast.success('Property deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      setSelected(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to delete property';
      toast.error(message);
    },
  });

  useEffect(() => {
    if (import.meta.env.DEV && listQuery.data) {
      // eslint-disable-next-line no-console
      console.info('[empty-state]', '/properties', listQuery.data.length);
    }
  }, [listQuery.data]);

  const columns = useMemo<ColumnDef<Property>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="font-medium text-slate-700">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'address',
        header: 'Address',
        cell: ({ getValue }) => <span className="text-slate-600">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => (
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${
              getValue<string>() === 'active'
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {getValue<string>()}
          </span>
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
                if (window.confirm('Delete this property?')) {
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
      <PropertyForm
        property={selected}
        onSuccess={() => setSelected(null)}
        onCancel={() => setSelected(null)}
      />
      {listQuery.error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {(listQuery.error as Error).message}
        </div>
      ) : null}
      <DataGrid
        data={listQuery.data ?? []}
        columns={columns}
        isLoading={listQuery.isLoading}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}

export default PropertiesPage;
