/**
 * Listings API for selector in messaging (existing Atlas API /listings).
 */

import { api, asArray } from "@/lib/api";

export interface Listing {
  id: number;
  name: string;
  propertyId?: number;
  status?: string;
}

export async function getListings(): Promise<Listing[]> {
  const { data } = await api.get("/listings");
  return asArray(data, "listings").map((item: Record<string, unknown>) => ({
    id: Number(item.id),
    name: String(item.name ?? ""),
    propertyId: item.propertyId != null ? Number(item.propertyId) : undefined,
    status: item.status != null ? String(item.status) : undefined,
  }));
}
