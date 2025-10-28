import { del, get as httpGet, post, put } from '@/shared/lib/http';

import {
  bookingInputSchema,
  bookingListSchema,
  bookingSchema,
  type Booking,
  type BookingInput,
  type BookingList,
} from './types';

const basePath = '/bookings';

export async function list(): Promise<BookingList> {
  const data = await httpGet<unknown>(basePath);
  return bookingListSchema.parse(data);
}

export async function get(id: string): Promise<Booking> {
  const data = await httpGet<unknown>(`${basePath}/${id}`);
  return bookingSchema.parse(data);
}

export async function create(payload: BookingInput): Promise<Booking> {
  const body = bookingInputSchema.parse(payload);
  const data = await post<unknown, BookingInput>(basePath, body);
  return bookingSchema.parse(data);
}

export async function update(id: string, payload: BookingInput): Promise<Booking> {
  const body = bookingInputSchema.parse(payload);
  const data = await put<unknown, BookingInput>(`${basePath}/${id}`, body);
  return bookingSchema.parse(data);
}

export async function remove(id: string): Promise<void> {
  await del(`${basePath}/${id}`);
}

export const BookingApi = {
  list,
  get,
  create,
  update,
  remove,
};
