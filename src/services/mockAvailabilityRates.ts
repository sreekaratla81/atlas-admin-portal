import { addDays, getDay, isAfter, parseISO } from "date-fns";
import type { BulkUpdateSelection, CalendarDay, CalendarListing } from "@/api/availability";

const STORAGE_KEY = "atlas_mock_availability_overrides";

const buildDateArray = (from: string, to: string): string[] => {
  const start = parseISO(from);
  const end = parseISO(to);
  const dates: string[] = [];

  for (let current = start; !isAfter(current, end); current = addDays(current, 1)) {
    dates.push(current.toISOString().slice(0, 10));
  }

  return dates;
};

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashSeed = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
};

type OverrideState = Record<string, Partial<CalendarDay>>;

const overrideCache = new Map<number, OverrideState>();
let hasLoadedOverrides = false;

const safeLoadOverrides = () => {
  if (hasLoadedOverrides) return;
  hasLoadedOverrides = true;

  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const parsed = JSON.parse(stored) as Record<string, OverrideState>;
    Object.entries(parsed).forEach(([listingId, overrides]) => {
      overrideCache.set(Number(listingId), overrides ?? {});
    });
  } catch (error) {
    console.warn("Failed to load mock availability overrides", error);
  }
};

const persistOverrides = () => {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    const serialized: Record<string, OverrideState> = {};
    overrideCache.forEach((value, key) => {
      serialized[String(key)] = value;
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.warn("Failed to persist mock availability overrides", error);
  }
};

const getOverridesForListing = (listingId: number) => {
  safeLoadOverrides();
  return overrideCache.get(listingId) ?? {};
};

const setOverridesForListing = (listingId: number, overrides: OverrideState) => {
  overrideCache.set(listingId, overrides);
  persistOverrides();
};

const getBlockRate = (listingId: number) => {
  const rand = mulberry32(hashSeed(`block-${listingId}`));
  return 0.15 + rand() * 0.1; // 15-25%
};

const generateBaseDay = (listingId: number, date: string): CalendarDay => {
  const random = mulberry32(hashSeed(`${listingId}-${date}`));
  const dateObj = parseISO(date);
  const isWeekend = getDay(dateObj) === 0 || getDay(dateObj) === 6;
  const blockRate = getBlockRate(listingId);
  const blocked = random() < blockRate;

  const basePrice = 2200 + (listingId % 20) * 75 + random() * 400;
  const price = isWeekend ? basePrice * 1.2 : basePrice;

  return {
    date,
    status: blocked ? "blocked" : "open",
    price: Math.round(price),
    inventory: blocked ? 0 : 1,
    blockType: blocked ? "Maintenance" : undefined,
  };
};

const applyOverrides = (day: CalendarDay, overrides: Partial<CalendarDay>): CalendarDay => {
  const next: CalendarDay = { ...day };
  if (overrides.status) {
    next.status = overrides.status;
    next.blockType = overrides.blockType;
  }
  if (overrides.price !== undefined) {
    next.price = overrides.price;
  }
  if (overrides.inventory !== undefined) {
    next.inventory = overrides.inventory;
  }
  return next;
};

const buildListingDays = (listingId: number, dates: string[]): Record<string, CalendarDay> => {
  const overrides = getOverridesForListing(listingId);

  return dates.reduce<Record<string, CalendarDay>>((acc, date) => {
    const baseDay = generateBaseDay(listingId, date);
    const withOverrides = overrides[date] ? applyOverrides(baseDay, overrides[date]) : baseDay;
    acc[date] = withOverrides;
    return acc;
  }, {});
};


export const shouldUseMockAvailability = () =>
  import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_AVAILABILITY === "true";


export const fetchMockAvailability = async (
  listings: { id?: number; name?: string }[],
  startDate: string,
  endDate: string
): Promise<CalendarListing[]> => {
  const dates = buildDateArray(startDate, endDate);

  return listings
    .filter((listing) => listing.id != null && listing.name)
    .map((listing) => ({
      listingId: listing.id as number,
      listingName: listing.name as string,
      days: buildListingDays(listing.id as number, dates),
      ratePlans: [],
    }));
};

const applyOverrideUpdate = (
  listingId: number,
  dates: string[],
  update: Partial<CalendarDay>
) => {
  const current = { ...getOverridesForListing(listingId) };

  dates.forEach((date) => {
    const existing = current[date] ?? {};
    current[date] = {
      ...existing,
      ...update,
    };
  });

  setOverridesForListing(listingId, current);
};

export const updateMockRangeAvailability = (selection: BulkUpdateSelection) => {
  const targetListingId = selection.listingId ?? selection.listingIds?.[0];
  if (!targetListingId || selection.dates.length === 0) return;

  const update: Partial<CalendarDay> = {};
  if (selection.unblock) {
    update.status = "open";
    update.blockType = undefined;
    update.inventory = 1;
  } else if (selection.blockType) {
    update.status = "blocked";
    update.blockType = selection.blockType;
    update.inventory = 0;
  }

  if (selection.nightlyPrice !== undefined) {
    update.price = selection.nightlyPrice;
  }

  applyOverrideUpdate(targetListingId, selection.dates, update);
};

export const updateMockSingleAvailability = (params: {
  listingId: number;
  date: string;
  price?: number | null;
  inventory?: number | null;
  status?: "open" | "blocked";
  blockType?: string;
}) => {
  const update: Partial<CalendarDay> = {};
  if (params.price !== undefined) {
    update.price = params.price;
  }
  if (params.inventory !== undefined) {
    update.inventory = params.inventory;
  }
  if (params.status) {
    update.status = params.status;
    update.blockType = params.blockType;
  }

  applyOverrideUpdate(params.listingId, [params.date], update);
};

export const refreshMockAvailability = (
  listings: CalendarListing[],
  startDate: string,
  endDate: string
): CalendarListing[] => {
  const dates = buildDateArray(startDate, endDate);

  return listings.map((listing) => ({
    ...listing,
    days: buildListingDays(listing.listingId, dates),
  }));
};
