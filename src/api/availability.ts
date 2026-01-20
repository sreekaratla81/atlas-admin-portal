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

export type AvailabilityDateResponse = {
  listingId: number;
  date: string;
  availableRooms: number;
};

export type AdminAvailabilityUpdate = {
  listingId: number;
  startDate: string;
  endDate: string;
  availableRooms: number;
  price?: number | null;
};

export const fetchAvailabilityDates = async (
  listingId: number,
  from: string,
  to: string
): Promise<AvailabilityDateResponse[]> => {
  const dateArray = buildDateArray(from, to);
  const results: AvailabilityDateResponse[] = [];
  
  // Fetch availability for each date in the range
  for (const date of dateArray) {
    try {
      const response = await api.get("/availability/listing-availability", {
        params: { 
          listingId, 
          startDate: date 
        },
      });
      
      results.push({
        listingId: response.data.listingId,
        date: response.data.date,
        availableRooms: response.data.inventory ? 1 : 0
      });
    } catch (error) {
      console.error(`Failed to fetch availability for date ${date}:`, error);
    }
  }
  
  return results;
};

export const patchAvailabilityAdmin = async (payload: AdminAvailabilityUpdate) => {
  const dates = buildDateArray(payload.startDate, payload.endDate);
  const inventory = payload.availableRooms > 0;
  
  const results = [];
  
  for (const date of dates) {
    try {
      // First update inventory
      const response = await api.patch("/availability/update-inventory", null, {
        params: {
          listingId: payload.listingId,
          date: date,
          inventory: inventory
        }
      });
      
      // If price is provided, update it as well
      if (payload.price !== undefined && payload.price !== null) {
        await api.patch("/availability/update-price", null, {
          params: {
            listingId: payload.listingId,
            date: date,
            price: payload.price
          }
        });
      }
      
      results.push({
        date,
        success: true,
        data: response.data
      });
    } catch (error) {
      console.error(`Failed to update availability for date ${date}:`, error);
      results.push({
        date,
        success: false,
        error: error.message
      });
    }
  }
  
  return {
    success: results.every(r => r.success),
    results
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
    const allListings = asArray<{ id: number; name: string }>(
      listingsResponse.data,
      "listings"
    );
    
    // Filter listings by property if propertyId is provided
    const filteredListings = propertyId 
      ? allListings.filter((l: any) => l.propertyId === Number(propertyId))
      : allListings;
    
    // Fetch availability for each listing
    const results: CalendarListing[] = [];
    
    for (const listing of filteredListings) {
      try {
        const availabilityResponse = await fetchAvailabilityDates(listing.id, from, to);
        
        const daysMap: Record<string, CalendarDay> = {};
        
        availabilityResponse.forEach(avail => {
          daysMap[avail.date] = {
            date: avail.date,
            status: avail.availableRooms > 0 ? 'open' : 'blocked',
            inventory: avail.availableRooms,
            blockType: 'INVENTORY'
          };
        });
        
        results.push({
          listingId: listing.id,
          listingName: listing.name,
          days: daysMap,
          ratePlans: []
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
}
