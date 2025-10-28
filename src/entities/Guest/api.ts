import { del, get as httpGet, post, put } from '@/shared/lib/http';

import {
  guestInputSchema,
  guestListSchema,
  guestSchema,
  type Guest,
  type GuestInput,
  type GuestList,
} from './types';

const basePath = '/guests';

export async function list(): Promise<GuestList> {
  const data = await httpGet<unknown>(basePath);
  return guestListSchema.parse(data);
}

export async function get(id: string): Promise<Guest> {
  const data = await httpGet<unknown>(`${basePath}/${id}`);
  return guestSchema.parse(data);
}

export async function create(payload: GuestInput): Promise<Guest> {
  const body = guestInputSchema.parse(payload);
  const data = await post<unknown, GuestInput>(basePath, body);
  return guestSchema.parse(data);
}

export async function update(id: string, payload: GuestInput): Promise<Guest> {
  const body = guestInputSchema.parse(payload);
  const data = await put<unknown, GuestInput>(`${basePath}/${id}`, body);
  return guestSchema.parse(data);
}

export async function remove(id: string): Promise<void> {
  await del(`${basePath}/${id}`);
}

export const GuestApi = {
  list,
  get,
  create,
  update,
  remove,
};
