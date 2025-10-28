import { PropertyApi, type Property } from '@/entities/Property';
import { queryKeys } from '@/shared/lib/queryKeys';
import { Form, FormField, Input, Select, SubmitButton } from '@/shared/ui/Form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { propertyFormDefaults, propertyFormSchema, type PropertyFormValues } from './validators';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export interface PropertyFormProps {
  property?: Property | null;
  onSuccess?: (property: Property) => void;
  onCancel?: () => void;
}

export function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: propertyFormDefaults,
  });

  useEffect(() => {
    if (property) {
      form.reset({
        name: property.name,
        address: property.address,
        status: property.status,
      });
    } else {
      form.reset(propertyFormDefaults);
    }
  }, [form, property]);

  const createMutation = useMutation({
    mutationFn: PropertyApi.create,
    onSuccess: (result) => {
      toast.success('Property created');
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      onSuccess?.(result);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create property';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: PropertyFormValues) => {
      if (!property) {
        throw new Error('Property not found');
      }
      return PropertyApi.update(property.id, values);
    },
    onSuccess: (result) => {
      toast.success('Property updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.properties });
      onSuccess?.(result);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update property';
      toast.error(message);
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: PropertyFormValues) => {
    if (property) {
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
          name="name"
          label="Property Name"
          render={({ field }) => <Input {...field} placeholder="Atlas Villa" />}
        />
        <FormField
          control={form.control}
          name="address"
          label="Address"
          render={({ field }) => <Input {...field} placeholder="123 Ocean Ave" />}
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
          {property ? 'Update Property' : 'Create Property'}
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
