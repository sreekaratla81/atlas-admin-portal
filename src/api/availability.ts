import { addDays, format, isAfter, parseISO } from "date-fns";
import { api, asArray } from "@/lib/api";

export type CalendarDay = {
  date: string;
  status: "open" | "blocked";
  price?: number | null;
  blockType?: string;
  reason?: string;
};

export type CalendarListing = {
  listingId: number;
  listingName: string;
  days: Record<string, CalendarDay>;
};

export type BulkUpdateSelection = {
  listingId: number;
  dates: string[];
  blockType?: "Maintenance" | "OwnerHold" | "OpsHold";
  unblock?: boolean;
  nightlyPrice?: number | null;
};

type CalendarApiListing = {
  listingId?: number;
  listingName?: string;
  days?: CalendarDay[] | Record<string, CalendarDay>;
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
  dates: selection.dates,
  status: selection.unblock ? "open" : "blocked",
  blockType: selection.unblock ? undefined : selection.blockType ?? "Maintenance",
});

export const buildBulkPricePayload = (selection: BulkUpdateSelection) => ({
  listingId: selection.listingId,
  dates: selection.dates,
  price: selection.nightlyPrice,
});

const normalizeDays = (
  days: CalendarApiListing["days"]
): Record<string, CalendarDay> => {
  if (!days) return {};
  if (!Array.isArray(days)) return days;

  return days.reduce<Record<string, CalendarDay>>((acc, day) => {
    if (day?.date) {
      acc[day.date] = day;
    }
    return acc;
  }, {});
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
    }));
};
