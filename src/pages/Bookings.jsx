import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, CircularProgress, FormControl, InputLabel, MenuItem,
  Select, TextField, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Card, CardContent, TablePagination, Alert
} from '@mui/material';
import '../style.css';

const Bookings = () => {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [guest, setGuest] = useState({ name: '', phone: '', email: '', idProofUrl: '' });
  const today = new Date().toISOString().slice(0, 10);
  const [booking, setBooking] = useState({
    id: null,
    listingId: '',
    checkinDate: '',
    checkoutDate: '',
    plannedCheckinTime: '',
    actualCheckinTime: '',
    plannedCheckoutTime: '',
    actualCheckoutTime: '',
    bookingSource: 'Walk-in',
    paymentStatus: 'unpaid',
    amountReceived: 0,
    notes: '',
    createdAt: today,      // Default to today
    paymentDate: today     // Default to today
  });
  const [formMode, setFormMode] = useState('create');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [filters, setFilters] = useState({
    listing: '',
    guest: '',
    paymentStatus: '',
  });
  const [sortField, setSortField] = useState('checkinDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const messageRef = useRef(null);
 const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data

  const timeOptions = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00"
  ];

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE}/listings`).then(res => setListings(res.data));
    axios.get(`${import.meta.env.VITE_API_BASE}/bookings`).then(res => {
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.checkinDate) - new Date(a.checkinDate)
      );
      setBookings(sorted);
    });
    axios.get(`${import.meta.env.VITE_API_BASE}/guests`).then(res => setGuests(res.data));
  }, []);

  useEffect(() => {
    if (successMsg || errorMsg) {
      messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [successMsg, errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const reset = () => {
    setGuest({ name: '', phone: '', email: '', idProofUrl: '' });
    setSelectedGuestId('');
    setFormMode('create');
    setSelectedBookingId(null);
    setBooking({
      id: null,
      listingId: '',
      checkinDate: '',
      checkoutDate: '',
      plannedCheckinTime: '',
      actualCheckinTime: '',
      plannedCheckoutTime: '',
      actualCheckoutTime: '',
      bookingSource: 'Walk-in',
      paymentStatus: 'unpaid',
      amountReceived: 0,
      notes: '',
      createdAt: today,
      paymentDate: today
    });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const submit = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      let guestId = selectedGuestId;
      if (guestId === '') {
        // Create new guest
        const guestRes = await axios.post(`${import.meta.env.VITE_API_BASE}/guests`, guest);
        guestId = guestRes.data.id;
      }
      // Always ensure guestId is a number
      guestId = Number(guestId);

      let payload = {
        ...booking,
        guestId,
        listingId: parseInt(booking.listingId),
        amountReceived: parseFloat(booking.amountReceived),
        createdAt: booking.createdAt,
        paymentDate: booking.paymentDate
      };
      if (formMode === 'edit' && selectedBookingId) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE}/bookings/${selectedBookingId}`,
          payload
        );
        setSuccessMsg('Booking updated successfully!');
      } else {
        const { id, ...createPayload } = payload;
        await axios.post(`${import.meta.env.VITE_API_BASE}/bookings`, createPayload);
        setSuccessMsg('Booking created successfully!');
      }
      reset();
      const updated = await axios.get(`${import.meta.env.VITE_API_BASE}/bookings`);
      const sorted = [...updated.data].sort(
        (a, b) => new Date(b.checkinDate) - new Date(a.checkinDate)
      );
      setBookings(sorted);
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || err.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bookingToEdit) => {
    setFormMode('edit');
    setSelectedBookingId(bookingToEdit.id);
    setBooking({
      id: bookingToEdit.id,
      listingId: bookingToEdit.listingId || '',
      // Support both camelCase variations returned from the API
      checkinDate: bookingToEdit.checkinDate || bookingToEdit.checkInDate || '',
      checkoutDate:
        bookingToEdit.checkoutDate || bookingToEdit.checkOutDate || '',
      plannedCheckinTime:
        bookingToEdit.plannedCheckinTime ||
        bookingToEdit.plannedInTime ||
        '',
      actualCheckinTime:
        bookingToEdit.actualCheckinTime ||
        bookingToEdit.actualInTime ||
        '',
      plannedCheckoutTime:
        bookingToEdit.plannedCheckoutTime ||
        bookingToEdit.plannedOutTime ||
        '',
      actualCheckoutTime:
        bookingToEdit.actualCheckoutTime ||
        bookingToEdit.actualOutTime ||
        '',
      bookingSource: bookingToEdit.bookingSource || 'Walk-in',
      paymentStatus: bookingToEdit.paymentStatus || 'unpaid',
      amountReceived: bookingToEdit.amountReceived ?? 0,
      notes: bookingToEdit.notes || '',
      createdAt: bookingToEdit.createdAt || today,
      paymentDate: bookingToEdit.paymentDate || today
    });
    setSelectedGuestId(bookingToEdit.guestId.toString());
    const guestObj = guests.find(g => g.id === bookingToEdit.guestId) || { name: '', phone: '', email: '', idProofUrl: '' };
    setGuest(guestObj);
    setSuccessMsg('');
  };

  // Filtering logic
  const filteredBookings = bookings.filter(b => {
    const guestObj = guests.find(g => g.id === b.guestId) || {};
    const listingObj = listings.find(l => l.id === b.listingId) || {};
    return (
      (!filters.listing || listingObj.name?.toLowerCase().includes(filters.listing.toLowerCase())) &&
      (!filters.guest || guestObj.name?.toLowerCase().includes(filters.guest.toLowerCase())) &&
      (!filters.paymentStatus || b.paymentStatus === filters.paymentStatus)
    );
  });

  // Sorting logic
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (!sortField) return 0;
    let aValue, bValue;
    if (sortField === 'checkinDate') {
      aValue = a.checkinDate;
      bValue = b.checkinDate;
    } else if (sortField === 'amountReceived') {
      aValue = a.amountReceived;
      bValue = b.amountReceived;
    } else if (sortField === 'createdAt') {
      aValue = a.createdAt;
      bValue = b.createdAt;
    } else if (sortField === 'paymentDate') {
      aValue = a.paymentDate;
      bValue = b.paymentDate;
    } else {
      return 0;
    }
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
    const paginatedBookings = sortedBookings.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Card sx={{ mx: 'auto', mt: 2, mb: 2, bgcolor: formMode === 'edit' ? '#fffbe6' : 'inherit' }}>
        <CardContent>
          <Typography variant="h4" component="h2" gutterBottom>
            {formMode === 'edit' ? 'Edit Booking' : 'Create Booking'}
          </Typography>
          {formMode === 'edit' && (
            <Typography variant="subtitle2" color="secondary" gutterBottom>
              Edit Mode
            </Typography>
          )}

          <Box ref={messageRef} sx={{ mb: 2 }}>
            {successMsg && (
              <Alert severity="success" sx={{ mb: 1 }}>
                {successMsg}
              </Alert>
            )}
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {errorMsg}
              </Alert>
            )}
          </Box>
          <form
            onSubmit={e => {
              e.preventDefault();
              submit();
            }}
            autoComplete="off"
          >
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              '& > *': {
                flex: '1 1 calc(33.333% - 16px)',
                minWidth: '280px'
              }
            }}>

              {/* Listing */}
              <FormControl required>
                <InputLabel>Listing</InputLabel>
                <Select
                  value={booking.listingId}
                  onChange={e => setBooking({ ...booking, listingId: e.target.value })}
                  label="Listing"
                >
                  <MenuItem value="">Select Listing</MenuItem>
                  {listings.map(l => (
                    <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Guest */}
              <FormControl>
                <InputLabel>Guest</InputLabel>
                <Select
                  value={selectedGuestId}
                  onChange={e => setSelectedGuestId(e.target.value)}
                  disabled={formMode === 'edit'}
                  label="Guest"
                >
                  <MenuItem value="">New Guest</MenuItem>
                  {guests.map(g => (
                    <MenuItem key={g.id} value={g.id}>
                      {g.name} ({g.phone})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Check-in Date */}
              <TextField
                label="Check-in Date"
                type="date"
                value={booking.checkinDate}
                onChange={e => setBooking({ ...booking, checkinDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              {/* Guest Name - only show if no guest selected */}
              {!selectedGuestId && (
                <TextField
                  label="Guest Name"
                  placeholder="Guest Name"
                  value={guest.name}
                  onChange={e => setGuest({ ...guest, name: e.target.value })}
                  disabled={!!selectedGuestId || formMode === 'edit'}
                />
              )}

              {/* Phone - only show if no guest selected */}
              {!selectedGuestId && (
                <TextField
                  label="Phone"
                  placeholder="Phone"
                  value={guest.phone}
                  onChange={e => setGuest({ ...guest, phone: e.target.value })}
                  disabled={!!selectedGuestId || formMode === 'edit'}
                  inputProps={{
                    pattern: "^[0-9+\\-\\s]{7,15}$",
                    title: "Enter a valid phone number"
                  }}
                />
              )}

              {/* Check-out Date */}
              <TextField
                label="Check-out Date"
                type="date"
                value={booking.checkoutDate}
                onChange={e => setBooking({ ...booking, checkoutDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              {/* Email - only show if no guest selected */}
              {!selectedGuestId && (
                <TextField
                  label="Email"
                  placeholder="Email"
                  type="email"
                  value={guest.email}
                  onChange={e => setGuest({ ...guest, email: e.target.value })}
                  disabled={!!selectedGuestId || formMode === 'edit'}
                  inputProps={{
                    title: "Enter a valid email address"
                  }}
                />
              )}

              {/* ID Proof URL - only show if no guest selected */}
              {!selectedGuestId && (
                <TextField
                  label="ID Proof URL"
                  placeholder="ID Proof URL"
                  value={guest.idProofUrl}
                  onChange={e => setGuest({ ...guest, idProofUrl: e.target.value })}
                  disabled={!!selectedGuestId || formMode === 'edit'}
                />
              )}

              {/* Planned In Time */}
              <FormControl>
                <InputLabel>Planned In Time</InputLabel>
                <Select
                  value={booking.plannedCheckinTime}
                  onChange={e => setBooking({ ...booking, plannedCheckinTime: e.target.value })}
                  label="Planned In Time"
                >
                  <MenuItem value="">Planned In Time</MenuItem>
                  {timeOptions.map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Actual In Time */}
              <FormControl>
                <InputLabel>Actual In Time</InputLabel>
                <Select
                  value={booking.actualCheckinTime}
                  onChange={e => setBooking({ ...booking, actualCheckinTime: e.target.value })}
                  label="Actual In Time"
                >
                  <MenuItem value="">Actual In Time</MenuItem>
                  {timeOptions.map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Planned Out Time */}
              <FormControl>
                <InputLabel>Planned Out Time</InputLabel>
                <Select
                  value={booking.plannedCheckoutTime}
                  onChange={e => setBooking({ ...booking, plannedCheckoutTime: e.target.value })}
                  label="Planned Out Time"
                >
                  <MenuItem value="">Planned Out Time</MenuItem>
                  {timeOptions.map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Actual Out Time */}
              <FormControl>
                <InputLabel>Actual Out Time</InputLabel>
                <Select
                  value={booking.actualCheckoutTime}
                  onChange={e => setBooking({ ...booking, actualCheckoutTime: e.target.value })}
                  label="Actual Out Time"
                >
                  <MenuItem value="">Actual Out Time</MenuItem>
                  {timeOptions.map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Booking Source */}
              <FormControl required>
                <InputLabel>Booking Source</InputLabel>
                <Select
                  value={booking.bookingSource}
                  onChange={e => setBooking({ ...booking, bookingSource: e.target.value })}
                  label="Booking Source"
                >
                  <MenuItem value="Walk-in">Walk-in</MenuItem>
                  <MenuItem value="airbnb">Airbnb</MenuItem>
                  <MenuItem value="agoda">Agoda</MenuItem>
                  <MenuItem value="booking.com">Booking.com</MenuItem>
                  <MenuItem value="Atlas Website">Atlas Website</MenuItem>
                  <MenuItem value="Agent">Agent</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>

              {/* Payment Status */}
              <FormControl required>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={booking.paymentStatus}
                  onChange={e => setBooking({ ...booking, paymentStatus: e.target.value })}
                  label="Payment Status"
                >
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                </Select>
              </FormControl>

              {/* Amount Received */}
              <TextField
                label="Amount Received"
                type="number"
                placeholder="Amount Received"
                value={booking.amountReceived}
                onChange={e => setBooking({ ...booking, amountReceived: e.target.value })}
                inputProps={{
                  min: 0,
                  step: "0.01"
                }}
              />

              {/* Notes */}
              <TextField
                label="Notes"
                placeholder="Notes"
                value={booking.notes}
                onChange={e => setBooking({ ...booking, notes: e.target.value })}
                multiline
                rows={2}
                sx={{ gridColumn: 'span 2' }}
              />

              {/* Created At - only show if not editing */}
              {formMode !== 'edit' && (
                <TextField
                  label="Created At"
                  type="date"
                  value={booking.createdAt}
                  onChange={e => setBooking({ ...booking, createdAt: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              )}

              {/* Payment Date - only show if not editing */}
              {formMode !== 'edit' && (
                <TextField
                  label="Payment Date"
                  type="date"
                  value={booking.paymentDate}
                  onChange={e => setBooking({ ...booking, paymentDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              mt: 3,
              justifyContent: 'flex-end'
            }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Saving...' : formMode === 'edit' ? 'Update Booking' : 'Create Booking'}
              </Button>

              {formMode === 'edit' && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={reset}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          alignItems: 'center',
        }}
      >
        <TextField
          label="Filter by Listing"
          variant="outlined"
          size="small"
          value={filters.listing}
          onChange={e => setFilters(f => ({ ...f, listing: e.target.value }))}
        />

        <TextField
          label="Filter by Guest"
          variant="outlined"
          size="small"
          value={filters.guest}
          onChange={e => setFilters(f => ({ ...f, guest: e.target.value }))}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select
            value={filters.paymentStatus}
            label="Payment Status"
            onChange={e => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
            <MenuItem value="partial">Partial</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" size="small" onClick={() => {
          setSortField('checkinDate');
          setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        }}>
          Sort by Check-in {sortField === 'checkinDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </Button>

        <Button variant="outlined" size="small" onClick={() => {
          setSortField('amountReceived');
          setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        }}>
          Sort by Amount {sortField === 'amountReceived' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </Button>

        <Button variant="outlined" size="small" onClick={() => {
          setSortField('createdAt');
          setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        }}>
          Sort by Created {sortField === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </Button>

        <Button variant="outlined" size="small" onClick={() => {
          setSortField('paymentDate');
          setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        }}>
          Sort by Payment Date {sortField === 'paymentDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </Button>
      </Box>

      {/* Table to display bookings */}
      <Paper elevation={2}>
        <Table className="booking-table">
          <TableHead>
            <TableRow>
              <TableCell>Listing</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBookings.map(b => {
              const guestObj = guests.find(g => g.id === b.guestId) || {};
              const listingObj = listings.find(l => l.id === b.listingId) || {};
              return (
                <TableRow key={b.id}>
                  <TableCell>{listingObj.name || b.listingId}</TableCell>
                  <TableCell>
                    {guestObj.name || ''}<br />
                    {guestObj.phone || ''}<br />
                    {guestObj.email || ''}
                  </TableCell>
                  <TableCell>{b.checkinDate}</TableCell>
                  <TableCell>{b.checkoutDate}</TableCell>
                  <TableCell>{b.paymentStatus}</TableCell>
                  <TableCell>{b.amountReceived}</TableCell>
                  <TableCell>{b.bookingSource}</TableCell>
                  <TableCell>{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{b.paymentDate ? new Date(b.paymentDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(b)}
                        disabled={loading}
                        sx={{ minWidth: 60 }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedBookings.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid rgba(224, 224, 224, 1)',
            '.MuiTablePagination-toolbar': {
              paddingLeft: 2,
              paddingRight: 2,
            },
          }}
        />
      </Paper>

    </Box>
  );
};

export default Bookings;
