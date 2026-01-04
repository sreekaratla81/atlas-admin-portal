import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { addDays, format, isAfter, parseISO } from "date-fns";
import { CalendarDay } from "@/api/availability";

const DEFAULT_PRICE = 3200;
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

const parseData = <T>(config: AxiosRequestConfig): T => {
  if (!config.data) return {} as T;
  try {
    return typeof config.data === "string" ? (JSON.parse(config.data) as T) : (config.data as T);
  } catch (err) {
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

const handleCellPatch = (config: AxiosRequestConfig): AxiosResponse => {
  type Payload = { listingId: number; ratePlanId: number; date: string; price?: number | null; inventory?: number | null };
  const body = parseData<Payload>(config);
  const { listingId, ratePlanId, date } = body;
  const basePrice =
    baseListings.find((listing) => listing.listingId === listingId)?.ratePlans.find((plan) => plan.ratePlanId === ratePlanId)?.basePrice ??
    DEFAULT_PRICE;

  const day = ensureDay(listingId, ratePlanId, date, basePrice);
  if (body.price !== undefined) {
    day.price = body.price;
  }
  if (body.inventory !== undefined) {
    day.inventory = body.inventory;
  }

  return buildResponse(config, { success: true, day });
};

const handleBulkPatch = (config: AxiosRequestConfig): AxiosResponse => {
  type Payload = {
    listingIds?: number[];
    ratePlanIds?: number[];
    startDate: string;
    endDate: string;
    price?: number | null;
    inventory?: number | null;
    status?: "open" | "blocked";
    blockType?: string;
  };

  const body = parseData<Payload>(config);
  const listingIds = body.listingIds && body.listingIds.length > 0 ? body.listingIds : baseListings.map((l) => l.listingId);
  const ratePlanIds = body.ratePlanIds && body.ratePlanIds.length > 0 ? body.ratePlanIds : baseListings.flatMap((l) => l.ratePlans.map((p) => p.ratePlanId));
  const startDate = body.startDate ?? format(new Date(), "yyyy-MM-dd");
  const endDate = body.endDate ?? startDate;
  const dates = buildRange(startDate, endDate);

  listingIds.forEach((listingId) => {
    const listing = baseListings.find((item) => item.listingId === listingId);
    ratePlanIds.forEach((ratePlanId) => {
      const plan = listing?.ratePlans.find((item) => item.ratePlanId === ratePlanId);
      const basePrice = plan?.basePrice ?? DEFAULT_PRICE;

      dates.forEach((date) => {
        const day = ensureDay(listingId, ratePlanId, date, basePrice);
        if (body.status) {
          day.status = body.status;
          if (body.status === "blocked" && body.blockType) {
            day.blockType = body.blockType;
          }
          if (body.status === "open") {
            delete day.blockType;
            delete day.reason;
          }
        }
        if (body.price !== undefined) {
          day.price = body.price;
        }
        if (body.inventory !== undefined) {
          day.inventory = body.inventory;
        }
      });
    });
  });

  return buildResponse(config, { success: true });
};

export const setupAvailabilityMocks = (api: AxiosInstance) => {
  const enabled = import.meta.env.VITE_USE_MOCK_AVAILABILITY !== "false" && import.meta.env.DEV;
  if (!enabled) return;

  const defaultAdapter = api.defaults.adapter ?? axios.defaults.adapter;
  if (!defaultAdapter) return;

  api.defaults.adapter = async (config) => {
    const url = config.url ? new URL(config.url, api.defaults.baseURL || window.location.origin) : null;

    if (!url) return defaultAdapter(config);

    if (url.pathname === "/admin/calendar/availability" && config.method === "get") {
      return handleAvailabilityGet(config, url);
    }

    if (url.pathname === "/properties" && config.method === "get") {
      return handlePropertiesGet(config);
    }

    if (url.pathname === "/admin/calendar/availability/cell" && config.method === "patch") {
      return handleCellPatch(config);
    }

    if (url.pathname === "/admin/calendar/availability/bulk" && config.method === "patch") {
      return handleBulkPatch(config);
    }

    return defaultAdapter(config);
  };
};
