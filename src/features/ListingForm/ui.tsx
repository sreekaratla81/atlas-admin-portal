import { ListingApi, type Listing } from '@/entities/Listing';
import { queryKeys } from '@/shared/lib/queryKeys';
import { Form, FormField, Input, Select, SubmitButton } from '@/shared/ui/Form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { listingFormDefaults, listingFormSchema, type ListingFormValues } from './validators';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export interface ListingFormProps {
  listing?: Listing | null;
  onSuccess?: (listing: Listing) => void;
  onCancel?: () => void;
}

export function ListingForm({ listing, onSuccess, onCancel }: ListingFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: listingFormDefaults,
  });

  useEffect(() => {
    if (listing) {
      form.reset({
        title: listing.title,
        propertyId: listing.propertyId,
        price: listing.price,
        status: listing.status,
      });
    } else {
      form.reset(listingFormDefaults);
    }
  }, [form, listing]);

  const createMutation = useMutation({
    mutationFn: ListingApi.create,
    onSuccess: (result) => {
      toast.success('Listing created');
      queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      onSuccess?.(result);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create listing';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: ListingFormValues) => {
      if (!listing) {
        throw new Error('Listing not found');
      }
      return ListingApi.update(listing.id, values);
    },
    onSuccess: (result) => {
      toast.success('Listing updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.listings });
      onSuccess?.(result);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update listing';
      toast.error(message);
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: ListingFormValues) => {
    if (listing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Form
      methods={form}
      onSubmit={handleSubmit}
      className="space-y-4 rounded border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="title"
          label="Title"
          render={({ field }) => <Input {...field} placeholder="2BR Downtown Loft" />}
        />
        <FormField
          control={form.control}
          name="propertyId"
          label="Property ID"
          render={({ field }) => <Input {...field} placeholder="prop_123" />}
        />
        <FormField
          control={form.control}
          name="price"
          label="Nightly Rate"
          render={({ field }) => (
            <Input {...field} type="number" min={0} step={10} placeholder="150" />
          )}
        />
        <FormField
          control={form.control}
          name="status"
          label="Status"
          render={({ field }) => (
            <Select {...field}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton isSubmitting={isSubmitting}>
          {listing ? 'Update Listing' : 'Create Listing'}
        </SubmitButton>
        {onCancel ? (
          <button
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </Form>
  );
}
