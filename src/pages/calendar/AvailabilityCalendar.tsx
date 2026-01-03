import React, { useCallback, useEffect, useMemo, useState } from "react";
import { addDays, format, getDay, isSameDay, parseISO } from "date-fns";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
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
        <Typography variant="body2">
          {availability?.price != null ? formatCurrencyINR(availability.price) : "—"}
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
};

const ListingRow = React.memo(
  ({ listing, dates, today, onCellMouseDown, onCellMouseEnter, onCellMouseUp, isDateSelected }: ListingRowProps) => (
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
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Listing
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
  const selectedDates = useMemo(() => {
    if (filteredListings.length !== 1) {
      return [];
    }

    return getSelectedDatesForListing(filteredListings[0].listingId);
  }, [filteredListings, getSelectedDatesForListing]);

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
                  {selectedDates.length > 0
                    ? `Selected ${selectedDates.length} day${selectedDates.length === 1 ? "" : "s"}`
                    : "No dates selected"}
                </Typography>
                <Button size="small" variant="outlined">
                  Block
                </Button>
                <Button size="small" variant="outlined">
                  Unblock
                </Button>
                <Button size="small" variant="outlined">
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
                  <ListingRow
                    key={listing.listingId}
                    listing={listing}
                    dates={dayRange}
                    today={today}
                    onCellMouseDown={handleMouseDown}
                    onCellMouseEnter={handleMouseEnter}
                    onCellMouseUp={handleMouseUp}
                    isDateSelected={isDateSelected}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </AdminShellLayout>
  );
}
