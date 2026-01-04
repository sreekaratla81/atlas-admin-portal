import { addDays, format, isAfter, parseISO } from "date-fns";
import { api, asArray } from "@/lib/api";

export type CalendarDay = {
  date: string;
  status: "open" | "blocked";
  price?: number | null;
  inventory?: number | null;
  blockType?: string;
  reason?: string;
};

export type CalendarListing = {
  listingId: number;
  listingName: string;
  days: Record<string, CalendarDay>;
  ratePlans: CalendarRatePlan[];
};

export type CalendarRatePlan = {
  ratePlanId: number;
  name: string;
  days: Record<string, CalendarDay>;
};

export type BulkUpdateSelection = {
  listingId: number;
  ratePlanId?: number;
  dates: string[];
  blockType?: "Maintenance" | "OwnerHold" | "OpsHold";
  unblock?: boolean;
  nightlyPrice?: number | null;
};

type CalendarApiDay = Omit<CalendarDay, "price" | "inventory"> & {
  price?: number | string | null;
  inventory?: number | string | null;
};

type CalendarApiListing = {
  listingId?: number;
  listingName?: string;
  days?: CalendarApiDay[] | Record<string, CalendarApiDay>;
  ratePlans?: CalendarApiRatePlan[];
};

type CalendarApiRatePlan = {
  ratePlanId?: number;
  name?: string;
  daily?: CalendarApiDay[] | Record<string, CalendarApiDay>;
  days?: CalendarApiDay[] | Record<string, CalendarApiDay>;
};

const parseNullableNumber = (value: unknown) => {
  if (value == null) return null;

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const buildDateArray = (from: string, to: string): string[] => {
  const start = parseISO(from);
  const end = parseISO(to);
  const dates: string[] = [];

  for (let current = start; !isAfter(current, end); current = addDays(current, 1)) {
    dates.push(format(current, "yyyy-MM-dd"));
  }

  return dates;
};

export const formatCurrencyINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const buildBulkBlockPayload = (selection: BulkUpdateSelection) => ({
  listingId: selection.listingId,
  ratePlanId: selection.ratePlanId,
  dates: selection.dates,
  status: selection.unblock ? "open" : "blocked",
  blockType: selection.unblock ? undefined : selection.blockType ?? "Maintenance",
});

export const buildBulkPricePayload = (selection: BulkUpdateSelection) => ({
  listingId: selection.listingId,
  ratePlanId: selection.ratePlanId,
  dates: selection.dates,
  price: selection.nightlyPrice,
});

export const updateInventoryForDate = (params: {
  listingId: number;
  ratePlanId?: number;
  date: string;
  inventory: number | null;
}) => api.post("/availability/inventory", params);

export const patchAvailabilityCell = (params: {
  listingId: number;
  ratePlanId: number;
  date: string;
  price?: number | null;
  inventory?: number | null;
}) => api.patch("/admin/calendar/availability/cell", params);

const normalizeDay = (day: CalendarApiDay): CalendarDay => ({
  date: day.date,
  status: day.status ?? "open",
  price: parseNullableNumber(day.price),
  inventory: parseNullableNumber(day.inventory),
  blockType: day.blockType,
  reason: day.reason,
});

const normalizeDays = (
  days: CalendarApiListing["days"]
): Record<string, CalendarDay> => {
  if (!days) return {};

  if (Array.isArray(days)) {
    return days.reduce<Record<string, CalendarDay>>((acc, day) => {
      if (day?.date) {
        acc[day.date] = normalizeDay(day);
      }
      return acc;
    }, {});
  }

  return Object.entries(days).reduce<Record<string, CalendarDay>>((acc, [key, day]) => {
    if (day?.date ?? key) {
      acc[day.date ?? key] = normalizeDay({ ...day, date: day.date ?? key });
    }
    return acc;
  }, {});
};

const normalizeRatePlans = (
  ratePlans: CalendarApiRatePlan[] | undefined
): CalendarRatePlan[] => {
  if (!ratePlans) return [];

  return ratePlans
    .filter((plan) => plan.ratePlanId && plan.name)
    .map((plan) => ({
      ratePlanId: plan.ratePlanId as number,
      name: plan.name as string,
      days: normalizeDays(plan.daily ?? plan.days),
    }));
};

export const fetchCalendarData = async (
  propertyId: string | number | undefined,
  from: string,
  to: string
): Promise<CalendarListing[]> => {
  const response = await api.get("/availability/calendar", {
    params: {
      propertyId: propertyId || undefined,
      from,
      to,
    },
  });

  const listings = asArray<CalendarApiListing>(
    response.data?.listings ?? response.data?.data ?? response.data,
    "availability listings"
  );

  return listings
    .filter((listing) => listing.listingId && listing.listingName)
    .map((listing) => ({
      listingId: listing.listingId as number,
      listingName: listing.listingName as string,
      days: normalizeDays(listing.days),
      ratePlans: normalizeRatePlans(listing.ratePlans),
    }));
};
