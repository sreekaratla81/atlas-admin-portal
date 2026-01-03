import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
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

type Property = {
  id: number;
  name: string;
};

type Listing = {
  id: number;
  name: string;
  type?: string;
  propertyId?: number;
};

type AvailabilityStatus = "open" | "blocked";

type AvailabilityCell = {
  status: AvailabilityStatus;
  price: number;
  blockType?: string;
  reason?: string;
};

const RANGE_OPTIONS = [30, 60, 90] as const;
const CELL_WIDTH = 110;
const NAME_COL_WIDTH = 280;
const TODAY_OUTLINE = "#0284c7";
const OPEN_COLOR = "#dcfce7";
const OPEN_WEEKEND_COLOR = "#bbf7d0";
const BLOCKED_COLOR = "#fee2e2";
const BLOCKED_WEEKEND_COLOR = "#fecaca";

const blockReasons = [
  "Owner stay",
  "Maintenance",
  "Regulatory hold",
  "Deep cleaning",
];

const blockTypes = ["Hold", "Manual block", "System block"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const buildAvailability = (listingId: number, dayIndex: number): AvailabilityCell => {
  const blocked = (listingId + dayIndex) % 7 === 0 || (listingId + dayIndex) % 11 === 0;
  const price = 2800 + (listingId % 5) * 200 + dayIndex * 12;

  if (!blocked) {
    return { status: "open", price };
  }

  const reason = blockReasons[(listingId + dayIndex) % blockReasons.length];
  const blockType = blockTypes[(listingId + dayIndex) % blockTypes.length];

  return {
    status: "blocked",
    price,
    reason,
    blockType,
  };
};

export default function AvailabilityCalendar() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [rangeDays, setRangeDays] = useState<typeof RANGE_OPTIONS[number]>(30);
  const [fromDate, setFromDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [propertiesResponse, listingsResponse] = await Promise.all([
        api.get("/properties"),
        api.get("/listings"),
      ]);

      setProperties(asArray<Property>(propertiesResponse.data, "properties"));
      setListings(asArray<Listing>(listingsResponse.data, "listings"));
    } catch (err) {
      setError("We couldn't load availability data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dayRange = useMemo(() => {
    const start = dayjs(fromDate);
    return Array.from({ length: rangeDays }, (_, index) => start.add(index, "day"));
  }, [fromDate, rangeDays]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesProperty = selectedProperty
        ? String(listing.propertyId) === selectedProperty
        : true;
      const matchesSearch = listing.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesProperty && matchesSearch;
    });
  }, [listings, search, selectedProperty]);

  const today = useMemo(() => dayjs(), []);

  const renderHeaderCell = (day: Dayjs) => {
    const isWeekend = day.day() === 0 || day.day() === 6;
    const isToday = day.isSame(today, "day");

    return (
      <Box
        key={day.toString()}
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
          {day.format("ddd")}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {day.format("D")}
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
  };

  const renderDataCell = (listingId: number, day: Dayjs, dayIndex: number) => {
    const availability = buildAvailability(listingId, dayIndex);
    const isWeekend = day.day() === 0 || day.day() === 6;
    const isToday = day.isSame(today, "day");
    const backgroundColor = availability.status === "blocked"
      ? isWeekend
        ? BLOCKED_WEEKEND_COLOR
        : BLOCKED_COLOR
      : isWeekend
        ? OPEN_WEEKEND_COLOR
        : OPEN_COLOR;

    const tooltipText = availability.status === "blocked"
      ? `${availability.blockType} • ${availability.reason}`
      : "Available";

    return (
      <Tooltip key={`${listingId}-${day.toString()}`} title={tooltipText} arrow>
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
            color: availability.status === "blocked" ? "text.primary" : "text.primary",
          }}
        >
          <Typography variant="body2">{formatCurrency(availability.price)}</Typography>
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
  };

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
                  {dayRange.map(renderHeaderCell)}
                </Box>

                {filteredListings.map((listing, rowIndex) => (
                  <Box
                    key={listing.id ?? rowIndex}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: `${NAME_COL_WIDTH}px repeat(${dayRange.length}, ${CELL_WIDTH}px)`,
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
                        {listing.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {listing.type ?? "Listing"}
                      </Typography>
                    </Box>
                    {dayRange.map((day, dayIndex) =>
                      renderDataCell(listing.id ?? rowIndex, day, dayIndex)
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Stack>
    </AdminShellLayout>
  );
}
