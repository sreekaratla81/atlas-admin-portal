import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addDays, format, getDay, isSameDay, parseISO } from "date-fns";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import { api, asArray } from "@/lib/api";
import {
  buildDateArray,
  BulkUpdateSelection,
  CalendarDay,
  CalendarListing,
  fetchCalendarData,
  patchAvailabilityAdmin,
  updateDailyRate,
  AdminAvailabilityUpdate,
} from "@/api/availability";
import useCalendarSelection from "@/hooks/useCalendarSelection";

type Property = {
  id: number;
  name: string;
};

const RANGE_OPTIONS = [30, 60, 90] as const;
const CELL_WIDTH = 110;
const NAME_COL_WIDTH = 280;
const TODAY_OUTLINE = "#0284c7";
const OPEN_COLOR = "#f0fdf4";
const OPEN_WEEKEND_COLOR = "#ecfccb";
const BLOCKED_COLOR = "#fef2f2";
const BLOCKED_WEEKEND_COLOR = "#fee2e2";
const EMPTY_COLOR = "#f3f4f6";
const EMPTY_WEEKEND_COLOR = "#e5e7eb";
const BLOCK_TYPE_OPTIONS: BulkUpdateSelection["blockType"][] = [
  "Maintenance",
  "OwnerHold",
  "OpsHold",
];
const PRICE_INPUT_HELPER = "Leave blank to keep existing rates.";

type HeaderCellProps = {
  date: string;
  today: Date;
};

const HeaderCell = React.memo(({ date, today }: HeaderCellProps) => {
  const dateObj = parseISO(date);
  const isWeekend = getDay(dateObj) === 0 || getDay(dateObj) === 6;
  const isToday = isSameDay(dateObj, today);

  return (
    <Box
      sx={{
        width: CELL_WIDTH,
        height: 64,
        borderRight: "1px solid",
        borderColor: "divider",
        borderBottom: "1px solid",
        borderBottomColor: "divider",
        backgroundColor: isWeekend ? "rgba(148, 163, 184, 0.15)" : "background.paper",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
        {format(dateObj, "EEE")}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {format(dateObj, "d")}
      </Typography>
      {isToday && (
        <Box
          sx={{
            position: "absolute",
            inset: 4,
            border: `2px solid ${TODAY_OUTLINE}`,
            borderRadius: 1,
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
});

HeaderCell.displayName = "HeaderCell";

type DataCellProps = {
  listingId: number;
  date: string;
  availability?: CalendarDay;
  today: Date;
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
  onCellChange: (
    listingId: number,
    date: string,
    update: { price?: number | null; inventory?: number | null }
  ) => void;
};

const DataCell = React.memo(
  ({
    listingId,
    date,
    availability,
    today,
    isSelected,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
    onCellChange,
  }: DataCellProps) => {
  const [editingField, setEditingField] = useState<"price" | "inventory" | null>(null);
  const [priceDraft, setPriceDraft] = useState<string>(
    availability?.price != null ? String(availability.price) : ""
  );
  const [inventoryDraft, setInventoryDraft] = useState<string>(
    availability?.inventory != null ? String(availability.inventory) : ""
  );

  useEffect(() => {
    if (editingField !== "price") {
      setPriceDraft(availability?.price != null ? String(availability.price) : "");
    }
  }, [availability?.price, editingField]);

  useEffect(() => {
    if (editingField !== "inventory") {
      setInventoryDraft(availability?.inventory != null ? String(availability.inventory) : "");
    }
  }, [availability?.inventory, editingField]);

  const dateObj = parseISO(date);
  const isWeekend = getDay(dateObj) === 0 || getDay(dateObj) === 6;
  const isToday = isSameDay(dateObj, today);
  const status = availability?.status ?? "open";
  const isMissingData =
    !availability || availability.price == null || availability.inventory == null;

  const backgroundColor = isMissingData
    ? isWeekend
      ? EMPTY_WEEKEND_COLOR
      : EMPTY_COLOR
    : status === "blocked"
      ? isWeekend
        ? BLOCKED_WEEKEND_COLOR
        : BLOCKED_COLOR
      : isWeekend
        ? OPEN_WEEKEND_COLOR
        : OPEN_COLOR;

  const badgeColors = status === "blocked"
    ? { background: "#fecdd3", color: "#7f1d1d" }
    : isMissingData
      ? { background: "#e5e7eb", color: "#374151" }
      : { background: "#d9f99d", color: "#365314" };

  const tooltipText = isMissingData
    ? "Price or inventory missing"
    : `${availability?.inventory ?? 0} of ${availability?.inventory ?? 0} rooms ${
        status === "blocked" ? "blocked" : "open"
      }`;

  const commitChange = (field: "price" | "inventory") => {
    const draft = field === "price" ? priceDraft : inventoryDraft;
    const trimmed = draft.trim();
    const value = trimmed === "" ? null : Number(trimmed);
    const currentValue =
      field === "price" ? availability?.price ?? null : availability?.inventory ?? null;
      
    if (Number.isNaN(value)) {
      if (field === "price") {
        setPriceDraft(availability?.price != null ? String(availability.price) : "");
      } else {
        setInventoryDraft(availability?.inventory != null ? String(availability.inventory) : "");
      }
      setEditingField(null);
      return;
    }

    if (value !== currentValue) {
      onCellChange(listingId, date, field === "price" ? { price: value } : { inventory: value });
    }

    setEditingField(null);
  };

  const focusNextInput = (current: HTMLInputElement, backwards = false) => {
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[data-calendar-input="true"]')
    );
    const currentIndex = inputs.findIndex((input) => input === current);

    if (currentIndex === -1) {
      return;
    }

    const nextIndex = backwards ? currentIndex - 1 : currentIndex + 1;
    const nextInput = inputs[nextIndex];

    if (nextInput) {
      nextInput.focus();
      nextInput.select?.();
    }
  };

  return (
    <Tooltip key={`${listingId}-${date}`} title={tooltipText} arrow>
      <Box
        sx={{
          width: CELL_WIDTH,
          height: 56,
          borderRight: "1px solid",
          borderColor: "divider",
          borderBottom: "1px solid",
          borderBottomColor: "divider",
          backgroundColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          position: "relative",
          color: "text.primary",
          cursor: "pointer",
          userSelect: "none",
          boxShadow: isSelected ? "inset 0 0 0 2px #2563eb" : "none",
          transition: "box-shadow 120ms ease",
        }}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseUp={onMouseUp}
        >
        <Stack spacing={0.5} alignItems="center" sx={{ width: "100%", px: 0.5 }}>
          <TextField
            size="small"
            type="number"
            value={priceDraft}
            onFocus={() => setEditingField("price")}
            onChange={(event) => setPriceDraft(event.target.value)}
            onBlur={() => commitChange("price")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitChange("price");
                focusNextInput(event.currentTarget as HTMLInputElement, event.shiftKey);
              }
              if (event.key === "Escape") {
                setPriceDraft(availability?.price != null ? String(availability.price) : "");
                setEditingField(null);
              }
              if (event.key === "Tab") {
                commitChange("price");
              }
            }}
            placeholder="Price"
            inputProps={{
              min: 0,
              style: { padding: "4px 8px", textAlign: "center" },
              "data-calendar-input": "true",
            }}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255,255,255,0.65)",
                borderRadius: 1,
                fontWeight: 700,
                fontSize: "0.95rem",
                height: 26,
                py: 0.25,
              },
              "& .MuiOutlinedInput-input": {
                textAlign: "center",
              },
            }}
            onMouseDown={(event) => event.stopPropagation()}
            onMouseUp={(event) => event.stopPropagation()}
          />
          <TextField
  size="small"
  type="number"
  value={inventoryDraft}
  onFocus={() => setEditingField("inventory")}
  onChange={(event) => {
    const v = event.target.value;
    if (v === "0" || v === "1") {
      setInventoryDraft(v);
    }
  }}
  onBlur={() => commitChange("inventory")}
  onWheel={(e) => e.currentTarget.blur()}
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitChange("inventory");
      focusNextInput(event.currentTarget as HTMLInputElement, event.shiftKey);
    }
    if (event.key === "Escape") {
      setInventoryDraft(
        availability?.inventory != null ? String(availability.inventory) : ""
      );
      setEditingField(null);
    }
    if (event.key === "Tab") {
      commitChange("inventory");
    }
  }}
  placeholder="Rooms"
  inputProps={{
    min: 0,
    max: 1,
    step: 1,
    style: { padding: "4px 8px", textAlign: "center" },
    "data-calendar-input": "true",
  }}
  sx={{
    width: "100%",
    "& .MuiOutlinedInput-root": {
      backgroundColor: badgeColors.background,
      color: badgeColors.color,
      borderRadius: 9999,
      fontWeight: 700,
      fontSize: "0.8rem",
      height: 26,
      py: 0.25,
      "& fieldset": {
        borderColor: "transparent",
      },
    },
    "& .MuiOutlinedInput-input": {
      textAlign: "center",
      paddingRight: 0,
      paddingLeft: 0,
    },
  }}
  onMouseDown={(event) => event.stopPropagation()}
  onMouseUp={(event) => event.stopPropagation()}
  InputProps={{
    endAdornment: (
      <Typography component="span" variant="caption" sx={{ fontWeight: 600 }}>
        rooms
      </Typography>
    ),
  }}
