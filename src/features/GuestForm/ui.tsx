import { GuestApi, type Guest } from '@/entities/Guest';
import { queryKeys } from '@/shared/lib/queryKeys';
import { Form, FormField, Input, SubmitButton } from '@/shared/ui/Form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { guestFormDefaults, guestFormSchema, type GuestFormValues } from './validators';

export interface GuestFormProps {
  guest?: Guest | null;
  onSuccess?: (guest: Guest) => void;
  onCancel?: () => void;
}

export function GuestForm({ guest, onSuccess, onCancel }: GuestFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: guestFormDefaults,
  });

  useEffect(() => {
    if (guest) {
      form.reset({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        notes: guest.notes ?? '',
      });
    } else {
      form.reset(guestFormDefaults);
    }
  }, [form, guest]);

  const createMutation = useMutation({
    mutationFn: GuestApi.create,
    onSuccess: (result) => {
      toast.success('Guest added');
      queryClient.invalidateQueries({ queryKey: queryKeys.guests });
      onSuccess?.(result);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create guest';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: GuestFormValues) => {
      if (!guest) {
        throw new Error('Guest not found');
      }
      return GuestApi.update(guest.id, values);
    },
    onSuccess: (result) => {
      toast.success('Guest updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.guests });
      onSuccess?.(result);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update guest';
      toast.error(message);
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: GuestFormValues) => {
    if (guest) {
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
          name="firstName"
          label="First Name"
          render={({ field }) => <Input {...field} placeholder="Ada" />}
        />
        <FormField
          control={form.control}
          name="lastName"
          label="Last Name"
          render={({ field }) => <Input {...field} placeholder="Lovelace" />}
        />
        <FormField
          control={form.control}
          name="email"
          label="Email"
          render={({ field }) => <Input {...field} type="email" placeholder="ada@example.com" />}
        />
        <FormField
          control={form.control}
          name="phone"
          label="Phone"
          render={({ field }) => <Input {...field} placeholder="+1 555-1234" />}
        />
        <FormField
          control={form.control}
          name="notes"
          label="Notes"
          render={({ field }) => <Input {...field} placeholder="VIP guest notes" />}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton isSubmitting={isSubmitting}>
          {guest ? 'Update Guest' : 'Create Guest'}
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
