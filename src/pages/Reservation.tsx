import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  TablePagination,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Search as SearchIcon } from "@mui/icons-material";
import AdminShellLayout from "@/components/layout/AdminShellLayout";
import ManualBookingPopup from "./ManualBookingPopup";

// ----------------------
// Types
// ----------------------
interface BookingApiResponse {
  id?: string;
  bookingId?: string;
  bookingNumber?: string;
  bookingSource?: string;
  guestName?: string;
  listing?: string;
  propertyName?: string;
  checkinDate: string;
  checkoutDate: string;
  paymentStatus?: string;
}

interface Booking {
  bookingId: string;
  source: string;
  guestName: string;
  mobile: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  paymentStatus: string;
  _checkInDate: Date;
}

interface Property {
  id: string | number;
  name: string;
  image: string;
  fullAddress: string;
}

// ----------------------
// Helpers
// ----------------------
function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

const propertyImages = [
  "https://atlashomestorage.blob.core.windows.net/listing-images/101/cover.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/102/img_1.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/201/img_11.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/202/cover.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/301/cover.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/302/cover.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/501/IMG_1.jpg",
];

// ----------------------
// Component
// ----------------------
const Reservation: React.FC = () => {
  // ----------------------
  // State
  // ----------------------
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [search, setSearch] = useState<string>("");
  const [checkinFrom, setCheckinFrom] = useState<Dayjs | null>(null);
  const [checkinTo, setCheckinTo] = useState<Dayjs | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [propertySearch, setPropertySearch] = useState<string>("");
  const [selectedManualProperty, setSelectedManualProperty] = useState<Property | null>(null);
  const [openManualBookingList, setOpenManualBookingList] = useState<boolean>(false);
  const [openFullManualBooking, setOpenFullManualBooking] = useState<boolean>(false);
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [loadingError, setLoadingError] = useState<string>("");
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);
  const [retryScheduled, setRetryScheduled] = useState<boolean>(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Left panel counts
  const [allCount, setAllCount] = useState(0);
  const [arrivingSoonCount, setArrivingSoonCount] = useState(0);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [checkinCount, setCheckinCount] = useState(0);
  const [checkoutCount, setCheckoutCount] = useState(0);
  const [offlineBookingCount, setOfflineBookingCount] = useState(0);
  const [bookingLeadsCount, setBookingLeadsCount] = useState(0);
  const [ongoingCount, setOngoingCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [last7DaysCount, setLast7DaysCount] = useState(0);
  const [last30DaysCount, setLast30DaysCount] = useState(0);
  const [last12MonthsCount, setLast12MonthsCount] = useState(0);

  // ----------------------
  // FETCH BOOKINGS
  // ----------------------
  const fetchBookings = async () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setLoadingBookings(true);
    setLoadingError("");
    setRetryScheduled(false);
    try {
      const res = await api.get<BookingApiResponse[]>("/bookings");
      const bookingsData: Booking[] = asArray(res.data).map((b) => {
        const guestParts = b.guest ? b.guest.trim().split(" ") : [];
        const mobile = guestParts.length > 1 ? guestParts.pop()! : "N/A";
        const name = guestParts.length ? guestParts.join(" ") : "N/A";

        return {
          bookingId: b.id || b.bookingId || b.bookingNumber || "N/A",
          source: b.bookingSource || "N/A",
          guestName: name,
          mobile,
          propertyName: b.listing || b.propertyName || "N/A",
          checkInDate: b.checkinDate,
          checkOutDate: b.checkoutDate,
          paymentStatus: b.paymentStatus || "Pending",
          _checkInDate: new Date(b.checkinDate),
        };
      });
      setBookings(bookingsData);
      setLoadingBookings(false);

      // Calculate counts for left panel
      setAllCount(bookingsData.length);
      setArrivingSoonCount(bookingsData.filter(b => {
        const daysDiff = dayjs(b.checkInDate).diff(dayjs(), "day");
        return daysDiff >= 0 && daysDiff <= 3;
      }).length);
      setPendingReviewCount(bookingsData.filter(b => b.paymentStatus === "Pending").length);
      setCheckinCount(bookingsData.filter(b => dayjs(b.checkInDate).isSame(dayjs(), "day")).length);
      setCheckoutCount(bookingsData.filter(b => dayjs(b.checkOutDate).isSame(dayjs(), "day")).length);
      setOfflineBookingCount(bookingsData.filter(b => b.source === "Walk-in").length);
      setBookingLeadsCount(bookingsData.filter(b => b.source !== "Walk-in").length);
      setOngoingCount(bookingsData.filter(b => b.paymentStatus === "Ongoing").length);
      setUpcomingCount(bookingsData.filter(b => b.paymentStatus === "Upcoming").length);
      setCompletedCount(bookingsData.filter(b => b.paymentStatus === "paid").length);
      setPendingCount(bookingsData.filter(b => b.paymentStatus === "Pending").length);
      setLast7DaysCount(bookingsData.filter(b => dayjs(b.checkInDate).isAfter(dayjs().subtract(7, "day"))).length);
      setLast30DaysCount(bookingsData.filter(b => dayjs(b.checkInDate).isAfter(dayjs().subtract(30, "day"))).length);
      setLast12MonthsCount(bookingsData.filter(b => dayjs(b.checkInDate).isAfter(dayjs().subtract(12, "month"))).length);
    } catch (err) {
      console.error(err);
      setLoadingError("Failed to load reservations. Please try again.");
      setLoadingBookings(false);

      if (!retryTimeoutRef.current) {
        setRetryScheduled(true);
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          fetchBookings();
        }, 5000);
      }
    }
  };

  // ----------------------
  // LOAD PROPERTIES
  // ----------------------
  const loadProperties = async () => {
    try {
      const response = await api.get("/listings");
      const data = asArray<any>(response.data);
      const formatted: Property[] = data.map((item, index) => ({
        id: item.id,
        name: `${item.name} ${item.property?.name || ""}`.trim(),
        image: propertyImages[index % propertyImages.length],
        fullAddress: item.property?.address || "Address not available",
      }));
      setPropertiesList(formatted);
    } catch (err) {
      console.error(err);
      setPropertiesList([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    loadProperties();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // ----------------------
  // STATUS BADGE
  // ----------------------
  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase() ?? "";
    const tone: "success" | "warning" | "error" | "info" =
      normalized === "completed" || normalized === "paid"
        ? "success"
        : normalized === "ongoing"
          ? "success"
          : normalized === "pending"
            ? "warning"
            : normalized === "cancelled"
              ? "error"
              : "info";
    return <span className={`status-badge status-badge--${tone}`}>{status}</span>;
  };

  // ----------------------
  // FILTERED BOOKINGS
  // ----------------------
  const filteredBookings = bookings
    .filter((b) => {
      const searchText = search.toLowerCase();
      const matchesSearch =
        String(b.bookingId ?? "").toLowerCase().includes(searchText) ||
        String(b.guestName ?? "").toLowerCase().includes(searchText);

      const matchesProperty = !selectedProperty || b.propertyName === selectedProperty;
      const matchesSource = !selectedSource || b.source === selectedSource;
      const matchesFrom = !checkinFrom || dayjs(b.checkInDate).isAfter(dayjs(checkinFrom).subtract(1, "day"));
      const matchesTo = !checkinTo || dayjs(b.checkInDate).isBefore(dayjs(checkinTo).add(1, "day"));

      return matchesSearch && matchesProperty && matchesSource && matchesFrom && matchesTo;
    })
    .sort((a, b) => b._checkInDate.getTime() - a._checkInDate.getTime());

  const filteredProperties = propertiesList.filter((p) =>
    p.name.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedBookings = filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ----------------------
  // LEFT MENU COMPONENT
  // ----------------------
  const LeftMenu: React.FC<{ title: string; active?: boolean; color?: string }> = ({ title, active, color }) => {
    const toneMap: Record<string, string> = {
      purple: "var(--color-status-info-text)",
      blue: "var(--color-accent-primary)",
      green: "var(--color-status-success-text)",
      red: "var(--color-status-error-text)",
    };
    const clr = toneMap[color ?? ""] || "var(--color-text-primary)";

    return (
      <Typography
        className={`shell-aside__link ${active ? "is-accent" : ""}`}
        sx={{ color: active ? "var(--color-accent-strong)" : clr }}
      >
        {title}
      </Typography>
    );
  };

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <AdminShellLayout
      title="Reservations"
      rightSlot={
        <Button
          variant="contained"
          sx={{
            backgroundColor: "var(--button-primary-bg)",
            color: "var(--button-primary-text)",
            borderRadius: 2,
            paddingX: 2.5,
            "&:hover": { backgroundColor: "var(--button-primary-strong)" },
          }}
          onClick={() => setOpenManualBookingList(true)}
        >
          Create manual booking
        </Button>
      }
    >
      <div className="ops-grid">
        {/* LEFT PANEL */}
        <aside className="shell-aside">
          <Typography component="h4">General</Typography>
          <LeftMenu title={`All (${allCount})`} active />
          <LeftMenu title={`Arriving Soon (${arrivingSoonCount})`} />
          <LeftMenu title={`Pending Review (${pendingReviewCount})`} />

          <Typography component="h4" sx={{ mt: 3 }}>Today</Typography>
          <LeftMenu title={`Check-in (${checkinCount})`} />
          <LeftMenu title={`Check-out (${checkoutCount})`} />

          <Typography component="h4" sx={{ mt: 3 }}>Others</Typography>
          <LeftMenu title={`Offline Direct Booking (${offlineBookingCount})`} />
          <LeftMenu title={`Booking Leads (${bookingLeadsCount})`} />

          <Typography component="h4" sx={{ mt: 3 }}>Status</Typography>
          <LeftMenu title={`Ongoing (${ongoingCount})`} color="purple" />
          <LeftMenu title={`Upcoming (${upcomingCount})`} color="blue" />
          <LeftMenu title={`Completed (${completedCount})`} color="green" />
          <LeftMenu title={`Pending (${pendingCount})`} color="red" />

          <Typography component="h4" sx={{ mt: 3 }}>Summary</Typography>
          <LeftMenu title={`📅 Last 7 Days (${last7DaysCount})`} />
          <LeftMenu title={`📅 Last 30 Days (${last30DaysCount})`} />
          <LeftMenu title={`📅 Last 12 Months (${last12MonthsCount})`} />
        </aside>

        {/* RIGHT PANEL */}
        <div className="ops-main">
          {/* Filters */}
          <Box className="filters-bar">
            <TextField
              placeholder="Search Booking ID or Guest..."
              size="small"
              sx={{ width: 240 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ width: 180 }}>
              <InputLabel>Property</InputLabel>
              <Select
                label="Property"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {[...new Set(bookings.map((b) => b.propertyName).filter(Boolean))].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="From"
                value={checkinFrom}
                onChange={(val) => setCheckinFrom(val)}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
              />
              <DatePicker
                label="To"
                value={checkinTo}
                onChange={(val) => setCheckinTo(val)}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
              />
            </LocalizationProvider>
          </Box>

          {/* BOOKINGS TABLE */}
          <Box className="table-card" sx={{ position: "relative" }}>
            <div className="section-header">
              <h3>Front office queue</h3>
              <Typography color="text.secondary" fontSize={14}>
                Status clarity for arrivals, stays, and follow-ups
              </Typography>
            </div>
            <TableContainer component={Paper} sx={{ boxShadow: "none", maxHeight: 620 }}>
              <Table stickyHeader className="shell-table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Booking Id</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trip Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check In ➜ Out</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Guest</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBookings.map((row) => (
                    <TableRow
                      key={row.bookingId}
                      hover
                    >
                      <TableCell>{row.bookingId}</TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell>{getStatusBadge(row.paymentStatus)}</TableCell>
                      <TableCell>{row.checkInDate} ➜ {row.checkOutDate}</TableCell>
                      <TableCell>{row.propertyName}</TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>{row.guestName}</Typography>
                        <Typography color="text.secondary" fontSize={13}>{row.mobile}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {!loadingBookings && loadingError && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  p: 2,
                  borderTop: "1px solid var(--color-status-error-border)",
                  backgroundColor: "var(--color-status-error-bg)",
                }}
              >
                <Box>
                  <Typography fontWeight={700} color="error">
                    {loadingError}
                  </Typography>
                  {retryScheduled && (
                    <Typography color="text.secondary" fontSize={13}>
                      Retrying in a few seconds...
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={fetchBookings}
                  sx={{ borderColor: "var(--color-status-error-border)" }}
                >
                  Retry now
                </Button>
              </Box>
            )}

            {loadingBookings && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "var(--color-bg-muted)",
                  opacity: 0.92,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <CircularProgress size={50} sx={{ mb: 2, color: "var(--color-accent-primary)" }} />
                <Typography>{loadingError}</Typography>
              </Box>
            )}
            <div className="table-footer">
              <TablePagination
                component="div"
                count={filteredBookings.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </div>
          </Box>
        </div>
      </div>

      {/* MANUAL BOOKING POPUP */}
      <Dialog open={openManualBookingList} onClose={() => setOpenManualBookingList(false)}>
        <DialogTitle>
          Select Property
          <IconButton
            aria-label="close"
            onClick={() => setOpenManualBookingList(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            placeholder="Search property..."
            fullWidth
            value={propertySearch}
            onChange={(e) => setPropertySearch(e.target.value)}
            sx={{ mb: 2 }}
          />
          <List>
            {filteredProperties.map((p) => (
              <ListItem key={p.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    setSelectedManualProperty(p);
                    setOpenManualBookingList(false);
                    setOpenFullManualBooking(true);
                  }}
                >
                  <ListItemText primary={p.name} secondary={p.fullAddress} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {selectedManualProperty && (
        <ManualBookingPopup
          property={selectedManualProperty}
          open={openFullManualBooking}
          onClose={() => setOpenFullManualBooking(false)}
        />
      )}
    </AdminShellLayout>
  );
};

export default Reservation;
