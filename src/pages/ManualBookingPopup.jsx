import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { api } from "@/lib/api";

const normalizePhone = (phone) => {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/\s+/g, "").replace(/^\+/, "");
};

const ManualBookingPopup = ({ open, onClose, onSuccess, property }) => {
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  const findOrCreateGuest = async () => {
    const phoneNorm = normalizePhone(guestDetails.phone);
    if (!phoneNorm) throw new Error("Phone is required");
    const { data } = await api.get("/guests");
    const guests = Array.isArray(data) ? data : data?.guests ?? [];
    const match = guests.find((g) => normalizePhone(g.phone || "") === phoneNorm);
    if (match) return match.id;
    const { data: created } = await api.post("/guests", {
      name: guestDetails.fullName.trim(),
      phone: guestDetails.phone.trim(),
      email: guestDetails.email.trim(),
      idProofUrl: "N/A",
    });
    return created.id;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!guestDetails.fullName?.trim()) {
      setSubmitError("Full name is required.");
      return;
    }
    if (!guestDetails.email?.trim()) {
      setSubmitError("Email is required.");
      return;
    }
    if (!guestDetails.phone?.trim()) {
      setSubmitError("Phone is required.");
      return;
    }
    if (!stayDetails.checkIn || !stayDetails.checkOut) {
      setSubmitError("Check-in and check-out dates are required.");
      return;
    }
    if (!amountDetails.total || parseFloat(amountDetails.total) <= 0) {
      setSubmitError("Total amount is required.");
      return;
    }
    if (!amountDetails.advance || parseFloat(amountDetails.advance) < 0) {
      setSubmitError("Advance amount is required.");
      return;
    }
    if (!property?.id) {
      setSubmitError("Property/listing is required.");
      return;
    }

    setSubmitting(true);
    try {
      const guestId = await findOrCreateGuest();
      const totalAmount = parseFloat(amountDetails.total);
      const amountReceived = parseFloat(amountDetails.advance);
      const payload = {
        listingId: Number(property.id),
        guestId,
        checkinDate: stayDetails.checkIn,
        checkoutDate: stayDetails.checkOut,
        bookingSource: "Walk-in",
        bookingStatus: "Confirmed",
        totalAmount,
        amountReceived,
        currency: "INR",
        guestsPlanned: Number(stayDetails.guests) || 1,
        guestsActual: Number(stayDetails.guests) || 1,
        extraGuestCharge: 0,
        commissionAmount: 0,
        notes: internalNotes?.trim() || "",
        paymentStatus: amountReceived >= totalAmount ? "Paid" : "Pending",
      };
      await api.post("/bookings", payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      const d = err?.response?.data;
      let msg = "Failed to create booking.";
      if (d) {
        if (typeof d === "string") msg = d;
        else if (d.errors && typeof d.errors === "object") {
          const parts = Object.entries(d.errors).flatMap(([k, v]) =>
            Array.isArray(v) ? v.map((m) => `${k}: ${m}`) : [`${k}: ${v}`]
          );
          msg = parts.join(" ") || d.title || msg;
        } else if (d.message) msg = d.message;
        else if (d.title) msg = d.title;
      } else if (err?.message) msg = err.message;
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          maxHeight: "90%",
          margin: "auto",
          top: "50%",
          transform: "translateY(-50%)",
        },
      }}
    >
      <DialogTitle>
        Create Manual Booking
        <IconButton
          aria-label="close"
          onClick={onClose}
          style={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {/* Property Info */}
        {property && (
          <Box display="flex" alignItems="center" mb={2}>
            <img
  src={property.image}
  alt={property.name}
  style={{
    width: '105px',
    height: '105px',
    objectFit: 'cover',
    marginRight: 10,
    borderRadius: 2,
  }}
/>

            <Box>
              <Typography variant="subtitle1">{property.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {property.city || property.fullAddress || ""}
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

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSubmitError("")}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? "Creating…" : "Create Booking"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ManualBookingPopup;
