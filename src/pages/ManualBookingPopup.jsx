import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ManualBookingPopup = ({ open, onClose, property }) => {
  const [guestDetails, setGuestDetails] = useState({
    fullName: "",
    email: "",
    phone: "+91",
    hasGST: false,
    gstNumber: "",
    gstTradeName: "",
  });

  const [stayDetails, setStayDetails] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const [amountDetails, setAmountDetails] = useState({
    total: "",
    advance: "",
    balance: "",
  });

  const [internalNotes, setInternalNotes] = useState("");

  const handleGuestChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGuestDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStayChange = (e) => {
    const { name, value } = e.target;
    setStayDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmountChange = (e) => {
    const { name, value } = e.target;
    setAmountDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const bookingData = {
      property,
      guestDetails,
      stayDetails,
      amountDetails,
      internalNotes,
    };
    console.log("Booking Data:", bookingData);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 450, height: "100%" } }}
    >
      <Box
        sx={{
          height: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          p: 3,
        }}
      >
        {/* Header with title and close button */}
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
            Create Manual Booking
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Property Info */}
        {property && (
          <Box display="flex" alignItems="center" mb={2}>
            <img
              src={property.image}
              alt={property.name}
              style={{ marginRight: 10, borderRadius: 4 }}
            />
            <Box>
              <Typography variant="subtitle1">{property.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {property.city}
              </Typography>
            </Box>
            <Button size="small" sx={{ ml: "auto" }}>
              Change
            </Button>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Guest Details */}
        <Typography variant="subtitle1">Guest Details</Typography>
        <TextField
          label="Full Name"
          name="fullName"
          fullWidth
          required
          margin="dense"
          value={guestDetails.fullName}
          onChange={handleGuestChange}
        />
        <Box display="flex" gap={1} mb={1}>
          <TextField
            label="Email"
            name="email"
            fullWidth
            required
            margin="dense"
            value={guestDetails.email}
            onChange={handleGuestChange}
          />
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            required
            margin="dense"
            value={guestDetails.phone}
            onChange={handleGuestChange}
          />
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              name="hasGST"
              checked={guestDetails.hasGST}
              onChange={handleGuestChange}
            />
          }
          label="Guest Have GST Details?"
          sx={{ mb: 2 }}
        />

        {/* Conditionally render GST fields */}
        {guestDetails.hasGST && (
          <Box display="flex" gap={1} mb={2}>
            <TextField
              label="GST Number"
              name="gstNumber"
              fullWidth
              value={guestDetails.gstNumber}
              onChange={handleGuestChange}
            />
            <TextField
              label="GST Trade Name"
              name="gstTradeName"
              fullWidth
              value={guestDetails.gstTradeName}
              onChange={handleGuestChange}
            />
          </Box>
        )}

        {/* Stay Details */}
        <Typography variant="subtitle1" mt={2}>
          Stay Details
        </Typography>
        <Box display="flex" gap={1} mb={1}>
          <TextField
            label="Check In Date"
            name="checkIn"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={stayDetails.checkIn}
            onChange={handleStayChange}
          />
          <TextField
            label="Check Out Date"
            name="checkOut"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={stayDetails.checkOut}
            onChange={handleStayChange}
          />
        </Box>
        <TextField
          label="Guests"
          name="guests"
          type="number"
          fullWidth
          value={stayDetails.guests}
          onChange={handleStayChange}
          sx={{ mb: 2 }}
        />

        {/* Amount Details */}
        <Typography variant="subtitle1" mt={2}>
          Amount Details
        </Typography>
        <Box display="flex" gap={1} mb={2}>
          <TextField
            label="Total Amount"
            name="total"
            fullWidth
            required
            value={amountDetails.total}
            onChange={handleAmountChange}
          />
          <TextField
            label="Advance Amount"
            name="advance"
            fullWidth
            required
            value={amountDetails.advance}
            onChange={handleAmountChange}
          />
          <TextField
            label="Balance Amount"
            name="balance"
            fullWidth
            value={amountDetails.balance}
            onChange={handleAmountChange}
          />
        </Box>

        {/* Internal Notes */}
        <TextField
          label="Internal Notes (only Homeyhuts)"
          multiline
          rows={3}
          fullWidth
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Submit Button fixed at bottom with small gap */}
        <Box sx={{ mt: "auto" }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
          >
            Create Booking
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ManualBookingPopup;
