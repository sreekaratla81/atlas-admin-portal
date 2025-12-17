import React, { useEffect, useState } from "react";
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
  'https://atlashomestorage.blob.core.windows.net/listing-images/101/cover.jpg',
  'https://atlashomestorage.blob.core.windows.net/listing-images/102/img_1.jpg',
  'https://atlashomestorage.blob.core.windows.net/listing-images/201/img_11.jpg',
  'https://atlashomestorage.blob.core.windows.net/listing-images/202/cover.jpg',
  'https://atlashomestorage.blob.core.windows.net/listing-images/301/cover.jpg',
  'https://atlashomestorage.blob.core.windows.net/listing-images/302/cover.jpg',
  'https://atlashomestorage.blob.core.windows.net/listing-images/501/IMG_1.jpg'
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
    setLoadingBookings(true);
    setLoadingError("");
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
      setLoadingError("Please wait reservations loading...");
      setBookings([]);
      setLoadingBookings(true);
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
  }, []);

  // ----------------------
  // STATUS BADGE
  // ----------------------
  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      Upcoming: { bg: "#EAF3FF", text: "#3478F6" },
      Ongoing: { bg: "#F1E8FF", text: "#A149FF" },
      Completed: { bg: "#E6FFEA", text: "#2FA84F" },
      Cancelled: { bg: "#FFECEC", text: "#FF3C3C" },
      Pending: { bg: "#FFF3E0", text: "#FF9800" },
    };
    const s = colors[status] || colors["Upcoming"];
    return (
      <span
        style={{
          background: s.bg,
          color: s.text,
          padding: "4px 10px",
          borderRadius: "8px",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
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
    let clr = "#000";
    if (color === "purple") clr = "#A149FF";
    if (color === "blue") clr = "#3478F6";
    if (color === "green") clr = "#2FA84F";
    if (color === "red") clr = "#FF3C3C";

    return (
      <Typography
        sx={{
          ml: 2,
          fontSize: 14,
          padding: "4px 0",
          cursor: "pointer",
          fontWeight: active ? 700 : 400,
          color: active ? "#e63e3e" : clr,
        }}
      >
        {title}
      </Typography>
    );
  };

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <Box sx={{ padding: 3, background: "#fafafa" }}>
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* LEFT PANEL */}
        <Box sx={{ width: 260, background: "#fff", borderRadius: "10px", padding: "15px", border: "1px solid #e8e8e8", height: "fit-content" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>General</Typography>
          <LeftMenu title={`All (${allCount})`} active />
          <LeftMenu title={`Arriving Soon (${arrivingSoonCount})`} />
          <LeftMenu title={`Pending Review (${pendingReviewCount})`} />

          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1 }}>Today</Typography>
          <LeftMenu title={`Check-in (${checkinCount})`} />
          <LeftMenu title={`Check-out (${checkoutCount})`} />

          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1 }}>Others</Typography>
          <LeftMenu title={`Offline Direct Booking (${offlineBookingCount})`} />
          <LeftMenu title={`Booking Leads (${bookingLeadsCount})`} />

          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1 }}>Status</Typography>
          <LeftMenu title={`Ongoing (${ongoingCount})`} color="purple" />
          <LeftMenu title={`Upcoming (${upcomingCount})`} color="blue" />
          <LeftMenu title={`Completed (${completedCount})`} color="green" />
          <LeftMenu title={`Pending (${pendingCount})`} color="red" />

          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1 }}>Summary</Typography>
          <LeftMenu title={`📅 Last 7 Days (${last7DaysCount})`} />
          <LeftMenu title={`📅 Last 30 Days (${last30DaysCount})`} />
          <LeftMenu title={`📅 Last 12 Months (${last12MonthsCount})`} />
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search Booking ID or Guest..."
              size="small"
              sx={{ width: 220 }}
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
                slotProps={{ textField: { size: "small", sx: { width: 140 } } }}
              />
              <DatePicker
                label="To"
                value={checkinTo}
                onChange={(val) => setCheckinTo(val)}
                slotProps={{ textField: { size: "small", sx: { width: 140 } } }}
              />
            </LocalizationProvider>

            <Button
              variant="contained"
              sx={{ ml: "auto", bgcolor: "#FF3C2F", width: 220, "&:hover": { bgcolor: "#d53024" } }}
              onClick={() => setOpenManualBookingList(true)}
            >
              Create Manual Booking
            </Button>
          </Box>

          {/* BOOKINGS TABLE */}
          <Box sx={{ position: "relative" }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking Id</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Trip Status</TableCell>
                    <TableCell>Check In ➜ Out</TableCell>
                    <TableCell>Property</TableCell>
                    <TableCell>Guest</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBookings.map((row) => (
                    <TableRow key={row.bookingId}>
                      <TableCell>{row.bookingId}</TableCell>
                      <TableCell>{row.source}</TableCell>
                      <TableCell>{getStatusBadge(row.paymentStatus)}</TableCell>
                      <TableCell>{row.checkInDate} ➜ {row.checkOutDate}</TableCell>
                      <TableCell>{row.propertyName}</TableCell>
                      <TableCell>{row.guestName}<br />{row.mobile}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {loadingBookings && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(255,255,255,0.7)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <CircularProgress size={50} sx={{ mb: 2, color: "#FF3C2F" }} />
                <Typography>{loadingError}</Typography>
              </Box>
            )}
          </Box>

          <TablePagination
            component="div"
            count={filteredBookings.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Box>
      </Box>

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
    </Box>
  );
};

export default Reservation;
