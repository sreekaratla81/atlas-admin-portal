import React, { useEffect, useRef, useState } from 'react';
import { api, asArray } from '@/lib/api';
import { hydrateGuests } from '@/services/guests.local';
import { getAllGuests } from '@/db/idb';
import dayjs from 'dayjs';
import {
  Box, Button, CircularProgress, FormControl, InputLabel, MenuItem,
  Select, TextField, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, TableContainer, Paper, Card, CardContent, TablePagination, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import '../style.css';
import { buildBookingPayload } from '../utils/buildBookingPayload';
import GuestTypeahead from '../components/GuestTypeahead';
import AdminShellLayout from '@/components/layout/AdminShellLayout';

const Bookings: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [guest, setGuest] = useState({ name: '', phone: '', email: '' });
  const [addGuestOpen, setAddGuestOpen] = useState<boolean>(false);
  const [newGuest, setNewGuest] = useState({ name: '', phone: '', email: '' });
  const [booking, setBooking] = useState({
    id: null as number | null,
    listingId: '',
    checkinDate: '',
    checkoutDate: '',
    bookingSource: 'Walk-in',
    commissionAmount: 0,
    amountReceived: 0,
    notes: '',
    bankAccountId: ''
  });
  const [guestsPlanned, setGuestsPlanned] = useState<number>(2);
  const [guestsActual, setGuestsActual] = useState<number>(2);
  const [extraGuestCharge, setExtraGuestCharge] = useState<number>(0);
  const EXTRA_GUEST_RATE = 750;
  const [showExtras, setShowExtras] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<string>('create');
  const [selectedBookingId, setSelectedBookingId] = useState<any>(null);
  const [filters, setFilters] = useState({
    listing: '',
    guest: '',
  });
  const [sortField, setSortField] = useState<string>('checkinDate');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [deleteError, setDeleteError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string>('');
  const [checkinStart, setCheckinStart] = useState<any>(null);
  const [checkinEnd, setCheckinEnd] = useState<any>(null);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const messageRef = useRef<HTMLDivElement>(null);
  const lastFetchedGuestIdRef = useRef<string | null>(null);
  const nights = booking.checkinDate && booking.checkoutDate
    ? dayjs(booking.checkoutDate).diff(dayjs(booking.checkinDate), 'day')
    : 0;
  const handleChangePage = (_event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
        setErrorMsg('Failed to load listings or bank accounts.');
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    const loadGuests = async () => {
      try {
        await hydrateGuests();
        const all = await getAllGuests();
        setGuests(all);
      } catch (err) {
        console.error('Failed to load guests', err);
        setErrorMsg('Failed to load guests.');
      }
    };
    loadGuests();
  }, []);

  useEffect(() => {
    if (!selectedGuestId) {
      lastFetchedGuestIdRef.current = null;
      return;
    }

    const match = guests.find(
      (g: any) => String(g.id) === String(selectedGuestId)
    );

    if (match) {
      lastFetchedGuestIdRef.current = null;
      if (!selectedGuest || String(selectedGuest.id) !== String(match.id)) {
        setSelectedGuest(match);
      }
      setGuest({
        name: match.name || '',
        phone: match.phone || '',
        email: match.email || ''
      });
      return;
    }

    if (formMode !== 'edit') return;

    if (lastFetchedGuestIdRef.current === selectedGuestId) {
      if (selectedGuest && String(selectedGuest.id) === String(selectedGuestId)) {
        setGuest({
          name: selectedGuest.name || '',
          phone: selectedGuest.phone || '',
          email: selectedGuest.email || ''
        });
      }
      return;
    }

    lastFetchedGuestIdRef.current = selectedGuestId;
    let active = true;
    const fetchGuest = async () => {
      try {
        const { data } = await api.get(`/guests/${selectedGuestId}`);
        if (!active) return;
        const raw = data?.guest ?? data;
        if (!raw) return;
        const normalized = {
          id: raw.id != null ? raw.id.toString() : selectedGuestId,
          name: raw.name ?? raw.fullName ?? '',
          phone: raw.phone ?? '',
          email: raw.email ?? ''
        };
        setSelectedGuest(normalized);
        setGuest({
          name: normalized.name || '',
          phone: normalized.phone || '',
          email: normalized.email || ''
        });
        setGuests(prev => {
          const idx = prev.findIndex((g: any) => String(g.id) === String(normalized.id));
          if (idx === -1) {
            return [...prev, normalized];
          }
          const next = [...prev];
          next[idx] = { ...next[idx], ...normalized };
          return next;
        });
      } catch (err) {
        console.error('Failed to fetch guest details', err);
      }
    };
    fetchGuest();
    return () => {
      active = false;
    };
  }, [formMode, guests, selectedGuestId, selectedGuest]);

  const handleAddNewGuest = () => {
    setNewGuest({ name: '', phone: '', email: '' });
    setAddGuestOpen(true);
  };

  const saveNewGuest = async () => {
      try {
        const res = await api.post(`/guests`, newGuest);
        const g = res.data;

        await hydrateGuests(true);
        const all = await getAllGuests();
        setGuests(all);

        setGuest({ name: g.name, phone: g.phone || '', email: g.email || '' });
        setSelectedGuestId(g.id.toString());
        setSelectedGuest(g);
        setAddGuestOpen(false);
      } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async (start: any, end: any) => {
    setIsLoading(true);
    setFetchError('');
    try {
      const params: any = {};
      if (start && end) {
        params.checkinStart = dayjs(start).format('YYYY-MM-DD');
        params.checkinEnd = dayjs(end).format('YYYY-MM-DD');
      }
      params.include = 'guest';
      const { data } = await api.get('/bookings', { params });
      const sorted = [...asArray(data, 'bookings')].sort(
        (a: any, b: any) => new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
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
    lastFetchedGuestIdRef.current = null;
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
      const guestIdRaw = selectedGuest?.id ?? selectedGuestId;
      const guestId = guestIdRaw ? Number(guestIdRaw) : NaN;
      const listingId = booking.listingId ? Number(booking.listingId) : NaN;

      if (!guestId || !listingId || !booking.checkinDate || !booking.checkoutDate) {
        setErrorMsg('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const payload = buildBookingPayload({
        booking,
        selectedGuest,
        selectedGuestId,
        guestsPlanned,
        guestsActual,
        extraGuestCharge
      });
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
        (a: any, b: any) => new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
      );
      setBookings(sorted);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  const resolveListingId = (bookingToEdit: any) => {
    const directId = [
      bookingToEdit.listingId,
      bookingToEdit.listing_id,
      bookingToEdit.listingID,
      bookingToEdit?.listing?.id
    ].find((id: any) => id !== undefined && id !== null && id !== '');

    if (directId !== undefined && directId !== null && directId !== '') {
      return directId.toString();
    }

    const normalizedListingName = (bookingToEdit.listing ?? '').toString().toLowerCase().trim();
    if (normalizedListingName && listings.length) {
      const match = listings.find(
        (l: any) => (l.name || '').toLowerCase().trim() === normalizedListingName
      );
      if (match?.id !== undefined && match?.id !== null) {
        return match.id.toString();
      }
    }

    return '';
  };

  const handleEdit = (bookingToEdit: any) => {
    setFormMode('edit');
    setSelectedBookingId(bookingToEdit.id);
    lastFetchedGuestIdRef.current = null;
    const listingId = resolveListingId(bookingToEdit);
    setBooking({
      id: bookingToEdit.id,
      listingId,
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
    const guestFromList = guests.find(
      (g: any) => String(g.id) === String(bookingToEdit.guestId)
    ) || null;
    const fallbackGuest = {
      id: bookingToEdit.guestId != null ? bookingToEdit.guestId.toString() : '',
      name: bookingToEdit.guest || '',
      phone: bookingToEdit.guestPhone || '',
      email: bookingToEdit.guestEmail || ''
    };
    const guestObj = guestFromList || (fallbackGuest.id ? fallbackGuest : null);
    setSelectedGuestId(guestObj?.id?.toString() || '');
    setGuest({
      name: guestObj?.name || '',
      phone: guestObj?.phone || '',
      email: guestObj?.email || ''
    });
    setSelectedGuest(guestObj);
    setSuccessMsg('');
  };

  const handleDelete = async (id: any) => {
    const confirmed = window.confirm('Are you sure you want to delete this booking?');
    if (!confirmed) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter((b: any) => b.id !== id));
    } catch (err: any) {
      console.error(err);
      setDeleteError(err?.response?.data?.message || err.message || 'Failed to delete booking.');
    }
  };

  const filteredBookings = bookings.filter((b: any) => (
    (!filters.listing || (b.listing || '').toLowerCase().includes(filters.listing.toLowerCase())) &&
    (!filters.guest || (b.guest || '').toLowerCase().includes(filters.guest.toLowerCase()))
  ));

  const sortedBookings = [...filteredBookings].sort((a: any, b: any) => {
    if (!sortField) return 0;
    let aValue: any, bValue: any;
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

  const getPaymentTone = (status: any) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'paid' || normalized === 'completed') return 'success';
    if (normalized === 'pending') return 'warning';
    if (normalized === 'cancelled') return 'error';
    return 'info';
  };

  return (
    <AdminShellLayout
      title="Bookings"
      rightSlot={
        <Typography color="text.secondary" fontSize={14}>
          Calm controls for check-ins and payments
        </Typography>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card
        sx={{
          mx: 'auto',
          mt: 0,
          mb: 1,
          backgroundColor: formMode === 'edit' ? 'var(--color-bg-subtle)' : 'var(--card-surface)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--card-shadow)',
          borderRadius: 2
        }}
      >
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
              <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mb: 1 }}>
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
            onSubmit={(e: any) => {
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
                allGuests={guests}
                value={selectedGuest}
                onSelect={(g: any) => {
                  if (g) {
                    setSelectedGuestId(g.id.toString());
                    setSelectedGuest(g);
                    setGuest({
                      name: g.name,
                      phone: g.phone || '',
                      email: g.email || '',
                    });
                  } else {
                    setSelectedGuestId('');
                    setSelectedGuest(null);
                    setGuest({ name: '', phone: '', email: '' });
                  }
                }}
                onAddNew={handleAddNewGuest}
              />

              <TextField label="Phone" value={guest.phone} onChange={(e: any)=>setGuest({ ...guest, phone: e.target.value })} helperText="Autofilled from guest" />

              <TextField label="Email" type="email" value={guest.email} onChange={(e: any)=>setGuest({ ...guest, email: e.target.value })} helperText="Autofilled from guest" />

              <Typography variant="subtitle1" sx={{ width: '100%', mt: 2 }}>
                Booking Details
              </Typography>

              {/* Listing */}
              <FormControl required>
                <InputLabel>Listing</InputLabel>
                <Select
                  value={booking.listingId || ''}
                  onChange={(e: any) => {
                    const val = e.target.value === '' ? '' : e.target.value.toString();
                    setBooking({ ...booking, listingId: val });
                  }}
                  label="Listing"
                  renderValue={(selectedId: any) => {
                    if (!selectedId) return '';
                    const match = listings.find((l: any) => String(l.id) === String(selectedId));
                    return match?.name || '';
                  }}
                >
                  <MenuItem value="">Select Listing</MenuItem>
                  {listings.map((l: any) => (
                    <MenuItem key={l.id} value={l.id != null ? l.id.toString() : ''}>{l.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Check-in Date */}
              <TextField
                label="Check-in Date"
                type="date"
                value={booking.checkinDate}
                onChange={(e: any) => setBooking({ ...booking, checkinDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              {/* Check-out Date */}
              <TextField
                label="Check-out Date"
                type="date"
                value={booking.checkoutDate}
                onChange={(e: any) => setBooking({ ...booking, checkoutDate: e.target.value })}
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
                  onChange={(e: any) => setBooking({ ...booking, bookingSource: e.target.value })}
                  label="Booking Source"
                >
                  <MenuItem value="Walk-in">Walk-in</MenuItem>
                  <MenuItem value="airbnb">Airbnb</MenuItem>
                  <MenuItem value="agoda">Agoda</MenuItem>
                  <MenuItem value="booking.com">Booking.com</MenuItem>
                  <MenuItem value="MakeMyTrip">MakeMyTrip</MenuItem>
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
                  onChange={(e: any) => setBooking({ ...booking, bankAccountId: e.target.value })}
                  label="Bank Account"
                >
                  <MenuItem value="">Select Account</MenuItem>
                  {bankAccounts.map((acc: any) => (
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
                onChange={(e: any) => setBooking({ ...booking, amountReceived: e.target.value })}
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
                onChange={(e: any) => setBooking({ ...booking, commissionAmount: e.target.value })}
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
                onChange={(e: any) => setBooking({ ...booking, notes: e.target.value })}
                multiline
                rows={2}
                sx={{ gridColumn: 'span 2' }}
              />
            </Box>

            <div style={{ marginTop: '1rem' }}>
              <Button
                type="button"
                variant="text"
                onClick={() => setShowExtras(!showExtras)}
                sx={{ color: 'var(--color-accent-primary)', textTransform: 'none', fontWeight: 600 }}
              >
                {showExtras ? 'Hide Extras' : 'Add Extra Guest Info (optional)'}
              </Button>

              {showExtras && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 2,
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-subtle)'
                  }}
                >
                  <TextField
                    label="Guests Planned"
                    type="number"
                    value={guestsPlanned}
                    onChange={(e: any) => setGuestsPlanned(parseInt(e.target.value))}
                  />
                  <TextField
                    label="Guests Actual"
                    type="number"
                    value={guestsActual}
                    onChange={(e: any) => {
                      const actual = parseInt(e.target.value);
                      setGuestsActual(actual);
                      setExtraGuestCharge(actual > guestsPlanned ? (actual - guestsPlanned) * EXTRA_GUEST_RATE : 0);
                    }}
                  />
                  <TextField
                    label="Extra Guest Charge (₹)"
                    type="number"
                    value={extraGuestCharge}
                    onChange={(e: any) => setExtraGuestCharge(parseInt(e.target.value))}
                  />
                </Box>
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
                sx={{
                  minWidth: 120,
                  backgroundColor: 'var(--button-primary-bg)',
                  color: 'var(--button-primary-text)',
                  '&:hover': { backgroundColor: 'var(--button-primary-strong)' }
                }}
              >
                {loading ? 'Saving...' : formMode === 'edit' ? 'Update Booking' : 'Create Booking'}
              </Button>

              {formMode === 'edit' && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={reset}
                  disabled={loading}
                  sx={{
                    minWidth: 120,
                    borderColor: 'var(--color-status-warning-border)',
                    color: 'var(--color-status-warning-text)'
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>

      <Box className="filters-bar" sx={{ mb: 2, alignItems: 'center' }}>
        <TextField
          label="Filter by Listing"
          variant="outlined"
          size="small"
          value={filters.listing}
          onChange={(e: any) => setFilters((f: any) => ({ ...f, listing: e.target.value }))}
        />

        <TextField
          label="Filter by Guest"
          variant="outlined"
          size="small"
          value={filters.guest}
          onChange={(e: any) => setFilters((f: any) => ({ ...f, guest: e.target.value }))}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Check-in Start"
            value={checkinStart}
            onChange={(val: any) => setCheckinStart(val)}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="Check-in End"
            value={checkinEnd}
            onChange={(val: any) => setCheckinEnd(val)}
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


        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSortField('checkinDate');
            setSortOrder((o: string) => o === 'asc' ? 'desc' : 'asc');
          }}
          sx={{ borderColor: 'var(--color-border-subtle)' }}
        >
          Sort by Check-in {sortField === 'checkinDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setSortField('amountReceived');
            setSortOrder((o: string) => o === 'asc' ? 'desc' : 'asc');
          }}
          sx={{ borderColor: 'var(--color-border-subtle)' }}
        >
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
          <CircularProgress sx={{ color: 'var(--color-accent-primary)' }} />
        </Box>
      ) : (
        <Box className="table-card">
          <div className="section-header">
            <h3>Booking ledger</h3>
            <Typography color="text.secondary" fontSize={13}>
              Stable tablet-friendly grid for arrivals and revenue
            </Typography>
          </div>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table className="shell-table">
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
                  <TableCell>Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBookings.map((row: any) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.listing}</TableCell>
                    <TableCell>{row.guest}</TableCell>
                    <TableCell>{new Date(row.checkinDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(row.checkoutDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{row.amountReceived.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{row.guestsActual}</TableCell>
                    <TableCell>₹{row.extraGuestCharge.toLocaleString('en-IN')}</TableCell>
                    <TableCell>₹{row.commissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>₹{(row.amountReceived - row.commissionAmount).toLocaleString('en-IN')}</TableCell>
                    <TableCell>{row.bankAccount}</TableCell>
                    <TableCell>{row.bookingSource}</TableCell>
                    <TableCell>
                      <span className={`status-badge status-badge--${getPaymentTone(row.paymentStatus)}`}>
                        {row.paymentStatus || 'Pending'}
                      </span>
                    </TableCell>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="table-footer">
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={sortedBookings.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
      </Box>
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
            onChange={(e: any) => setNewGuest({ ...newGuest, name: e.target.value })}
          />
          <TextField
            label="Phone"
            value={newGuest.phone}
            onChange={(e: any) => setNewGuest({ ...newGuest, phone: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            value={newGuest.email}
            onChange={(e: any) => setNewGuest({ ...newGuest, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddGuestOpen(false)}>Cancel</Button>
          <Button onClick={saveNewGuest} disabled={!newGuest.name}>Save</Button>
        </DialogActions>
      </Dialog>

    </Box>
    </AdminShellLayout>
  );
};

export default Bookings;