/>

        </Stack>
        {isToday && (
          <Box
            sx={{
              position: "absolute",
              inset: 4,
              border: `2px solid ${TODAY_OUTLINE}`,
              borderRadius: 1,
              pointerEvents: "none",
            }}
          />
        )}
      </Box>
    </Tooltip>
  );
});

DataCell.displayName = "DataCell";

type ListingRowProps = {
  listing: CalendarListing;
  dates: string[];
  today: Date;
  onCellMouseDown: (listingId: number, date: string, shiftKey: boolean) => void;
  onCellMouseEnter: (listingId: number, date: string) => void;
  onCellMouseUp: () => void;
  isDateSelected: (listingId: number, date: string) => boolean;
  isRowSelected: boolean;
  onCellChange: (
    listingId: number,
    date: string,
    update: { price?: number | null; inventory?: number | null }
  ) => void;
};

const ListingRow = React.memo(
  ({
    listing,
    dates,
    today,
    onCellMouseDown,
    onCellMouseEnter,
    onCellMouseUp,
    isDateSelected,
    isRowSelected,
    onCellChange,
  }: ListingRowProps) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `${NAME_COL_WIDTH}px repeat(${dates.length}, ${CELL_WIDTH}px)`,
      }}
    >
      <Box
        sx={{
          position: "sticky",
          left: 0,
          zIndex: 2,
          borderRight: "1px solid",
          borderColor: "divider",
          borderBottom: "1px solid",
          borderBottomColor: "divider",
          backgroundColor: isRowSelected ? "action.hover" : "background.paper",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: 2,
          height: 56,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {listing.listingName}
        </Typography>
      </Box>
      {dates.map((date) => (
        <DataCell
          key={`${listing.listingId}-${date}`}
          listingId={listing.listingId}
          date={date}
          availability={listing.days[date]}
          today={today}
          isSelected={isDateSelected(listing.listingId, date)}
          onMouseDown={(event) => onCellMouseDown(listing.listingId, date, event.shiftKey)}
          onMouseEnter={() => onCellMouseEnter(listing.listingId, date)}
          onMouseUp={onCellMouseUp}
          onCellChange={onCellChange}
        />
      ))}
    </Box>
  )
);

