import { del, get as httpGet, post, put } from '@/shared/lib/http';

import {
  listingInputSchema,
  listingListSchema,
  listingSchema,
  type Listing,
  type ListingInput,
  type ListingList,
} from './types';

const basePath = '/listings';

export async function list(): Promise<ListingList> {
  const data = await httpGet<unknown>(basePath);
  return listingListSchema.parse(data);
}

export async function get(id: string): Promise<Listing> {
  const data = await httpGet<unknown>(`${basePath}/${id}`);
  return listingSchema.parse(data);
}

export async function create(payload: ListingInput): Promise<Listing> {
  const body = listingInputSchema.parse(payload);
  const data = await post<unknown, ListingInput>(basePath, body);
  return listingSchema.parse(data);
}

export async function update(id: string, payload: ListingInput): Promise<Listing> {
  const body = listingInputSchema.parse(payload);
  const data = await put<unknown, ListingInput>(`${basePath}/${id}`, body);
  return listingSchema.parse(data);
}

export async function remove(id: string): Promise<void> {
  await del(`${basePath}/${id}`);
}

export const ListingApi = {
  list,
  get,
  create,
  update,
  remove,
};
