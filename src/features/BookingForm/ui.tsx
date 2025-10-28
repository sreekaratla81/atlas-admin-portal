import { BookingApi, type Booking } from '@/entities/Booking';
import { queryKeys } from '@/shared/lib/queryKeys';
import { Form, FormField, Input, Select, SubmitButton } from '@/shared/ui/Form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { bookingFormDefaults, bookingFormSchema, type BookingFormValues } from './validators';

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export interface BookingFormProps {
  booking?: Booking | null;
  onSuccess?: (booking: Booking) => void;
  onCancel?: () => void;
}

export function BookingForm({ booking, onSuccess, onCancel }: BookingFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: bookingFormDefaults,
  });

  useEffect(() => {
    if (booking) {
      form.reset({
        listingId: booking.listingId,
        guestId: booking.guestId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        total: booking.total,
      });
    } else {
      form.reset(bookingFormDefaults);
    }
  }, [form, booking]);

  const createMutation = useMutation({
    mutationFn: BookingApi.create,
    onSuccess: (result) => {
      toast.success('Booking created');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      onSuccess?.(result);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to create booking';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: BookingFormValues) => {
      if (!booking) {
        throw new Error('Booking not found');
      }
      return BookingApi.update(booking.id, values);
    },
    onSuccess: (result) => {
      toast.success('Booking updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      onSuccess?.(result);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update booking';
      toast.error(message);
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: BookingFormValues) => {
    if (booking) {
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
          name="listingId"
          label="Listing ID"
          render={({ field }) => <Input {...field} placeholder="list_123" />}
        />
        <FormField
          control={form.control}
          name="guestId"
          label="Guest ID"
          render={({ field }) => <Input {...field} placeholder="guest_123" />}
        />
        <FormField
          control={form.control}
          name="checkIn"
          label="Check-in"
          render={({ field }) => <Input {...field} type="date" />}
        />
        <FormField
          control={form.control}
          name="checkOut"
          label="Check-out"
          render={({ field }) => <Input {...field} type="date" />}
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
        <FormField
          control={form.control}
          name="total"
          label="Total ($)"
          render={({ field }) => (
            <Input {...field} type="number" min={0} step={10} placeholder="500" />
          )}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton isSubmitting={isSubmitting}>
          {booking ? 'Update Booking' : 'Create Booking'}
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
