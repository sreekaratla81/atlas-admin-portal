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
const OPEN_COLOR = "#dcfce7";
const OPEN_WEEKEND_COLOR = "#bbf7d0";
const BLOCKED_COLOR = "#fee2e2";
const BLOCKED_WEEKEND_COLOR = "#fecaca";
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
  ratePlanId: number | null;
  date: string;
  availability?: CalendarDay;
  value?: string;
  secondaryValue?: string;
  today: Date;
  isSelected: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
};

const DataCell = React.memo(
  ({
    listingId,
    ratePlanId,
    date,
    availability,
    value,
    secondaryValue,
    today,
    isSelected,
    onMouseDown,
    onMouseEnter,
    onMouseUp,
  }: DataCellProps) => {
  const dateObj = parseISO(date);
  const isWeekend = getDay(dateObj) === 0 || getDay(dateObj) === 6;
  const isToday = isSameDay(dateObj, today);
  const status = availability?.status ?? "open";

  const backgroundColor = status === "blocked"
    ? isWeekend
      ? BLOCKED_WEEKEND_COLOR
      : BLOCKED_COLOR
    : isWeekend
      ? OPEN_WEEKEND_COLOR
      : OPEN_COLOR;

  const tooltipText = status === "blocked"
    ? `${availability?.blockType ?? "Blocked"}${availability?.reason ? ` • ${availability.reason}` : ""}`
    : "Available";

  return (
    <Tooltip key={`${listingId}-${ratePlanId ?? "listing"}-${date}`} title={tooltipText} arrow>
      <Box
        sx={{
          width: CELL_WIDTH,
          height: 64,
          borderRight: "1px solid",
          borderColor: "divider",
          borderBottom: "1px solid",
          borderBottomColor: "divider",
          backgroundColor,
          display: "flex",
          flexDirection: "column",
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
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {value ?? (availability?.price != null ? formatCurrencyINR(availability.price) : "—")}
        </Typography>
        {secondaryValue && (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {secondaryValue}
          </Typography>
        )}
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

type ListingAvailabilityRowProps = {
  listing: CalendarListing;
  dates: string[];
  today: Date;
  onCellMouseDown: (listingId: number, ratePlanId: number | null, date: string, shiftKey: boolean) => void;
  onCellMouseEnter: (listingId: number, ratePlanId: number | null, date: string) => void;
  onCellMouseUp: () => void;
  isDateSelected: (listingId: number, ratePlanId: number | null, date: string) => boolean;
};

const ListingAvailabilityRow = React.memo(
  ({ listing, dates, today, onCellMouseDown, onCellMouseEnter, onCellMouseUp, isDateSelected }: ListingAvailabilityRowProps) => (
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
          height: 64,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {listing.listingName}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Listing availability
        </Typography>
      </Box>
      {dates.map((date) => {
        const availability = listing.days[date];
        const inventoryText = availability?.inventory != null ? `Inv: ${availability.inventory}` : undefined;

        return (
          <DataCell
            key={`${listing.listingId}-availability-${date}`}
            listingId={listing.listingId}
            ratePlanId={null}
            date={date}
            availability={availability}
            value={inventoryText ?? "—"}
            today={today}
            secondaryValue={availability?.price != null ? formatCurrencyINR(availability.price) : undefined}
            isSelected={isDateSelected(listing.listingId, null, date)}
            onMouseDown={(event) => onCellMouseDown(listing.listingId, null, date, event.shiftKey)}
            onMouseEnter={() => onCellMouseEnter(listing.listingId, null, date)}
            onMouseUp={onCellMouseUp}
          />
        );
      })}
    </Box>
  )
);

ListingAvailabilityRow.displayName = "ListingAvailabilityRow";

type RatePlanRowProps = {
  listing: CalendarListing;
  ratePlan: CalendarListing["ratePlans"][number];
  dates: string[];
  today: Date;
  onCellMouseDown: (listingId: number, ratePlanId: number | null, date: string, shiftKey: boolean) => void;
  onCellMouseEnter: (listingId: number, ratePlanId: number | null, date: string) => void;
  onCellMouseUp: () => void;
  isDateSelected: (listingId: number, ratePlanId: number | null, date: string) => boolean;
};

const RatePlanRow = React.memo(
  ({ listing, ratePlan, dates, today, onCellMouseDown, onCellMouseEnter, onCellMouseUp, isDateSelected }: RatePlanRowProps) => (
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
          height: 64,
          pl: 3,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {ratePlan.name}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Rate plan
        </Typography>
      </Box>
      {dates.map((date) => {
        const availability = listing.days[date];
        const ratePlanDay = ratePlan.daily[date];
        const inventoryText = availability?.inventory != null ? `Inv: ${availability.inventory}` : undefined;
        const value = ratePlanDay?.price != null ? formatCurrencyINR(ratePlanDay.price) : "—";

        return (
          <DataCell
            key={`${listing.listingId}-${ratePlan.ratePlanId}-${date}`}
            listingId={listing.listingId}
            ratePlanId={ratePlan.ratePlanId}
            date={date}
            availability={availability}
            value={value}
            secondaryValue={inventoryText}
            today={today}
            isSelected={isDateSelected(listing.listingId, ratePlan.ratePlanId, date)}
            onMouseDown={(event) => onCellMouseDown(listing.listingId, ratePlan.ratePlanId, date, event.shiftKey)}
            onMouseEnter={() => onCellMouseEnter(listing.listingId, ratePlan.ratePlanId, date)}
            onMouseUp={onCellMouseUp}
          />
        );
      })}
    </Box>
  )
);

RatePlanRow.displayName = "RatePlanRow";

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
    selection,
    clearSelection,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    isDateSelected,
    getSelectedDatesForRow,
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
  const selectedListing = useMemo(() => {
    if (!selection.listingId) {
      return null;
    }
    return listings.find((listing) => listing.listingId === selection.listingId) ?? null;
  }, [listings, selection.listingId]);

  const selectedDates = useMemo(() => {
    if (!selection.listingId) {
      return [];
    }

    return getSelectedDatesForRow(selection.listingId, selection.ratePlanId);
  }, [getSelectedDatesForRow, selection.listingId, selection.ratePlanId]);

  const selectedRatePlan = useMemo(() => {
    if (!selectedListing || selection.ratePlanId == null) {
      return null;
    }

    return (
      selectedListing.ratePlans.find((plan) => plan.ratePlanId === selection.ratePlanId) ?? null
    );
  }, [selectedListing, selection.ratePlanId]);

  const selectionSummary = useMemo(() => {
    if (!selection.startDate || !selection.endDate || selectedDates.length === 0) {
      return "No dates selected";
    }

    const start = format(parseISO(selection.startDate), "MMM d, yyyy");
    const end = format(parseISO(selection.endDate), "MMM d, yyyy");
    const labelPrefix = selectedRatePlan?.name
      ? `${selectedListing?.listingName ?? "Listing"} • ${selectedRatePlan.name}`
      : selectedListing?.listingName ?? "Listing";

    return `${labelPrefix} · ${start} - ${end} · ${selectedDates.length} night${selectedDates.length === 1 ? "" : "s"}`;
  }, [selectedDates.length, selectedListing?.listingName, selectedRatePlan?.name, selection.endDate, selection.startDate]);

  const hasSelection = selectedDates.length > 0 && Boolean(selectedListing);
  const parsedNightlyPrice = nightlyPrice.trim() === "" ? null : Number(nightlyPrice);
  const normalizedNightlyPrice = Number.isNaN(parsedNightlyPrice) ? null : parsedNightlyPrice;
  const canSave =
    hasSelection && (blockAction !== "none" || (normalizedNightlyPrice != null && selection.ratePlanId != null));

  const openBulkModal = (action: "block" | "unblock" | "price") => {
    if (!hasSelection) {
      return;
    }

    if (action === "price" && selection.ratePlanId == null) {
      setErrorNotice("Select a rate plan row to set prices.");
      return;
    }
    setBlockAction(action === "price" ? "none" : action);
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
      }
    ) => {
      if (!selection.listingId || selectedDates.length === 0) {
        return currentListings;
      }

      return currentListings.map((listing) => {
        if (listing.listingId !== selection.listingId) {
          return listing;
        }

        const updatedDays = { ...listing.days };
        selectedDates.forEach((date) => {
          const existing = updatedDays[date] ?? { date, status: "open" as const };
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

          if (update.price != null && selection.ratePlanId == null) {
            next.price = update.price;
          }

          updatedDays[date] = next;
        });

        const updatedRatePlans = listing.ratePlans.map((plan) => {
          if (update.price == null || selection.ratePlanId !== plan.ratePlanId) {
            return plan;
          }

          const updatedDaily = { ...plan.daily };

          selectedDates.forEach((date) => {
            const existing = updatedDaily[date] ?? { date, status: "open" as const };
            updatedDaily[date] = { ...existing, price: update.price };
          });

          return { ...plan, daily: updatedDaily };
        });

        return {
          ...listing,
          days: updatedDays,
          ratePlans: updatedRatePlans,
        };
      });
    },
    [selectedDates, selection.listingId, selection.ratePlanId]
  );

  const handleSave = useCallback(async () => {
    if (!hasSelection || !selectedListing) {
      return;
    }

    const bulkSelection: BulkUpdateSelection = {
      listingId: selectedListing.listingId,
      ratePlanId: selection.ratePlanId ?? undefined,
      dates: selectedDates,
      blockType,
      unblock: blockAction === "unblock",
      nightlyPrice: normalizedNightlyPrice,
    };

    const requests: Promise<unknown>[] = [];
    if (blockAction !== "none") {
      requests.push(api.post("/availability/blocks/bulk", buildBulkBlockPayload(bulkSelection)));
    }
    if (normalizedNightlyPrice != null && selection.ratePlanId != null) {
      requests.push(api.post("/pricing/daily/bulk", buildBulkPricePayload(bulkSelection)));
    }

    if (requests.length === 0) {
      return;
    }

    const snapshot = listings;
    setSaving(true);
    setListings(
      applyOptimisticUpdate(snapshot, {
        status: blockAction === "none" ? undefined : blockAction === "unblock" ? "open" : "blocked",
        blockType: blockAction === "block" ? blockType : undefined,
        price: selection.ratePlanId != null ? normalizedNightlyPrice ?? undefined : undefined,
      })
    );

    try {
      await Promise.all(requests);
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
    selection.ratePlanId,
    selectedDates,
    selectedListing,
  ]);

  return (
    <AdminShellLayout title="Availability Calendar">
      <Stack spacing={3} sx={{ pb: 4 }}>
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
            p: 2,
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
              <Skeleton variant="rectangular" width={360} height={40} />
            </Stack>
          ) : (
            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", lg: "center" }}
            >
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

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ ml: "auto", flexWrap: "wrap" }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {hasSelection ? selectionSummary : "No dates selected"}
                </Typography>
                <Button size="small" variant="outlined" disabled={!hasSelection} onClick={() => openBulkModal("block")}>
                  Block
                </Button>
                <Button size="small" variant="outlined" disabled={!hasSelection} onClick={() => openBulkModal("unblock")}>
                  Unblock
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!hasSelection || selection.ratePlanId == null}
                  onClick={() => openBulkModal("price")}
                >
                  Set Price
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
              maxHeight: "70vh",
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
                      Name & type
                    </Typography>
                  </Box>
                  {dayRange.map((date) => (
                    <HeaderCell key={date} date={date} today={today} />
                  ))}
                </Box>

                {filteredListings.map((listing) => (
                  <Box key={listing.listingId} sx={{ borderTop: "1px solid", borderColor: "divider" }}>
                    <ListingAvailabilityRow
                      listing={listing}
                      dates={dayRange}
                      today={today}
                      onCellMouseDown={handleMouseDown}
                      onCellMouseEnter={handleMouseEnter}
                      onCellMouseUp={handleMouseUp}
                      isDateSelected={isDateSelected}
                    />
                    {listing.ratePlans.map((ratePlan) => (
                      <RatePlanRow
                        key={`${listing.listingId}-${ratePlan.ratePlanId}`}
                        listing={listing}
                        ratePlan={ratePlan}
                        dates={dayRange}
                        today={today}
                        onCellMouseDown={handleMouseDown}
                        onCellMouseEnter={handleMouseEnter}
                        onCellMouseUp={handleMouseUp}
                        isDateSelected={isDateSelected}
                      />
                    ))}
                  </Box>
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
              {selectedListing?.listingName ?? "Selected listing"}
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
            disabled={selection.ratePlanId == null}
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
