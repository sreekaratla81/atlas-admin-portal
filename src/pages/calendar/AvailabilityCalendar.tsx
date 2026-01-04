import React, { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format, getDay, isSameDay, parseISO } from "date-fns";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import { api, asArray } from "@/lib/api";
import {
  buildDateArray,
  buildBulkBlockPayload,
  buildBulkPricePayload,
  BulkUpdateSelection,
  CalendarDay,
  CalendarListing,
  fetchCalendarData,
  formatCurrencyINR,
  patchAvailabilityCell,
  patchAvailabilityBulk,
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
            onChange={(event) => setInventoryDraft(event.target.value)}
            onBlur={() => commitChange("inventory")}
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
          backgroundColor: "background.paper",
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
  const [modalOpen, setModalOpen] = useState(false);
  const [blockAction, setBlockAction] = useState<"none" | "block" | "unblock">("none");
  const [blockType, setBlockType] = useState<BulkUpdateSelection["blockType"]>("Maintenance");
  const [nightlyPrice, setNightlyPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const toDate = useMemo(() => {
    const start = parseISO(fromDate);
    return format(addDays(start, rangeDays - 1), "yyyy-MM-dd");
  }, [fromDate, rangeDays]);

  const dayRange = useMemo(() => buildDateArray(fromDate, toDate), [fromDate, toDate]);
  const {
    clearSelection,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    isDateSelected,
    getSelectedDatesForListing,
    getSelectedListings,
  } = useCalendarSelection(dayRange);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const propertiesResponse = await api.get("/properties");
      setProperties(asArray<Property>(propertiesResponse.data, "properties"));

      const calendarListings = await fetchCalendarData(selectedProperty || undefined, fromDate, toDate);
      setListings(calendarListings);
    } catch (err) {
      setError("We couldn't load availability data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, selectedProperty, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    clearSelection();
  }, [clearSelection, fromDate, rangeDays, selectedProperty]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) =>
      listing.listingName.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [listings, search]);

  const today = useMemo(() => new Date(), []);
  const selectedListingRanges = useMemo(() => getSelectedListings(), [getSelectedListings]);

  const totalSelectedDates = useMemo(
    () => selectedListingRanges.reduce((total, selection) => total + selection.dates.length, 0),
    [selectedListingRanges]
  );

  const selectedListingEntities = useMemo(
    () =>
      listings.filter((listing) =>
        selectedListingRanges.some((selection) => selection.listingId === listing.listingId)
      ),
    [listings, selectedListingRanges]
  );

  const selectionSummary = useMemo(() => {
    if (selectedListingRanges.length === 0) {
      return "No dates selected";
    }

    const listingLabel =
      selectedListingEntities.length === 1
        ? selectedListingEntities[0].listingName
        : `${selectedListingEntities.length} listings`;

    const startDates = selectedListingRanges
      .map((selection) => selection.startDate)
      .filter(Boolean)
      .sort();
    const endDates = selectedListingRanges
      .map((selection) => selection.endDate)
      .filter(Boolean)
      .sort();

    const start = startDates[0] ? format(parseISO(startDates[0] as string), "MMM d, yyyy") : null;
    const end = endDates[endDates.length - 1]
      ? format(parseISO(endDates[endDates.length - 1] as string), "MMM d, yyyy")
      : null;

    if (!start || !end) {
      return `Selected ${totalSelectedDates} day${totalSelectedDates === 1 ? "" : "s"} • ${listingLabel}`;
    }

    return `${start} - ${end} · ${totalSelectedDates} night${totalSelectedDates === 1 ? "" : "s"} • ${listingLabel}`;
  }, [selectedListingEntities, selectedListingRanges, totalSelectedDates]);

  const hasSelection = totalSelectedDates > 0 && selectedListingEntities.length > 0;
  const parsedNightlyPrice = nightlyPrice.trim() === "" ? null : Number(nightlyPrice);
  const normalizedNightlyPrice = Number.isNaN(parsedNightlyPrice) ? null : parsedNightlyPrice;
  const canSave = hasSelection && (blockAction !== "none" || normalizedNightlyPrice != null);

  const openBulkModal = () => {
    if (!hasSelection) {
      return;
    }
    setBlockAction("none");
    setBlockType("Maintenance");
    setNightlyPrice("");
    setModalOpen(true);
  };

  const applyOptimisticUpdate = useCallback(
    (
      currentListings: CalendarListing[],
      update: {
        status?: "open" | "blocked";
        blockType?: BulkUpdateSelection["blockType"];
        price?: number;
        inventory?: number | null;
      },
      selectedRanges: { listingId: number; dates: string[] }[]
    ) => {
      if (selectedRanges.length === 0) {
        return currentListings;
      }

      return selectedRanges.reduce((listingsAcc, selection) => {
        if (selection.dates.length === 0) {
          return listingsAcc;
        }

        return listingsAcc.map((listing) => {
          if (listing.listingId !== selection.listingId) {
            return listing;
          }

          return {
            ...listing,
            days: selection.dates.reduce<Record<string, CalendarDay>>((acc, date) => {
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
      update: { price?: number | null; inventory?: number | null }
    ) => {
      return currentListings.map((listing) => {
        if (listing.listingId !== listingId) {
          return listing;
        }

        const nextListingDay = {
          ...(listing.days[date] ?? { date, status: "open" as const }),
          ...update,
        };

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

  const handleSave = useCallback(async () => {
    if (!hasSelection) {
      return;
    }

    const selectionsForPayload: BulkUpdateSelection[] = selectedListingRanges.map((selection) => ({
      listingId: selection.listingId,
      dates: selection.dates,
      blockType: blockType,
      unblock: blockAction === "unblock",
      nightlyPrice: normalizedNightlyPrice ?? undefined,
    }));

    const blockPayloads =
      blockAction === "none" ? [] : buildBulkBlockPayload(selectionsForPayload.filter((selection) => selection.dates.length));
    const pricePayloads =
      normalizedNightlyPrice == null
        ? []
        : buildBulkPricePayload(selectionsForPayload.filter((selection) => selection.dates.length));

    const snapshot = listings;
    setSaving(true);
    setListings(
      applyOptimisticUpdate(snapshot, {
        status: blockAction === "none" ? undefined : blockAction === "unblock" ? "open" : "blocked",
        blockType: blockAction === "block" ? blockType : undefined,
        price: normalizedNightlyPrice ?? undefined,
      }, selectedListingRanges)
    );

    try {
      const payloads = [...blockPayloads, ...pricePayloads];
      for (const payload of payloads) {
        // eslint-disable-next-line no-await-in-loop
        await patchAvailabilityBulk(payload);
      }
      setSuccessNotice("Availability updated successfully.");
      setErrorNotice("");
      setModalOpen(false);
      clearSelection();
    } catch (err) {
      setListings(snapshot);
      setErrorNotice("Update failed. Changes have been reverted.");
    } finally {
      setSaving(false);
    }
  }, [
    applyOptimisticUpdate,
    blockAction,
    blockType,
    clearSelection,
    hasSelection,
    listings,
    normalizedNightlyPrice,
    selectedListingRanges,
  ]);

  const handleCellChange = useCallback(
    async (
      listingId: number,
      date: string,
      update: { price?: number | null; inventory?: number | null }
    ) => {
      const snapshot = listings;

      setListings((current) => applyCellUpdateForDate(current, listingId, date, update));

      try {
        await patchAvailabilityCell({ listingId, date, ...update });
        setSuccessNotice("Availability updated successfully.");
        setErrorNotice("");
      } catch (err) {
        setListings(snapshot);
        setErrorNotice("Update failed. Changes have been reverted.");
      }
    },
    [applyCellUpdateForDate, listings]
  );

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
                  {selectionSummary}
                </Typography>
                <Button size="small" variant="outlined" disabled={!hasSelection} onClick={openBulkModal}>
                  Bulk edit
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
                    onCellChange={handleCellChange}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Stack>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Update availability</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {selectedListingEntities.length === 1
                ? selectedListingEntities[0].listingName
                : `${selectedListingEntities.length || "No"} listings selected`}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {selectionSummary}
            </Typography>
          </Stack>

          <FormControl size="small">
            <InputLabel>Block action</InputLabel>
            <Select
              value={blockAction}
              label="Block action"
              onChange={(event) => setBlockAction(event.target.value as "none" | "block" | "unblock")}
            >
              <MenuItem value="none">No block change</MenuItem>
              <MenuItem value="block">Block dates</MenuItem>
              <MenuItem value="unblock">Unblock dates</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" disabled={blockAction !== "block"}>
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

          <TextField
            size="small"
            label="Nightly price"
            type="number"
            value={nightlyPrice}
            onChange={(event) => setNightlyPrice(event.target.value)}
            inputProps={{ min: 0 }}
            helperText={PRICE_INPUT_HELPER}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!canSave || saving}>
            Save
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
