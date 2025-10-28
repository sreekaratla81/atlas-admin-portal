import { del, get as httpGet, post, put } from '@/shared/lib/http';

import {
  propertyInputSchema,
  propertyListSchema,
  propertySchema,
  type Property,
  type PropertyInput,
  type PropertyList,
} from './types';

const basePath = '/properties';

export async function list(): Promise<PropertyList> {
  const data = await httpGet<unknown>(basePath);
  return propertyListSchema.parse(data);
}

export async function get(id: string): Promise<Property> {
  const data = await httpGet<unknown>(`${basePath}/${id}`);
  return propertySchema.parse(data);
}

export async function create(payload: PropertyInput): Promise<Property> {
  const body = propertyInputSchema.parse(payload);
  const data = await post<unknown, PropertyInput>(basePath, body);
  return propertySchema.parse(data);
}

export async function update(id: string, payload: PropertyInput): Promise<Property> {
  const body = propertyInputSchema.parse(payload);
  const data = await put<unknown, PropertyInput>(`${basePath}/${id}`, body);
  return propertySchema.parse(data);
}

export async function remove(id: string): Promise<void> {
  await del(`${basePath}/${id}`);
}

export const PropertyApi = {
  list,
  get,
  create,
  update,
  remove,
};
