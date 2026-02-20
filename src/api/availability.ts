import { addDays, format, isAfter, parseISO, differenceInCalendarMonths } from "date-fns";
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
  ratePlans?: CalendarRatePlan[];
};

export type CalendarRatePlan = {
  ratePlanId: number;
  name: string;
  days: Record<string, CalendarDay>;
};

export type BulkUpdateSelection = {
  listingId?: number;
  listingIds?: number[];
  dates: string[];
  blockType?: "Maintenance" | "OwnerHold" | "OpsHold";
  unblock?: boolean;
  nightlyPrice?: number | null;
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

export const buildBulkBlockPayload = (selection: BulkUpdateSelection) => {
  const listingIds = selection.listingIds ?? (selection.listingId != null ? [selection.listingId] : []);
  const sortedDates = [...selection.dates].sort();

  return {
    listingIds,
    startDate: sortedDates[0],
    endDate: sortedDates[sortedDates.length - 1],
    status: selection.unblock ? "open" : "blocked",
    blockType: selection.unblock ? undefined : selection.blockType ?? "Maintenance",
  };
};

export const buildBulkPricePayload = (selection: BulkUpdateSelection) => {
  const listingIds = selection.listingIds ?? (selection.listingId != null ? [selection.listingId] : []);
  const sortedDates = [...selection.dates].sort();

  return {
    listingIds,
    startDate: sortedDates[0],
    endDate: sortedDates[sortedDates.length - 1],
    price: selection.nightlyPrice,
  };
};

// patchAvailabilityCell and patchAvailabilityBulk functions have been removed as per request

/** Response from GET /pricing/breakdown (CalendarPricingViewDto) */
export type PricingBreakdownListing = {
  listingId: number;
  listingName: string;
  currency: string;
  baseNightlyRate: number;
  weekendNightlyRate?: number | null;
  days: { date: string; baseAmount: number; finalAmount: number; roomsAvailable: number }[];
};

export type PricingBreakdownResponse = {
  startDate: string;
  endDate: string;
  listings: PricingBreakdownListing[];
};

/**
 * GET /pricing/breakdown – default prices for calendar blocks.
 * Uses startDate, listingId, and months (1–12). 30D→1, 60D→2, 90D→3.
 */
export const fetchPricingBreakdown = async (
  listingId: number,
  startDate: string,
  months: number
): Promise<PricingBreakdownResponse | null> => {
  try {
    const response = await api.get<PricingBreakdownResponse>("/pricing/breakdown", {
      params: { listingId, startDate, months },
    });
    return response.data ?? null;
  } catch (err) {
    console.error(`Failed to fetch pricing breakdown for listing ${listingId}:`, err);
    return null;
  }
};

/**
 * PUT /pricing/daily-rate – update nightly rate for a listing on a date.
 * Used when the user clicks Save after editing a price in the calendar.
 */
export const updateDailyRate = async (
  listingId: number,
  date: string,
  nightlyRate: number,
  currency = "INR",
  reason?: string | null
): Promise<void> => {
  await api.put("/pricing/daily-rate", {
    listingId,
    date,
    nightlyRate,
    currency,
    source: "Manual",
    ...(reason != null && reason.trim() !== "" && { reason: reason.trim() }),
  });
};

export type AvailabilityDateResponse = {
  listingId: number;
  date: string;
  availableRooms: number;
};

export type AdminAvailabilityUpdate = {
  listingId: number;
  startDate: string;
  endDate: string;
  /** When set, inventory is updated via PATCH availability. Omit for price-only updates. */
  availableRooms?: number;
  price?: number | null;
  /** Optional reason for price update (sent with PUT /pricing/daily-rate). */
  reason?: string | null;
  // Optional metadata used only on the frontend; ignored by the API
  status?: "open" | "blocked";
  blockType?: "Maintenance" | "OwnerHold" | "OpsHold";
};

export const fetchAvailabilityDates = async (
  listingId: number,
  from: string,
  to: string
): Promise<AvailabilityDateResponse[]> => {
  // New API returns multiple months of availability data in a single call:
  // GET /availability/listing-availability?listingId=2&startDate=2026-02-10&months=2
  //
  // Response shape (example):
  // {
  //   "listingId": 6,
  //   "listingName": "Atlas302",
  //   "availability": [
  //     { "date": "2026-02-12", "status": "Available", "inventory": 1 },
  //     ...
  //   ]
  // }

  // Derive how many calendar months the [from, to] range spans so we can
  // pass an appropriate `months` value to the API.
  const start = parseISO(from);
  const end = parseISO(to);
  const months = Math.max(1, differenceInCalendarMonths(end, start) + 1);

  try {
    const response = await api.get("/availability/listing-availability", {
      params: {
        listingId,
        startDate: from,
        months,
      },
    });

    const data = response.data ?? {};
    const availability = Array.isArray(data.availability)
      ? data.availability
      : [];

    return availability.map((item: { date: string; inventory?: number }) => ({
      listingId: data.listingId ?? listingId,
      date: item.date,
      availableRooms: typeof item.inventory === "number" ? item.inventory : 0,
    }));
  } catch (error) {
    console.error(
      `Failed to fetch availability for listing ${listingId}:`,
      error
    );
    return [];
  }
};

/**
 * PATCH availability (inventory only). Price updates use PUT /pricing/daily-rate instead.
 */
export const patchAvailabilityAdmin = async (payload: AdminAvailabilityUpdate) => {
  if (payload.availableRooms === undefined) {
    return { success: true, results: [] };
  }
  const dates = buildDateArray(payload.startDate, payload.endDate);
  const inventory = payload.availableRooms > 0;

  const results = [];

  for (const date of dates) {
    try {
      const response = await api.patch("/availability/update-inventory", null, {
        params: {
          listingId: payload.listingId,
          date,
          inventory,
        },
      });
      results.push({ date, success: true, data: response.data });
    } catch (error) {
      console.error(`Failed to update availability for date ${date}:`, error);
      results.push({
        date,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    success: results.every((r) => r.success),
    results,
  };
};

export const fetchCalendarData = async (
  propertyId: string | number | undefined,
  from: string,
  to: string
): Promise<CalendarListing[]> => {
  try {
    // First, fetch all listings for the property
    const listingsResponse = await api.get("/listings");
    const allListings = asArray<{ id: number; name: string; propertyId?: number }>(
      listingsResponse.data,
      "listings"
    );
    
    // Filter listings by property if propertyId is provided
    const filteredListings = propertyId 
      ? allListings.filter((l) => l.propertyId === Number(propertyId))
      : allListings;
    
    // Fetch availability for each listing
    const results: CalendarListing[] = [];
    
    const start = parseISO(from);
    const end = parseISO(to);
    const months = Math.max(1, Math.min(12, differenceInCalendarMonths(end, start) + 1));

    for (const listing of filteredListings) {
      try {
        const [availabilityResponse, breakdown] = await Promise.all([
          fetchAvailabilityDates(listing.id, from, to),
          fetchPricingBreakdown(listing.id, from, months),
        ]);

        const daysMap: Record<string, CalendarDay> = {};

        availabilityResponse.forEach((avail) => {
          daysMap[avail.date] = {
            date: avail.date,
            status: avail.availableRooms > 0 ? "open" : "blocked",
            inventory: avail.availableRooms,
            blockType: "INVENTORY",
          };
        });

        const listingBreakdown = breakdown?.listings?.find(
          (l) => l.listingId === listing.id
        );
        if (listingBreakdown?.days) {
          listingBreakdown.days.forEach((day) => {
            const existing = daysMap[day.date];
            const price = Number(day.finalAmount);
            if (existing) {
              existing.price = Number.isNaN(price) ? undefined : price;
            } else {
              daysMap[day.date] = {
                date: day.date,
                status: "open",
                inventory: day.roomsAvailable ?? 0,
                price: Number.isNaN(price) ? undefined : price,
              };
            }
          });
        }

        results.push({
          listingId: listing.id,
          listingName: listing.name,
          days: daysMap,
          ratePlans: [],
        });
      } catch (error) {
        console.error(`Failed to fetch availability for listing ${listing.id}:`, error);
      }
    }
    
    return results;
  } catch (error) {
    console.error("Failed to fetch calendar data:", error);
    throw error;
  }
};
