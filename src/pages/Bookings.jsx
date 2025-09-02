import React, { useEffect, useRef, useState } from 'react';
import { api, asArray } from '@/lib/api';
import dayjs from 'dayjs';
import {
  Box, Button, CircularProgress, FormControl, InputLabel, MenuItem,
  Select, TextField, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Card, CardContent, TablePagination, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import '../style.css';
import { buildBookingPayload } from '../utils/buildBookingPayload';
import GuestTypeahead from '../components/GuestTypeahead';
import { safeFind } from '../utils/array';

const Bookings = () => {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [guest, setGuest] = useState({ name: '', phone: '', email: '' });
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '', email: '' });
  const [booking, setBooking] = useState({
    id: null,
    listingId: '',
    checkinDate: '',
    checkoutDate: '',
    bookingSource: 'Walk-in',
    commissionAmount: 0,
    amountReceived: 0,
    notes: '',
    bankAccountId: ''
  });
  const [guestsPlanned, setGuestsPlanned] = useState(2);
  const [guestsActual, setGuestsActual] = useState(2);
  const [extraGuestCharge, setExtraGuestCharge] = useState(0);
  const EXTRA_GUEST_RATE = 750;
  const [showExtras, setShowExtras] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [filters, setFilters] = useState({
    listing: '',
    guest: '',
  });
  // Default sorting should be by check-in date so upcoming bookings appear first
  const [sortField, setSortField] = useState('checkinDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [checkinStart, setCheckinStart] = useState(null);
  const [checkinEnd, setCheckinEnd] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const messageRef = useRef(null);
  const nights = booking.checkinDate && booking.checkoutDate
    ? dayjs(booking.checkoutDate).diff(dayjs(booking.checkinDate), 'day')
    : 0;
  const displayDate = (dateStr) =>
    dateStr ? dayjs(dateStr).format('YYYY-MM-DD') : '';
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
    const fetchLookups = async () => {
      try {
          const [listRes, bankRes] = await Promise.all([
            api.get(`/listings`),
            api.get(`/bankaccounts`)
          ]);
        setListings(asArray(listRes.data, 'listings'));
        setBankAccounts(asArray(bankRes.data, 'bankaccounts'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchLookups();
  }, []);

  const handleAddNewGuest = () => {
    setNewGuest({ name: '', phone: '', email: '' });
    setAddGuestOpen(true);
  };

  const saveNewGuest = async () => {
      try {
        const res = await api.post(`/guests`, newGuest);
        const g = res.data;
      setGuest({ name: g.name, phone: g.phone || '', email: g.email || '' });
      setSelectedGuestId(g.id.toString());
      setSelectedGuest(g);
      setAddGuestOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async (start, end) => {
    setIsLoading(true);
    setFetchError('');
    try {
        let url = `/bookings?include=bankAccount,guest`;
        if (start && end) {
          url += `&checkinStart=${dayjs(start).format('YYYY-MM-DD')}&checkinEnd=${dayjs(end).format('YYYY-MM-DD')}`;
        }
        const { data } = await api.get(url);
      const sorted = [...asArray(data, 'bookings')].sort(
        (a, b) => new Date(b.checkinDate) - new Date(a.checkinDate)
      );
      setBookings(sorted);
    } catch (err) {
      setFetchError('Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if ((checkinStart && checkinEnd) || (!checkinStart && !checkinEnd)) {
      fetchBookings(checkinStart, checkinEnd);
    }
  }, [checkinStart, checkinEnd]);

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
    setGuest({ name: '', phone: '', email: '' });
    setSelectedGuestId('');
    setSelectedGuest(null);
    setSelectedListing(null);
    setFormMode('create');
    setSelectedBookingId(null);
    setBooking({
      id: null,
      listingId: '',
      checkinDate: '',
      checkoutDate: '',

      bookingSource: 'Walk-in',
      commissionAmount: 0,
      amountReceived: 0,
      notes: '',
      bankAccountId: ''
    });
    setGuestsPlanned(2);
    setGuestsActual(2);
    setExtraGuestCharge(0);
    setShowExtras(false);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const submit = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const guestId = Number(selectedGuestId);
      const listingId = selectedListing ? selectedListing.id : parseInt(booking.listingId);

      if (!guestId || !listingId || !booking.checkinDate || !booking.checkoutDate) {
        setErrorMsg('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const payload = buildBookingPayload({
        booking,
        selectedGuest,
        selectedGuestId,
        selectedListing,
        guestsPlanned,
        guestsActual,
        extraGuestCharge
      });
      console.log(payload);
      if (formMode === 'edit' && selectedBookingId) {
        await api.put(
          `/bookings/${selectedBookingId}`,
          payload
        );
        setSuccessMsg('Booking updated successfully!');
      } else {
        const { id, ...createPayload } = payload;
        await api.post(`/bookings`, createPayload);
        setSuccessMsg('Booking created successfully!');
      }
      reset();
      const { data: updatedData } = await api.get(`/bookings`);
      const sorted = [...asArray(updatedData, 'bookings')].sort(
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
    console.log('Editing booking', bookingToEdit);
    setFormMode('edit');
    setSelectedBookingId(bookingToEdit.id);
    const listingObj = safeFind(listings, (l) => l.id === bookingToEdit.listingId) || null;
    setBooking({
      id: bookingToEdit.id,
      listingId: bookingToEdit.listingId || '',
      // Support both camelCase variations returned from the API
      checkinDate: (bookingToEdit.checkinDate || bookingToEdit.checkInDate)
        ? dayjs(bookingToEdit.checkinDate || bookingToEdit.checkInDate).format('YYYY-MM-DD')
        : '',
      checkoutDate: (bookingToEdit.checkoutDate || bookingToEdit.checkOutDate)
        ? dayjs(bookingToEdit.checkoutDate || bookingToEdit.checkOutDate).format('YYYY-MM-DD')
        : '',
      bookingSource: bookingToEdit.bookingSource || 'Walk-in',
      commissionAmount: bookingToEdit.commissionAmount ?? 0,
      amountReceived: bookingToEdit.amountReceived ?? 0,
      notes: bookingToEdit.notes || '',
      bankAccountId: bookingToEdit.bankAccountId ? bookingToEdit.bankAccountId.toString() : ''
    });
    setGuestsPlanned(bookingToEdit.guestsPlanned ?? 2);
    setGuestsActual(bookingToEdit.guestsActual ?? 2);
    setExtraGuestCharge(bookingToEdit.extraGuestCharge ?? 0);
    setShowExtras(!!bookingToEdit.guestsPlanned || !!bookingToEdit.guestsActual || !!bookingToEdit.extraGuestCharge);
    setSelectedGuestId(bookingToEdit.guestId.toString());
    const guestObj = bookingToEdit.guest || { name: '', phone: '', email: '' };
    setGuest(guestObj);
    setSelectedGuest(guestObj);
    setSelectedListing(listingObj);
    setSuccessMsg('');
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this booking?');
    if (!confirmed) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
      setDeleteError(err?.response?.data?.message || err.message || 'Failed to delete booking.');
    }
  };

  // Filtering logic
  const filteredBookings = bookings.filter(b => {
    const guestObj = b.guest || {};
    const listingObj = safeFind(listings, (l) => l.id === b.listingId) || {};
    return (
      (!filters.listing || listingObj.name?.toLowerCase().includes(filters.listing.toLowerCase())) &&
      (!filters.guest || guestObj.name?.toLowerCase().includes(filters.guest.toLowerCase()))
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
            {errorMsg && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {errorMsg}
              </Alert>
            )}
          </Box>

          <Snackbar
            open={Boolean(successMsg)}
            autoHideDuration={3000}
            onClose={() => setSuccessMsg('')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ width: '100%' }}>
              {successMsg}
            </Alert>
          </Snackbar>
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

              {/* Guest */}
              <GuestTypeahead
                onSelect={(g) => {
                  setSelectedGuestId(g.id.toString());
                  setSelectedGuest(g);
                  setGuest({ name: g.name, phone: g.phone || '', email: g.email || '' });
                }}
                onAddNew={handleAddNewGuest}
              />

              <TextField label="Phone" value={guest.phone} onChange={e=>setGuest({ ...guest, phone: e.target.value })} helperText="Autofilled from guest" />

              <TextField label="Email" type="email" value={guest.email} onChange={e=>setGuest({ ...guest, email: e.target.value })} helperText="Autofilled from guest" />

              <Typography variant="subtitle1" sx={{ width: '100%', mt: 2 }}>
                Booking Details
              </Typography>

              {/* Listing */}
              <FormControl required>
                <InputLabel>Listing</InputLabel>
                <Select
                  value={selectedListing || ''}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedListing(val || null);
                    setBooking({ ...booking, listingId: val ? val.id : '' });
                  }}
                  label="Listing"
                  renderValue={(selected) => selected?.name || ''}
                >
                  <MenuItem value="">Select Listing</MenuItem>
                  {listings.map(l => (
                    <MenuItem key={l.id} value={l}>{l.name}</MenuItem>
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

              {/* Check-out Date */}
              <TextField
                label="Check-out Date"
                type="date"
                value={booking.checkoutDate}
                onChange={e => setBooking({ ...booking, checkoutDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              {nights > 0 && (
                <Typography sx={{ alignSelf: 'center' }} color="text.secondary">
                  {nights} night{nights > 1 ? 's' : ''}
                </Typography>
              )}



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

              {/* Bank Account */}
              <FormControl>
                <InputLabel>Bank Account</InputLabel>
                <Select
                  value={booking.bankAccountId}
                  onChange={e => setBooking({ ...booking, bankAccountId: e.target.value })}
                  label="Bank Account"
                >
                  <MenuItem value="">Select Account</MenuItem>
                  {bankAccounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id}>
                      {`${acc.bankName} - ${acc.accountNumber}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Net Amount */}
              <TextField
                label="Net Amount"
                type="number"
                placeholder="Net Amount"
                value={booking.amountReceived}
                onChange={e => setBooking({ ...booking, amountReceived: e.target.value })}
                inputProps={{
                  min: 0,
                  step: "0.01"
                }}
              />

              {/* Commission */}
              <TextField
                label="Commission"
                type="number"
                placeholder="Commission"
                value={booking.commissionAmount}
                onChange={e => setBooking({ ...booking, commissionAmount: e.target.value })}
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
            </Box>

            <div style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="text-sm text-blue-600 underline"
                onClick={() => setShowExtras(!showExtras)}
              >
                {showExtras ? 'Hide Extras' : 'Add Extra Guest Info (optional)'}
              </button>

              {showExtras && (
                <div className="grid grid-cols-3 gap-4 mt-3 p-4 border rounded-md bg-gray-50">
                  <div>
                    <label>Guests Planned</label>
                    <input
                      type="number"
                      className="form-input w-full"
                      value={guestsPlanned}
                      onChange={(e) => setGuestsPlanned(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Guests Actual</label>
                    <input
                      type="number"
                      className="form-input w-full"
                      value={guestsActual}
                      onChange={(e) => {
                        const actual = parseInt(e.target.value);
                        setGuestsActual(actual);
                        setExtraGuestCharge(actual > guestsPlanned ? (actual - guestsPlanned) * EXTRA_GUEST_RATE : 0);
                      }}
                    />
                  </div>
                  <div>
                    <label>Extra Guest Charge (₹)</label>
                    <input
                      type="number"
                      className="form-input w-full"
                      value={extraGuestCharge}
                      onChange={(e) => setExtraGuestCharge(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>

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

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Check-in Start"
            value={checkinStart}
            onChange={val => setCheckinStart(val)}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="Check-in End"
            value={checkinEnd}
            onChange={val => setCheckinEnd(val)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>

        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setCheckinStart(null);
            setCheckinEnd(null);
          }}
        >
          Clear Dates
        </Button>


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


      </Box>

      {/* Table to display bookings */}
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2}>
          <Table className="booking-table">
          <TableHead>
            <TableRow>
              <TableCell>Listing</TableCell>
              <TableCell>Guest</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell>Check-out</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Guests</TableCell>
              <TableCell>Extra Charge (₹)</TableCell>
              <TableCell>Commission (₹)</TableCell>
              <TableCell>Net (₹)</TableCell>
              <TableCell>Bank Account</TableCell>
              <TableCell>Source</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBookings.map(row => {
              const listingObj = safeFind(listings, (l) => l.id === row.listingId) || {};
              const bankAccountObj =
                row.bankAccount ||
                safeFind(bankAccounts, (b) => b.id === row.bankAccountId) ||
                {};
              const bankName = (bankAccountObj?.bankName ?? '').toString();
              const accountNumber = (bankAccountObj?.accountNumber ?? '').toString();
              const prefix = bankName ? bankName.slice(0, 4).toUpperCase() : '';
              const suffix = accountNumber ? accountNumber.slice(-4) : '';
              const formattedBank = prefix && suffix ? `${prefix}-${suffix}` : '';
              const guestName  = (row.guest?.name ?? row.guestName ?? '').trim();
              const guestPhone = (row.guest?.phone ?? row.guestPhone ?? '').trim();
              const guestEmail = (row.guest?.email ?? row.guestEmail ?? '').trim();
              return (
                <TableRow key={row.id}>
                  <TableCell>{listingObj.name || row.listingId}</TableCell>
                  <TableCell>
                    {guestName || '—'}<br />
                    {guestPhone || ''}<br />
                    {guestEmail || ''}
                  </TableCell>
                  <TableCell>{displayDate(row.checkinDate || row.checkInDate)}</TableCell>
                  <TableCell>{displayDate(row.checkoutDate || row.checkOutDate)}</TableCell>
                  <TableCell>{row.paymentStatus}</TableCell>
                  <TableCell>{row.guestsPlanned} → {row.guestsActual}</TableCell>
                  <TableCell>₹{row.extraGuestCharge?.toLocaleString("en-IN")}</TableCell>
                  <TableCell>₹{row.commissionAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>₹{row.amountReceived?.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{formattedBank}</TableCell>
                  <TableCell>{row.bookingSource}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(row)}
                        disabled={loading}
                        sx={{ minWidth: 60 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(row.id)}
                        disabled={loading}
                        startIcon={<DeleteIcon />}
                        sx={{ minWidth: 80 }}
                      >
                        Delete
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
      )}

      <Snackbar
        open={Boolean(deleteError)}
        autoHideDuration={3000}
        onClose={() => setDeleteError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setDeleteError('')} severity="error" sx={{ width: '100%' }}>
          {deleteError}
        </Alert>
      </Snackbar>

      <Dialog open={addGuestOpen} onClose={() => setAddGuestOpen(false)}>
        <DialogTitle>Add Guest</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            value={newGuest.name}
            onChange={e => setNewGuest({ ...newGuest, name: e.target.value })}
          />
          <TextField
            label="Phone"
            value={newGuest.phone}
            onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            value={newGuest.email}
            onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddGuestOpen(false)}>Cancel</Button>
          <Button onClick={saveNewGuest} disabled={!newGuest.name}>Save</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Bookings;
