import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { addDays, format, isAfter, parseISO } from "date-fns";
import { CalendarDay } from "@/api/availability";

const _DEFAULT_PRICE = 3200;
const DEFAULT_INVENTORY = 4;

const baseListings = [
  {
    listingId: 101,
    listingName: "Atlas Homes 1BHK City View",
    ratePlans: [
      { ratePlanId: 1, name: "Standard", basePrice: 3200 },
      { ratePlanId: 2, name: "Non-refundable", basePrice: 2900 },
    ],
  },
  {
    listingId: 102,
    listingName: "Atlas Homes Studio Garden",
    ratePlans: [
      { ratePlanId: 3, name: "Standard", basePrice: 2600 },
    ],
  },
];

const state: Record<number, Record<number, Record<string, CalendarDay>>> = {};

const ensureDay = (listingId: number, ratePlanId: number, date: string, basePrice: number): CalendarDay => {
  const listingState = (state[listingId] = state[listingId] || {});
  const ratePlanState = (listingState[ratePlanId] = listingState[ratePlanId] || {});

  if (!ratePlanState[date]) {
    ratePlanState[date] = {
      date,
      status: "open",
      price: basePrice,
      inventory: DEFAULT_INVENTORY,
    };
  }

  return ratePlanState[date];
};

const buildRange = (start: string, end: string) => {
  const dates: string[] = [];
  for (let current = parseISO(start); !isAfter(current, parseISO(end)); current = addDays(current, 1)) {
    dates.push(format(current, "yyyy-MM-dd"));
  }
  return dates;
};

const _parseData = <T>(config: AxiosRequestConfig): T => {
  if (!config.data) return {} as T;
  try {
    return typeof config.data === "string" ? (JSON.parse(config.data) as T) : (config.data as T);
  } catch (_err) {
    return {} as T;
  }
};

const buildResponse = (config: AxiosRequestConfig, data: unknown, status = 200): AxiosResponse => ({
  data,
  status,
  statusText: "OK",
  headers: {},
  config,
});

const handleAvailabilityGet = (config: AxiosRequestConfig, url: URL): AxiosResponse => {
  const startDate = url.searchParams.get("startDate") ?? format(new Date(), "yyyy-MM-dd");
  const endDate = url.searchParams.get("endDate") ?? startDate;
  const dates = buildRange(startDate, endDate);

  const listings = baseListings.map((listing) => {
    const days: Record<string, CalendarDay> = {};

    const ratePlans = listing.ratePlans.map((plan) => {
      const daily = dates.map((date) => ensureDay(listing.listingId, plan.ratePlanId, date, plan.basePrice));
      daily.forEach((day) => {
        days[day.date] = days[day.date] ?? { ...day };
      });

      return {
        ratePlanId: plan.ratePlanId,
        name: plan.name,
        daily,
      };
    });

    return {
      listingId: listing.listingId,
      listingName: listing.listingName,
      days: Object.values(days),
      ratePlans,
    };
  });

  return buildResponse(config, {
    propertyId: url.searchParams.get("propertyId") ?? "demo_property",
    startDate,
    endDate,
    listings,
  });
};

const handlePropertiesGet = (config: AxiosRequestConfig): AxiosResponse =>
  buildResponse(config, [
    { id: 1, name: "Atlas Demo Property" },
    { id: 2, name: "Atlas City Center" },
  ]);

// Removed handleCellPatch and handleBulkPatch handlers as per request

export const setupAvailabilityMocks = (api: AxiosInstance) => {
  const enabled = import.meta.env.VITE_USE_MOCK_AVAILABILITY !== "false" && import.meta.env.DEV;
  if (!enabled) return undefined;

  const interceptorId = api.interceptors.request.use((config) => {
    const url = config.url ? new URL(config.url, api.defaults.baseURL || window.location.origin) : null;
    if (!url) return config;

    const method = (config.method ?? "get").toLowerCase();

    if (url.pathname === "/admin/calendar/availability" && method === "get") {
      config.adapter = async () => handleAvailabilityGet(config, url);
    } else if (url.pathname === "/properties" && method === "get") {
      config.adapter = async () => handlePropertiesGet(config);
    }

    return config;
  });

  return () => {
    api.interceptors.request.eject(interceptorId);
  };
};
