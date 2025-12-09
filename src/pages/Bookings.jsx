import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
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
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import ManualBookingPopup from "./ManualBookingPopup"; // import your drawer popup

function Booking() {
  const API_URL = import.meta.env.VITE_API_BASE;

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [checkinFrom, setCheckinFrom] = useState(null);
  const [checkinTo, setCheckinTo] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [extraInput, setExtraInput] = useState("");
  const [openManualBookingList, setOpenManualBookingList] = useState(false);
  const [propertySearch, setPropertySearch] = useState("");

  // For full manual booking popup
  const [selectedManualProperty, setSelectedManualProperty] = useState(null);
  const [openFullManualBooking, setOpenFullManualBooking] = useState(false);

  // Sample property list
  const propertiesList = [
    { id: 501, name: "Atlas Homes – 1BHK 5th Floor Penthouse near Hitech City, Hyderabad", city: "Hyderabad", image: "https://via.placeholder.com/50" },
    { id: 302, name: "Atlas Homes – 1BHK 3F 302 near Hitech City, Hyderabad", city: "Hyderabad", image: "https://via.placeholder.com/50" },
    { id: 301, name: "Atlas Homes – 1BHK 3F 301 near Hitech City, Hyderabad", city: "Hyderabad", image: "https://via.placeholder.com/50" },
    { id: 202, name: "Atlas Homes – 1BHK 2F 202 near Hitech City, Hyderabad", city: "Hyderabad", image: "https://via.placeholder.com/50" },
    { id: 201, name: "Atlas Homes – 1BHK 2F 201 near Hitech City, Hyderabad", city: "Hyderabad", image: "https://via.placeholder.com/50" },
    { id: 102, name: "Atlas Homes – 1BHK 1F 102 near Hitech City, Hyderabad", city: "Hyderabad", image: "https://via.placeholder.com/50" },
    { id: 101, name: "Atlas Homes – 1BHK 1F 101 near Hitech City, Hyderabad", city: "Hyderabad", image: "https://via.placeholder.com/50" },
  ];

  // Fetch bookings
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/Bookings/GetAllBookings`);
      setBookings(res.data ?? []);
    } catch (e) {
      console.error("Error fetching data:", e.response || e.message);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Status badge helper
  const getStatusBadge = (status) => {
    const colors = {
      Upcoming: { bg: "#EAF3FF", text: "#3478F6" },
      Ongoing: { bg: "#F1E8FF", text: "#A149FF" },
      Completed: { bg: "#E6FFEA", text: "#2FA84F" },
      Cancelled: { bg: "#FFECEC", text: "#FF3C3C" },
    };
    const current = colors[status] ?? colors["Upcoming"];
    return (
      <span
        style={{
          backgroundColor: current.bg,
          color: current.text,
          padding: "4px 10px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  };

  // Counts
  const allCount = bookings.length;
  const arrivingSoonCount = bookings.filter(b => dayjs(b.checkInDate).isAfter(dayjs()) && dayjs(b.checkInDate).isBefore(dayjs().add(3, "day"))).length;
  const pendingReviewCount = bookings.filter(b => b.paymentStatus === "Pending Review").length;
  const checkinCount = bookings.filter(b => dayjs(b.checkInDate).isSame(dayjs(), "day")).length;
  const checkoutCount = bookings.filter(b => dayjs(b.checkOutDate).isSame(dayjs(), "day")).length;
  const offlineBookingCount = bookings.filter(b => b.source === "Offline").length;
  const bookingLeadsCount = bookings.filter(b => b.source === "Lead").length;
  const ongoingCount = bookings.filter(b => b.paymentStatus === "Ongoing").length;
  const upcomingCount = bookings.filter(b => b.paymentStatus === "Upcoming").length;
  const completedCount = bookings.filter(b => b.paymentStatus === "Completed").length;
  const cancelledCount = bookings.filter(b => b.paymentStatus === "Cancelled").length;

  const last7DaysCount = bookings.filter(b => dayjs(b.checkInDate).isAfter(dayjs().subtract(7, "day"))).length;
  const last30DaysCount = bookings.filter(b => dayjs(b.checkInDate).isAfter(dayjs().subtract(30, "day"))).length;
  const last12MonthsCount = bookings.filter(b => dayjs(b.checkInDate).isAfter(dayjs().subtract(12, "month"))).length;

  const properties = [...new Set(bookings.map(b => b.propertyName))];
  const sources = [...new Set(bookings.map(b => b.source))];

  const filteredBookings = bookings.filter(
    (b) =>
      (!search ||
        b.bookingId?.toString().toLowerCase().includes(search.toLowerCase()) ||
        b.guestName?.toLowerCase().includes(search.toLowerCase())) &&
      (!checkinFrom || dayjs(b.checkInDate).isAfter(dayjs(checkinFrom).subtract(1, "day"))) &&
      (!checkinTo || dayjs(b.checkInDate).isBefore(dayjs(checkinTo).add(1, "day"))) &&
      (!selectedProperty || b.propertyName === selectedProperty) &&
      (!selectedSource || b.source === selectedSource)
  );

  // Filtered properties for Manual Booking popup
  const filteredProperties = propertiesList.filter(p =>
    p.name.toLowerCase().includes(propertySearch.toLowerCase())
  );

  return (
    <Box sx={{ padding: 3, background: "#fafafa" }}>
      <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 3 }}>Bookings</Typography>

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
          <LeftMenu title={`Cancelled (${cancelledCount})`} color="red" />

          <Typography sx={{ fontWeight: 700, fontSize: 14, mt: 3, mb: 1 }}>Summary</Typography>
          <LeftMenu title={`📅 Last 7 Days (${last7DaysCount})`} />
          <LeftMenu title={`📅 Last 30 Days (${last30DaysCount})`} />
          <LeftMenu title={`📅 Last 12 Months (${last12MonthsCount})`} />
        </Box>

        {/* RIGHT PANEL */}
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
            <TextField placeholder="Search Booking ID or Guest..." size="small" sx={{ width: 120 }} value={search} onChange={(e) => setSearch(e.target.value)} />

            <FormControl size="small" sx={{ width: 90 }}>
              <InputLabel>Source</InputLabel>
              <Select label="Source" value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {sources.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ width: 100 }}>
              <InputLabel>Property</InputLabel>
              <Select label="Property" value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {properties.map((p) => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Check-in & Check-out"
                value={checkinFrom}
                onChange={(val) => { setCheckinFrom(val); setCheckinTo(val); }}
                slotProps={{ textField: { size: "small", sx: { width: "20%" }, placeholder: "Select Date Range" } }}
              />
            </LocalizationProvider>

            <TextField placeholder="All" size="small" value={extraInput} onChange={(e) => setExtraInput(e.target.value)} sx={{ width: 70 }} />

            <Button variant="contained" sx={{ ml: "auto", bgcolor: "#FF3C2F", width: 220, "&:hover": { bgcolor: "#d53024" } }} onClick={() => setOpenManualBookingList(true)}>
              Create Manual Booking
            </Button>
          </Box>

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
                {filteredBookings.map((row) => (
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
        </Box>
      </Box>

      {/* MANUAL BOOKING PROPERTY LIST DIALOG */}
      <Dialog open={openManualBookingList} onClose={() => setOpenManualBookingList(false)} fullWidth maxWidth="sm" PaperProps={{ style: { position: "fixed", right: 0, margin: 0, width: "400px", maxHeight: "100%" } }}>
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
                  setOpenManualBookingList(false); // close property list dialog
                }}
              >
                <ListItemAvatar>
                  <Avatar src={property.image} variant="square" />
                </ListItemAvatar>
                <ListItemText primary={property.name} secondary={property.city + ` #${property.id}`} />
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

// Left Menu Component
const LeftMenu = ({ title, active, color }) => {
  let clr = "#000";
  if (color === "purple") clr = "#A149FF";
  if (color === "blue") clr = "#3478F6";
  if (color === "green") clr = "#2FA84F";
  if (color === "red") clr = "#FF3C3C";

  return (
    <Typography sx={{ ml: 2, fontSize: 14, padding: "4px 0", cursor: "pointer", fontWeight: active ? 700 : 400, color: active ? "#e63e3e" : clr }}>
      {title}
    </Typography>
  );
};

export default Booking;