ListingRow.displayName = "ListingRow";

export default function AvailabilityCalendar() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [listings, setListings] = useState<CalendarListing[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [rangeDays, setRangeDays] = useState<typeof RANGE_OPTIONS[number]>(30);
  const [fromDate, setFromDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<
    "none" | "block" | "unblock" | "close-channels"
  >("none");
  const [blockType, setBlockType] = useState<BulkUpdateSelection["blockType"]>("Maintenance");
  const [priceMode, setPriceMode] = useState<"none" | "fixed" | "delta-amount" | "delta-percent">(
    "none"
  );
  const [priceDirection, setPriceDirection] = useState<"increase" | "decrease">("increase");
  const [priceInput, setPriceInput] = useState("");
  const [inventoryInput, setInventoryInput] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [onlyOpenDates, setOnlyOpenDates] = useState(false);
  const [skipMissingPrices, setSkipMissingPrices] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cellPriceReasonDialog, setCellPriceReasonDialog] = useState<{
    listingId: number;
    date: string;
    price: number;
  } | null>(null);
  const [cellPriceReason, setCellPriceReason] = useState("");

  const [adminPricingOpen, setAdminPricingOpen] = useState(false);
  const [adminPricingSubmitting, setAdminPricingSubmitting] = useState(false);
  const [adminPricingForm, setAdminPricingForm] = useState({
    listingId: "",
    baseNightlyRate: "",
    weekendNightlyRate: "",
    extraGuestRate: "",
    currency: "INR",
  });

  const toDate = useMemo(() => {
    const start = parseISO(fromDate);
    return format(addDays(start, rangeDays - 1), "yyyy-MM-dd");
  }, [fromDate, rangeDays]);

  const dayRange = useMemo(() => buildDateArray(fromDate, toDate), [fromDate, toDate]);
  const {
    selection,
    clearSelection,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    isDateSelected,
    getSelectedDatesForListing,
  } = useCalendarSelection(dayRange);

  // Local queue of pending admin updates that will be sent only when user clicks "Save"
  const [pendingAdminUpdates, setPendingAdminUpdates] = useState<AdminAvailabilityUpdate[]>([]);

  // Prevent duplicate fetches for the same parameters (e.g. React StrictMode)
  const lastFetchKeyRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const propertiesResponse = await api.get("/properties");
      setProperties(asArray<Property>(propertiesResponse.data, "properties"));

      const calendarListings = await fetchCalendarData(
        selectedProperty || undefined,
        fromDate,
        toDate
      );
      setListings(calendarListings);
    } catch {
      setError("We couldn't load availability data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, selectedProperty, toDate]);

  const fetchAndMergeListings = useCallback(async (listingIds?: number[]) => {
    try {
      const resp = await api.get("/listings");
      const all = asArray<{ id?: number; name?: string }>(resp.data, "listings");
      const lookup = new Map<number, string>();
      all.forEach((l) => {
        if (l.id != null && l.name) lookup.set(l.id, l.name);
      });

      setListings((current) =>
        current.map((listing) => {
          if (listingIds && listingIds.length > 0 && !listingIds.includes(listing.listingId)) return listing;
          const name = lookup.get(listing.listingId);
          return name ? { ...listing, listingName: name } : listing;
        })
      );
    } catch {
      // ignore merge errors
    }
  }, []);

  useEffect(() => {
    const key = `${selectedProperty || "all"}|${fromDate}|${toDate}`;
    if (lastFetchKeyRef.current === key) {
      // Same params as last time; avoid duplicate API call
      return;
    }
    lastFetchKeyRef.current = key;
    fetchData();
  }, [fetchData, fromDate, selectedProperty, toDate]);
  useEffect(() => {
    clearSelection();
  }, [clearSelection, fromDate, rangeDays, selectedProperty]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) =>
      listing.listingName.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [listings, search]);

  const today = useMemo(() => new Date(), []);
  const selectedEntries = useMemo(
    () =>
      Object.entries(selection)
        .map(([listingId]) => {
          const id = Number(listingId);
          const listing = listings.find((item) => item.listingId === id);
          const dates = getSelectedDatesForListing(id);

          if (!listing || dates.length === 0) {
            return null;
          }

          return { listingId: id, listing, dates };
        })
        .filter(Boolean) as { listingId: number; listing: CalendarListing; dates: string[] }[],
    [getSelectedDatesForListing, listings, selection]
  );

  const totalSelectedDates = useMemo(
    () => selectedEntries.reduce((sum, entry) => sum + entry.dates.length, 0),
    [selectedEntries]
  );

  const selectionSummary = useMemo(() => {
    if (totalSelectedDates === 0) {
      return "No dates selected";
    }

    const listingCount = selectedEntries.length;
    return `${totalSelectedDates} date${totalSelectedDates === 1 ? "" : "s"} across ${listingCount} listing${listingCount === 1 ? "" : "s"}`;
  }, [selectedEntries.length, totalSelectedDates]);

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const hasSelection = totalSelectedDates > 0;
  const parsedPriceInput = priceInput.trim() === "" ? null : Number(priceInput);
  const normalizedPriceInput = Number.isNaN(parsedPriceInput) ? null : parsedPriceInput;
  const parsedInventoryInput = inventoryInput.trim() === "" ? null : Number(inventoryInput);
  const normalizedInventoryInput = Number.isNaN(parsedInventoryInput) ? null : parsedInventoryInput;

  const targetSelections = useMemo(
    () =>
      selectedEntries.map((entry) => {
        const filteredDates = entry.dates.filter((date) => {
          const day = entry.listing.days[date];

          if (onlyOpenDates && day?.status === "blocked") {
            return false;
          }

          if (
            skipMissingPrices &&
            priceMode !== "none" &&
            priceMode !== "fixed" &&
            (day?.price == null)
          ) {
            return false;
          }

          return true;
        });

        return { ...entry, filteredDates };
      }),
    [onlyOpenDates, priceMode, selectedEntries, skipMissingPrices]
  );

  const filteredOutCount = useMemo(
    () =>
      targetSelections.reduce(
        (sum, entry) => sum + Math.max(0, entry.dates.length - entry.filteredDates.length),
        0
      ),
    [targetSelections]
  );

  const priceIsDelta = priceMode === "delta-amount" || priceMode === "delta-percent";
  const hasPriceAction = priceMode !== "none" && normalizedPriceInput != null;
  const hasInventoryAction = normalizedInventoryInput != null || statusAction === "close-channels";
  const hasStatusAction = statusAction !== "none";
  const canSave =
    hasSelection &&
    (hasPriceAction || hasInventoryAction || hasStatusAction) &&
    targetSelections.some((entry) => entry.filteredDates.length > 0);

  useEffect(() => {
    if (hasSelection) {
      setDrawerOpen(true);
    } else {
      setDrawerOpen(false);
    }
  }, [hasSelection]);

  useEffect(() => {
    if (!hasSelection) {
      setPriceMode("none");
      setPriceInput("");
      setInventoryInput("");
      setStatusAction("none");
      setOnlyOpenDates(false);
      setSkipMissingPrices(true);
    }
  }, [hasSelection]);

  const applyOptimisticUpdate = useCallback(
    (
      currentListings: CalendarListing[],
      updates: {
        listingId: number;
        dates: string[];
        update: {
          status?: "open" | "blocked";
          blockType?: BulkUpdateSelection["blockType"];
          price?: number;
          inventory?: number | null;
        };
      }[]
    ) => {
      if (updates.length === 0) {
        return currentListings;
      }

      return updates.reduce((nextListings, { listingId, dates, update }) => {
        if (dates.length === 0) {
          return nextListings;
        }

        return nextListings.map((listing) => {
          if (listing.listingId !== listingId) {
            return listing;
          }

          return {
            ...listing,
            days: dates.reduce<Record<string, CalendarDay>>((acc, date) => {
              const existing = listing.days[date] ?? { date, status: "open" as const };
              const next = { ...existing };

              if (update.status) {
                next.status = update.status;
                if (update.status === "blocked") {
                  next.blockType = update.blockType ?? existing.blockType ?? "Maintenance";
                } else {
                  delete next.blockType;
                  delete next.reason;
                }
              }

              if (update.price != null) {
                next.price = update.price;
              }

              if (update.inventory !== undefined) {
                next.inventory = update.inventory;
              }

              acc[date] = next;
              return acc;
            }, { ...listing.days }),
          };
        });
      }, currentListings);
    },
    []
  );

  const applyCellUpdateForDate = useCallback(
    (
      currentListings: CalendarListing[],
      listingId: number,
      date: string,
      update: {
        price?: number | null;
        inventory?: number | null;
        status?: "open" | "blocked";
        blockType?: BulkUpdateSelection["blockType"];
      }
    ) => {
      return currentListings.map((listing) => {
        if (listing.listingId !== listingId) {
          return listing;
        }

        const nextListingDay = {
          ...(listing.days[date] ?? { date, status: "open" as const }),
          ...update,
        };

        if (update.status === "open") {
          delete nextListingDay.blockType;
          delete nextListingDay.reason;
        }

        return {
          ...listing,
          days: {
            ...listing.days,
            [date]: nextListingDay,
          },
        };
      });
    },
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for bulk-apply UI
  const _handleApplyBulk = useCallback(async () => {
    if (!hasSelection) {
      return;
    }

    if (!targetSelections.some((entry) => entry.filteredDates.length > 0)) {
      setErrorNotice("No dates match the current filters.");
      return;
    }

    const statusValue =
      statusAction === "unblock"
        ? "open"
        : statusAction === "block" || statusAction === "close-channels"
          ? "blocked"
          : undefined;
    const blockTypeValue = statusValue === "blocked" ? blockType : undefined;
    const inventoryValue = statusAction === "close-channels" ? 0 : normalizedInventoryInput;
    const priceIsDelta = priceMode === "delta-amount" || priceMode === "delta-percent";

    const getPriceForDay = (day?: CalendarDay) => {
      if (!hasPriceAction) return undefined;

      if (priceMode === "fixed") {
        return normalizedPriceInput ?? undefined;
      }

      if (!day?.price && day?.price !== 0) {
        return undefined;
      }

      const basePrice = day.price ?? 0;
      const changeValue =
        priceMode === "delta-amount"
          ? normalizedPriceInput ?? 0
          : ((normalizedPriceInput ?? 0) / 100) * basePrice;
      const delta = priceDirection === "increase" ? changeValue : -changeValue;
      const next = basePrice + delta;
      return Math.max(0, Number(next.toFixed(2)));
    };

    const canUseBulk =
      !priceIsDelta &&
      !onlyOpenDates &&
      !skipMissingPrices &&
      targetSelections.every((entry) => entry.filteredDates.length === entry.dates.length);

    const snapshot = listings;

    // Optimistic UI updates only; actual API call will happen on Save

    if (canUseBulk) {
      const optimisticUpdates = targetSelections
        .map((entry) => ({
          listingId: entry.listingId,
          dates: entry.filteredDates,
          update: {
            status: statusValue as "open" | "blocked" | undefined,
            blockType: blockTypeValue,
            price: priceMode === "fixed" ? normalizedPriceInput ?? undefined : undefined,
            inventory: inventoryValue ?? undefined,
          },
        }))
        .filter((entry) => entry.dates.length > 0);

      setListings(applyOptimisticUpdate(snapshot, optimisticUpdates));

      const groupedPayloads = optimisticUpdates.reduce<
        Record<string, { listingIds: number[]; startDate: string; endDate: string }>
      >((acc, entry) => {
        const sortedDates = [...entry.dates].sort();
        const startDate = sortedDates[0];
        const endDate = sortedDates[sortedDates.length - 1];
        const key = `${startDate}-${endDate}`;

        if (!acc[key]) {
          acc[key] = { listingIds: [], startDate, endDate };
        }

        acc[key].listingIds.push(entry.listingId);
        return acc;
      }, {});

      // Enqueue admin updates instead of sending immediately (price → PUT pricing/daily-rate on Save)
      const newAdminUpdates: AdminAvailabilityUpdate[] = [];
      const includeInventory =
        hasInventoryAction || statusAction !== "none";
      for (const payload of Object.values(groupedPayloads)) {
        for (const listingId of payload.listingIds) {
          newAdminUpdates.push({
            listingId,
            startDate: payload.startDate,
            endDate: payload.endDate,
            ...(includeInventory && { availableRooms: inventoryValue ?? 0 }),
            ...(priceMode === "fixed" &&
              normalizedPriceInput !== undefined && { price: normalizedPriceInput }),
          });
        }
      }

      setPendingAdminUpdates((prev) => [...prev, ...newAdminUpdates]);
      setSuccessNotice("Changes staged. Click Save to apply.");
      setErrorNotice("");
      clearSelection();
      return;
    }

    const perDateUpdates = targetSelections.flatMap((entry) =>
      entry.filteredDates
        .map((date) => {
          const priceForDay = getPriceForDay(entry.listing.days[date]);
          const updatePayload: {
            listingId: number;
            date: string;
            price?: number | null;
            inventory?: number | null;
            status?: "open" | "blocked";
            blockType?: string;
          } = {
            listingId: entry.listing.listingId,
            date,
          };

          if (priceForDay !== undefined) {
            updatePayload.price = priceForDay;
          }

          if (inventoryValue != null) {
            updatePayload.inventory = inventoryValue;
          }

          if (statusValue) {
            updatePayload.status = statusValue;
            if (statusValue === "blocked") {
              updatePayload.blockType = blockTypeValue;
            }
          }

          return updatePayload;
        })
        .filter((update) => update.price !== undefined || update.inventory !== undefined || update.status)
    );

    if (perDateUpdates.length === 0) {
      setSaving(false);
      setErrorNotice("Nothing to update for the selected dates.");
      return;
    }

    setListings((current) => {
      let next = current;
      perDateUpdates.forEach((update) => {
        next = applyCellUpdateForDate(next, update.listingId, update.date, {
          price: update.price,
          inventory: update.inventory,
          status: update.status,
          blockType: update.blockType as BulkUpdateSelection["blockType"] | undefined,
        });
      });
      return next;
    });

    try {
      // For per-date updates we also stage admin payloads instead of calling API directly
      const statusDerivedAvailableRooms =
        statusAction === "block" || statusAction === "close-channels"
          ? 0
          : statusAction === "unblock"
            ? 1
            : null;
      const desiredAvailableRooms = inventoryValue ?? statusDerivedAvailableRooms;

      // If inventory or status is part of the bulk change, stage admin PATCH per listing for the selected ranges
      if (desiredAvailableRooms !== null && desiredAvailableRooms !== undefined) {
        const ranges = new Map<number, { start: string; end: string }>();
        perDateUpdates.forEach((u) => {
          const existing = ranges.get(u.listingId);
          if (!existing) {
            ranges.set(u.listingId, { start: u.date, end: u.date });
          } else {
            if (u.date < existing.start) existing.start = u.date;
            if (u.date > existing.end) existing.end = u.date;
          }
        });

        const staged: AdminAvailabilityUpdate[] = Array.from(ranges.entries())
          .filter(([listingId]) => listingId > 0)
          .map(([listingId, range]) => ({
            listingId,
            startDate: range.start,
            endDate: range.end,
            availableRooms: desiredAvailableRooms,
          }));

        setPendingAdminUpdates((prev) => [...prev, ...staged]);
      }

      // Stage price updates for Save (PUT pricing/daily-rate)
      const priceStaged: AdminAvailabilityUpdate[] = perDateUpdates
        .filter((u) => u.price !== undefined && u.price !== null)
        .map((u) => ({
          listingId: u.listingId,
          startDate: u.date,
          endDate: u.date,
          price: u.price!,
        }));
      if (priceStaged.length > 0) {
        setPendingAdminUpdates((prev) => [...prev, ...priceStaged]);
      }

      setSuccessNotice("Changes staged. Click Save to apply.");
      setErrorNotice("");
      clearSelection();
    } catch (err) {
      setListings(snapshot);
      const msg = err && typeof err === "object" ? JSON.stringify(err) : String(err);
      setErrorNotice(`Update failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  }, [
    applyCellUpdateForDate,
    applyOptimisticUpdate,
    blockType,
    clearSelection,
    hasPriceAction,
    hasSelection,
    listings,
    normalizedInventoryInput,
    normalizedPriceInput,
    onlyOpenDates,
    priceDirection,
    priceMode,
    skipMissingPrices,
    statusAction,
    targetSelections,
  ]);

  const handleCellChange = useCallback(
    (listingId: number, date: string, update: { price?: number | null; inventory?: number | null }) => {
      // Update UI immediately
      setListings((current) => applyCellUpdateForDate(current, listingId, date, update));

      const isPriceOnly =
        update.price !== undefined &&
        update.price !== null &&
        update.inventory === undefined;

      if (isPriceOnly) {
        setCellPriceReasonDialog({ listingId, date, price: update.price });
        setCellPriceReason("");
        setSuccessNotice("");
        return;
      }

      setPendingAdminUpdates((prev) => [
        ...prev,
        {
          listingId,
          startDate: date,
          endDate: date,
          ...(update.inventory !== undefined && { availableRooms: update.inventory }),
          ...(update.price !== undefined && update.price !== null && { price: update.price }),
        },
      ]);
      setSuccessNotice("Changes staged. Click Save to apply.");
      setErrorNotice("");
    },
    [applyCellUpdateForDate]
  );

  const confirmCellPriceReason = useCallback(
    (reason?: string) => {
      if (!cellPriceReasonDialog) return;
      const { listingId, date, price } = cellPriceReasonDialog;
      setPendingAdminUpdates((prev) => [
        ...prev,
        {
          listingId,
          startDate: date,
          endDate: date,
          price,
          ...(reason != null && reason.trim() !== "" && { reason: reason.trim() }),
        },
      ]);
      setCellPriceReasonDialog(null);
      setCellPriceReason("");
      setSuccessNotice("Changes staged. Click Save to apply.");
      setErrorNotice("");
    },
    [cellPriceReasonDialog]
  );

  const performSave = useCallback(async () => {
    if (pendingAdminUpdates.length === 0) return;

    setSaving(true);
    try {
      const pricePromises: Promise<void>[] = [];
      const inventoryUpdates: AdminAvailabilityUpdate[] = [];

      for (const u of pendingAdminUpdates) {
        if (u.price !== undefined && u.price !== null) {
          const dates = buildDateArray(u.startDate, u.endDate);
          for (const date of dates) {
            pricePromises.push(
              updateDailyRate(u.listingId, date, u.price!, "INR", u.reason)
            );
          }
        }
          if (u.availableRooms !== undefined) {
            inventoryUpdates.push(u);
          }
        }

        await Promise.all([
          ...pricePromises,
          ...inventoryUpdates.map((u) => patchAvailabilityAdmin(u)),
        ]);
        const affectedListingIds = Array.from(
          new Set(pendingAdminUpdates.map((u) => u.listingId))
        );
        await fetchAndMergeListings(affectedListingIds);
        setPendingAdminUpdates([]);
        setSuccessNotice("Availability updated successfully.");
        setErrorNotice("");
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" ? JSON.stringify(err) : String(err);
        setErrorNotice(`Save failed: ${msg}`);
      } finally {
        setSaving(false);
      }
    },
    [fetchAndMergeListings, pendingAdminUpdates]
  );

  const handleSave = useCallback(() => {
    if (pendingAdminUpdates.length === 0) {
      setSuccessNotice("");
      setErrorNotice("No changes to save.");
      return;
    }
    performSave();
  }, [pendingAdminUpdates.length, performSave]);

  const handleAdminPricingOpen = useCallback(() => {
    setAdminPricingForm({
      listingId: "",
      baseNightlyRate: "",
      weekendNightlyRate: "",
      extraGuestRate: "",
      currency: "INR",
    });
    setAdminPricingOpen(true);
  }, []);

  const handleAdminPricingSubmit = useCallback(async () => {
    const listingIdNum = Number(adminPricingForm.listingId);
    if (!Number.isInteger(listingIdNum) || listingIdNum <= 0) {
      setErrorNotice("Listing ID must be a positive integer.");
      return;
    }
    const base = Number(adminPricingForm.baseNightlyRate);
    if (Number.isNaN(base) || base < 0) {
      setErrorNotice("Base nightly rate must be a non-negative number.");
      return;
    }
    setAdminPricingSubmitting(true);
    setErrorNotice("");
    setSuccessNotice("");
    try {
      await api.post("/pricing/send", {
        listingId: listingIdNum,
        baseNightlyRate: base,
        weekendNightlyRate:
          adminPricingForm.weekendNightlyRate === ""
            ? undefined
            : Number(adminPricingForm.weekendNightlyRate),
        extraGuestRate:
          adminPricingForm.extraGuestRate === ""
            ? undefined
            : Number(adminPricingForm.extraGuestRate),
        currency: adminPricingForm.currency || "INR",
      });
      setSuccessNotice("Base pricing saved successfully.");
      setAdminPricingOpen(false);
    } catch (err: unknown) {
      const res = err && typeof err === "object" && "response" in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
      const message = res?.data?.message ?? (err && typeof err === "object" ? JSON.stringify(err) : String(err));
      setErrorNotice(message || "Failed to save base pricing.");
    } finally {
      setAdminPricingSubmitting(false);
    }
  }, [adminPricingForm]);

  return (
    <AdminShellLayout title="Availability Calendar">
      <Stack spacing={2} sx={{ pb: 2 }}>
        {error && (
          <Alert
            severity="error"
            action={(
              <Button color="inherit" size="small" onClick={fetchData}>
                Retry
              </Button>
            )}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            p: 1.5,
            backgroundColor: "background.paper",
          }}
        >
          {loading ? (
            <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="center">
              <Skeleton variant="rectangular" width={200} height={40} />
              <Skeleton variant="rectangular" width={180} height={40} />
              <Skeleton variant="rectangular" width={180} height={40} />
              <Skeleton variant="rectangular" width={220} height={40} />
              <Box sx={{ flex: 1 }} />
              <Skeleton variant="rectangular" width={320} height={40} />
            </Stack>
          ) : (
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", lg: "center" }}
              justifyContent="space-between"
              flexWrap="wrap"
              rowGap={1.5}
            >
              <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" rowGap={1.5}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={selectedProperty}
                    label="Property"
                    onChange={(event) => setSelectedProperty(event.target.value)}
                  >
                    <MenuItem value="">All properties</MenuItem>
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={String(property.id)}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={rangeDays}
                  onChange={(_, value) => value && setRangeDays(value)}
                  aria-label="date range"
                >
                  {RANGE_OPTIONS.map((option) => (
                    <ToggleButton key={option} value={option} aria-label={`${option} days`}>
                      {option}d
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>

                <TextField
                  size="small"
                  type="date"
                  label="From"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  size="small"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search listings"
                  label="Listing"
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAdminPricingOpen}
                >
                  Admin
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="flex-end"
                flexWrap="wrap"
                rowGap={1}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {hasSelection ? selectionSummary : "No dates selected"}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!hasSelection}
                  onClick={() => setDrawerOpen(true)}
                >
                  Bulk actions
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  disabled={pendingAdminUpdates.length === 0 || saving}
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button size="small" variant="contained" onClick={fetchData}>
                  Refresh
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            backgroundColor: "background.paper",
          }}
        >
          <Box
            sx={{
              overflow: "auto",
              maxHeight: "85vh",
            }}
          >
            {loading ? (
              <Box sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={48} sx={{ mb: 2 }} />
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={`row-${index}`}
                    variant="rectangular"
                    height={56}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: `${NAME_COL_WIDTH}px repeat(${dayRange.length}, ${CELL_WIDTH}px)`,
                    position: "sticky",
                    top: 0,
                    zIndex: 3,
                    backgroundColor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 4,
                      borderRight: "1px solid",
                      borderColor: "divider",
                      borderBottom: "1px solid",
                      borderBottomColor: "divider",
                      backgroundColor: "background.paper",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      px: 2,
                      height: 64,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Listing
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Name
                    </Typography>
                  </Box>
                  {dayRange.map((date) => (
                    <HeaderCell key={date} date={date} today={today} />
                  ))}
                </Box>

                {filteredListings.map((listing) => (
                  <ListingRow
                    key={listing.listingId}
                    listing={listing}
                    dates={dayRange}
                    today={today}
                    onCellMouseDown={handleMouseDown}
                    onCellMouseEnter={handleMouseEnter}
                    onCellMouseUp={handleMouseUp}
                    isDateSelected={isDateSelected}
                    isRowSelected={getSelectedDatesForListing(listing.listingId).length > 0}
                    onCellChange={handleCellChange}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Stack>

      <Drawer
        anchor={isMdUp ? "right" : "bottom"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: isMdUp ? 440 : "100%" } }}
      >
        <Box
          sx={{
            p: 2,
            pb: 3,
            maxHeight: isMdUp ? "100vh" : "75vh",
            overflowY: "auto",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Bulk availability actions
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {hasSelection ? selectionSummary : "Select dates to enable bulk updates."}
              </Typography>
              {filteredOutCount > 0 && (
                <Typography variant="caption" sx={{ color: "warning.main", display: "block" }}>
                  Skipping {filteredOutCount} date{filteredOutCount === 1 ? "" : "s"} based on advanced rules.
                </Typography>
              )}
            </Box>
            <IconButton size="small" onClick={() => setDrawerOpen(false)} aria-label="Close bulk actions">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={3}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Price
                </Typography>
                {hasPriceAction && (
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={
                      priceMode === "fixed"
                        ? `Set to ₹${normalizedPriceInput}`
                        : `${priceDirection === "increase" ? "+" : "-"}${normalizedPriceInput}${priceMode === "delta-percent" ? "%" : "₹"}`
                    }
                  />
                )}
              </Stack>

              <ToggleButtonGroup
                size="small"
                exclusive
                value={priceMode}
                onChange={(_, value) => value && setPriceMode(value)}
                aria-label="Price action"
              >
                <ToggleButton value="none">No change</ToggleButton>
                <ToggleButton value="fixed">Set fixed price</ToggleButton>
                <ToggleButton value="delta-amount">Apply ₹ delta</ToggleButton>
                <ToggleButton value="delta-percent">Apply % delta</ToggleButton>
              </ToggleButtonGroup>

              <Collapse in={priceMode !== "none"}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  sx={{ mt: 1 }}
                >
                  {priceMode !== "fixed" && (
                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={priceDirection}
                      onChange={(_, value) => value && setPriceDirection(value)}
                      aria-label="Price direction"
                    >
                      <ToggleButton value="increase">Increase</ToggleButton>
                      <ToggleButton value="decrease">Decrease</ToggleButton>
                    </ToggleButtonGroup>
                  )}
                  <TextField
                    size="small"
                    type="number"
                    label={priceMode === "delta-percent" ? "Percent" : "Amount"}
                    value={priceInput}
                    onChange={(event) => setPriceInput(event.target.value)}
                    inputProps={{ min: 0 }}
                    helperText={
                      priceMode === "fixed"
                        ? PRICE_INPUT_HELPER
                        : "Applied relative to the current nightly price."
                    }
                  />
                </Stack>
                {priceIsDelta && skipMissingPrices && (
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                    Dates without a price are skipped to keep validation consistent with bulk updates.
                  </Typography>
                )}
              </Collapse>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Inventory
              </Typography>
              <TextField
                size="small"
                label="Inventory count"
                type="number"
                value={inventoryInput}
                onChange={(event) => setInventoryInput(event.target.value)}
                helperText="Set a room count for selected dates. Leave blank to skip."
                inputProps={{ min: 0 }}
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Status and channels
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={statusAction}
                onChange={(_, value) => value && setStatusAction(value)}
                aria-label="Status action"
              >
                <ToggleButton value="none">No change</ToggleButton>
                <ToggleButton value="block">Block</ToggleButton>
                <ToggleButton value="unblock">Unblock</ToggleButton>
                <ToggleButton value="close-channels">Close all channels</ToggleButton>
              </ToggleButtonGroup>

              <Collapse in={statusAction === "block" || statusAction === "close-channels"}>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <FormControl size="small">
                    <InputLabel>Block type</InputLabel>
                    <Select
                      value={blockType}
                      label="Block type"
                      onChange={(event) => setBlockType(event.target.value as BulkUpdateSelection["blockType"])}
                    >
                      {BLOCK_TYPE_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {statusAction === "close-channels" && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      Closing channels blocks the dates and forces inventory to zero.
                    </Typography>
                  )}
                </Stack>
              </Collapse>
            </Stack>

            <Accordion
              expanded={advancedOpen}
              onChange={(_, expanded) => setAdvancedOpen(expanded)}
              disableGutters
              elevation={0}
              sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Advanced rules
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={onlyOpenDates}
                        onChange={(event) => setOnlyOpenDates(event.target.checked)}
                      />
                    }
                    label="Only update dates that are currently open"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={skipMissingPrices}
                        onChange={(event) => setSkipMissingPrices(event.target.checked)}
                      />
                    }
                    label="Skip dates without a nightly price when applying deltas"
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Validation follows the bulk availability API: select a listing and dates, then choose at least one action
                    (price, inventory, or status).
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="flex-end"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button onClick={clearSelection} disabled={!hasSelection || saving} variant="outlined">
              Clear selection
            </Button>
            <Button onClick={handleSave} variant="contained" disabled={!canSave || saving}>
              {saving ? "Applying" : "Apply changes"}
            </Button>
          </Stack>
        </Box>
      </Drawer>

      <Dialog
        open={Boolean(cellPriceReasonDialog)}
        onClose={() => confirmCellPriceReason()}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>Reason for price update</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Optional reason for this price change (e.g. seasonal rate, promotion).
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason (optional)"
            placeholder="e.g. Seasonal rate, promotion"
            value={cellPriceReason}
            onChange={(e) => setCellPriceReason(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                confirmCellPriceReason(cellPriceReason);
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => confirmCellPriceReason()} color="inherit">
            Skip
          </Button>
          <Button
            onClick={() => confirmCellPriceReason(cellPriceReason)}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={adminPricingOpen} onClose={() => !adminPricingSubmitting && setAdminPricingOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Base pricing</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              size="small"
              label="Listing ID"
              type="number"
              value={adminPricingForm.listingId}
              onChange={(e) =>
                setAdminPricingForm((prev) => ({ ...prev, listingId: e.target.value }))
              }
              required
              inputProps={{ min: 1, step: 1 }}
            />
            <TextField
              size="small"
              label="Base nightly rate"
              type="number"
              value={adminPricingForm.baseNightlyRate}
              onChange={(e) =>
                setAdminPricingForm((prev) => ({ ...prev, baseNightlyRate: e.target.value }))
              }
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              size="small"
              label="Weekend nightly rate"
              type="number"
              value={adminPricingForm.weekendNightlyRate}
              onChange={(e) =>
                setAdminPricingForm((prev) => ({
                  ...prev,
                  weekendNightlyRate: e.target.value,
                }))
              }
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              size="small"
              label="Extra guest rate"
              type="number"
              value={adminPricingForm.extraGuestRate}
              onChange={(e) =>
                setAdminPricingForm((prev) => ({ ...prev, extraGuestRate: e.target.value }))
              }
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              size="small"
              label="Currency"
              value={adminPricingForm.currency}
              onChange={(e) =>
                setAdminPricingForm((prev) => ({ ...prev, currency: e.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={() => setAdminPricingOpen(false)}
            disabled={adminPricingSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdminPricingSubmit}
            disabled={adminPricingSubmitting}
          >
            {adminPricingSubmitting ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(successNotice)}
        autoHideDuration={3000}
        onClose={() => setSuccessNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSuccessNotice("")} severity="success" sx={{ width: "100%" }}>
          {successNotice}
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(errorNotice)}
        autoHideDuration={4000}
        onClose={() => setErrorNotice("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setErrorNotice("")} severity="error" sx={{ width: "100%" }}>
          {errorNotice}
        </Alert>
      </Snackbar>
    </AdminShellLayout>
  );
}
