import React, { useEffect, useState } from "react";
import { api, asArray } from "@/lib/api";
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
  ListItemText,
  IconButton,
  TablePagination,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Search as SearchIcon } from "@mui/icons-material";
import ManualBookingPopup from "./ManualBookingPopup";

const propertyImages = [
  "https://atlashomestorage.blob.core.windows.net/listing-images/101/cover.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/102/img_1.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/201/img_11.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/202/cover.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/301/cover.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/302/cover.jpg",
  "https://atlashomestorage.blob.core.windows.net/listing-images/501/IMG_1.jpg",
];

function Reservation() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [checkinFrom, setCheckinFrom] = useState(null);
  const [checkinTo, setCheckinTo] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [extraInput, setExtraInput] = useState("");
  const [openManualBookingList, setOpenManualBookingList] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");
  const [selectedManualProperty, setSelectedManualProperty] = useState(null);
  const [openFullManualBooking, setOpenFullManualBooking] = useState(false);
  const [propertiesList, setPropertiesList] = useState([]);
  const [loadingError, setLoadingError] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ================================
  // FETCH BOOKINGS
  // ================================
  const fetchBookings = async () => {
    setLoadingBookings(true); // 🔒 LOCK SPINNER
    setLoadingError("");

    try {
      const res = await api.get("/bookings"); // ⏳ WAIT HERE UNTIL API FINISHES

      const bookingsData = asArray(res.data).map((b) => {
        const guestParts = b.guest ? b.guest.trim().split(" ") : [];
        const mobile = guestParts.length > 1 ? guestParts.pop() : "N/A";
        const name = guestParts.length ? guestParts.join(" ") : "N/A";

        return {
          bookingId: b.bookingId || b.id || b.bookingNumber,
          source: b.bookingSource || "N/A",
          guestName: name,
          mobile,
          propertyName: b.listing || b.property?.name || "N/A",
          checkInDate: dayjs(b.checkinDate).format("YYYY-MM-DD"),
          checkOutDate: dayjs(b.checkoutDate).format("YYYY-MM-DD"),
          paymentStatus: b.paymentStatus,
        };
      });

      setBookings(bookingsData);
      setLoadingBookings(false); // ✅ UNLOCK ONLY AFTER SUCCESS
    } catch (err) {
      console.error(err);
      setLoadingError("Please Wait Reservations Loading");
      setBookings([]);
      setLoadingBookings(true); // ❗ KEEP SPINNER ON ERROR
    }
  };

  // ================================
  // LOAD PROPERTIES
  // ================================
  const loadProperties = async () => {
    try {
      const response = await api.get("/listings");
      const data = asArray(response.data);
      const formatted = data.map((item, index) => ({
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
    fetchBookings(); // spinner depends only on bookings
    loadProperties(); // no spinner for properties
  }, []);

  // ================================
  // STATUS BADGE
  // ================================
  const getStatusBadge = (status) => {
    const colors = {
      Upcoming: { bg: "#EAF3FF", text: "#3478F6" },
      Ongoing: { bg: "#F1E8FF", text: "#A149FF" },
      Completed: { bg: "#E6FFEA", text: "#2FA84F" },
      Cancelled: { bg: "#FFECEC", text: "#FF3C3C" },
    };
    const s = colors[status] || colors["Upcoming"];
    return (
      <Chip
        label={status}
        sx={{
          background: s.bg,
          color: s.text,
          fontWeight: 700,
          borderRadius: "8px",
          paddingX: 0.5,
          height: 28,
        }}
      />
    );
  };

  // ================================
  // FILTERS & COUNTS
  // ================================
  const allCount = bookings.length;
  const arrivingSoonCount = bookings.filter((b) =>
    dayjs(b.checkInDate).isAfter(dayjs()) && dayjs(b.checkInDate).isBefore(dayjs().add(3, "day"))
  ).length;
  const pendingReviewCount = bookings.filter((b) => b.paymentStatus === "Pending Review").length;
  const checkinCount = bookings.filter((b) => dayjs(b.checkInDate).isSame(dayjs(), "day")).length;
  const checkoutCount = bookings.filter((b) => dayjs(b.checkOutDate).isSame(dayjs(), "day")).length;
  const offlineBookingCount = bookings.filter((b) => b.source === "Walk-in").length;
  const bookingLeadsCount = bookings.filter((b) => b.source !== "Walk-in").length;
  const completedCount = bookings.filter((b) => b.paymentStatus === "Paid").length;
  const PendingCount = bookings.filter((b) => b.paymentStatus === "Pending").length;
  const ongoingCount = bookings.filter((b) => b.paymentStatus === "Present").length;
  const upcomingCount = bookings.filter((b) => b.paymentStatus === "Future").length;

  const last7DaysCount = bookings.filter((b) => dayjs(b.checkInDate).isAfter(dayjs().subtract(7, "day"))).length;
  const last30DaysCount = bookings.filter((b) => dayjs(b.checkInDate).isAfter(dayjs().subtract(30, "day"))).length;
  const last12MonthsCount = bookings.filter((b) => dayjs(b.checkInDate).isAfter(dayjs().subtract(12, "month"))).length;

  const properties = [...new Set(bookings.map((b) => b.propertyName).filter(Boolean))];
  const sources = [...new Set(bookings.map((b) => b.source).filter(Boolean))];

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.bookingId?.toString().toLowerCase().includes(search.toLowerCase()) ||
      b.guestName?.toLowerCase().includes(search.toLowerCase());
    const matchesProperty = !selectedProperty || b.propertyName === selectedProperty;
    const matchesSource = !selectedSource || b.source === selectedSource;
    const matchesFrom = !checkinFrom || dayjs(b.checkInDate).isAfter(dayjs(checkinFrom).subtract(1, "day"));
    const matchesTo = !checkinTo || dayjs(b.checkInDate).isBefore(dayjs(checkinTo).add(1, "day"));
    return matchesSearch && matchesProperty && matchesSource && matchesFrom && matchesTo;
  });

  const filteredProperties = propertiesList.filter((p) =>
    p.name.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedBookings = filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ================================
  // RENDER
  // ================================
  return (
    <Box sx={{ padding: 3, background: "var(--shell-bg)" }}>
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        {/* LEFT PANEL */}
        <Box
          sx={{
            width: 260,
            background: "#fff",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid #e8e8e8",
            position: "sticky",
            top: 100,
            alignSelf: "flex-start",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1, color: "#475569" }}>General</Typography>
          <LeftMenu title={`All (${allCount})`} active />
          <LeftMenu title={`Arriving Soon (${arrivingSoonCount})`} />
          <LeftMenu title={`Pending Review (${pendingReviewCount})`} />
          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1, color: "#475569" }}>Today</Typography>
          <LeftMenu title={`Check-in (${checkinCount})`} />
          <LeftMenu title={`Check-out (${checkoutCount})`} />
          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1, color: "#475569" }}>Others</Typography>
          <LeftMenu title={`Offline Direct Booking (${offlineBookingCount})`} />
          <LeftMenu title={`Booking Leads (${bookingLeadsCount})`} />
          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1, color: "#475569" }}>Status</Typography>
          <LeftMenu title={`Ongoing (${ongoingCount})`} color="purple" />
          <LeftMenu title={`Upcoming (${upcomingCount})`} color="blue" />
          <LeftMenu title={`Completed (${completedCount})`} color="green" />
          <LeftMenu title={`Pending (${PendingCount})`} color="red" />
          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1, color: "#475569" }}>Summary</Typography>
          <LeftMenu title={`📅 Last 7 Days (${last7DaysCount})`} />
          <LeftMenu title={`📅 Last 30 Days (${last30DaysCount})`} />
          <LeftMenu title={`📅 Last 12 Months (${last12MonthsCount})`} />
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ flexGrow: 1, display: "grid", gap: 2 }}>
          {/* FILTERS */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              background: "#fff",
              borderRadius: 2,
              p: 2,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 2px rgba(15,23,42,0.08)",
            }}
          >
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
            <FormControl size="small" sx={{ width: 140 }}>
              <InputLabel>Source</InputLabel>
              <Select label="Source" value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {sources.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: 200 }}>
              <InputLabel>Property</InputLabel>
              <Select label="Property" value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {properties.map((p) => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
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
            <TextField placeholder="All" size="small" value={extraInput} onChange={(e) => setExtraInput(e.target.value)} sx={{ width: 80 }} />
            <Button
              variant="contained"
              sx={{ ml: "auto", bgcolor: "#FF3C2F", width: 240, "&:hover": { bgcolor: "#d53024" } }}
              onClick={() => setOpenManualBookingList(true)}
            >
              CREATE MANUAL BOOKING
            </Button>
          </Box>

          {/* BOOKINGS TABLE */}
          <Box sx={{ position: "relative", background: "#fff", borderRadius: 2, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: "#f8fafc" }}>
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
                      sx={{ "&:hover": { background: "#f8fafc" } }}
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

            {/* LOADING OVERLAY ONLY FOR BOOKINGS */}
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
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333" }}>
                  {loadingError || "Please Wait Reservations Loading..."}
                </Typography>
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
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ mt: 1, background: "#fff", borderRadius: 1 }}
          />
        </Box>
      </Box>

      {/* MANUAL BOOKING DIALOG */}
      <Dialog
        open={openManualBookingList}
        onClose={() => setOpenManualBookingList(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            margin: "auto",
            width: "400px",
            maxHeight: "90%",
            top: "50%",
            transform: "translateY(-50%)",
          },
        }}
      >
        <DialogTitle>
          Create Manual Booking
          <IconButton aria-label="close" onClick={() => setOpenManualBookingList(false)} style={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by Property Id, Name"
            value={propertySearch}
            onChange={(e) => setPropertySearch(e.target.value)}
            style={{ marginBottom: "16px" }}
          />
          <List>
            {filteredProperties.map((property) => (
              <ListItem
                key={property.id}
                button
                onClick={() => {
                  setSelectedManualProperty(property);
                  setOpenFullManualBooking(true);
                  setOpenManualBookingList(false);
                }}
              >
                <Box
                  component="img"
                  src={property.image}
                  alt={property.name}
                  sx={{ width: 60, height: 60, borderRadius: 2, objectFit: "cover", mr: 2 }}
                />
                <ListItemText primary={property.name} secondary={property.fullAddress} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      {/* FULL MANUAL BOOKING POPUP */}
      {selectedManualProperty && (
        <ManualBookingPopup
          open={openFullManualBooking}
          onClose={() => setOpenFullManualBooking(false)}
          property={selectedManualProperty}
        />
      )}
    </Box>
  );
}

// LEFT MENU COMPONENT
const LeftMenu = ({ title, active, color }) => {
  let clr = "#0f172a";
  if (color === "purple") clr = "#A149FF";

  if (color === "blue") clr = "#3478F6";
  if (color === "green") clr = "#2FA84F";
  if (color === "red") clr = "#FF3C3C";

  return (
    <Typography
      sx={{
        ml: 1,
        fontSize: 14,
        padding: "6px 10px",
        cursor: "pointer",
        fontWeight: active ? 700 : 500,
        color: active ? "#e63e3e" : clr,
        borderRadius: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: active ? "#fff1f2" : "transparent",
      }}
    >
      <span>{title}</span>
    </Typography>
  );
};

export default Reservation;
