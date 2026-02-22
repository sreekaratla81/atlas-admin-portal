import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, FormControl, InputLabel, MenuItem,
  Select, TextField, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Alert
} from '@mui/material';
import { api, asArray } from '@/lib/api';
import AdminShellLayout from '@/components/layout/AdminShellLayout';
import { safeFind } from '../utils/array';
import type { Listing, Property } from '@/types/api';

const Listings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState({
    name: '', propertyId: '', floor: '', type: '', status: 'active',
    wifiName: '', wifiPassword: '', maxGuests: '',
    checkInTime: '', checkOutTime: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [basePricingForm, setBasePricingForm] = useState({
    listingId: '',
    baseNightlyRate: '',
    weekendNightlyRate: '',
    extraGuestRate: '',
    currency: 'INR'
  });
  const [basePricingLoading, setBasePricingLoading] = useState(false);
  const [basePricingError, setBasePricingError] = useState('');
  const [basePricingSuccess, setBasePricingSuccess] = useState(false);

  const [pricingForm, setPricingForm] = useState({
    globalDiscountPercent: '',
    convenienceFeePercent: '',
    updatedBy: ''
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState('');
  const [pricingSuccess, setPricingSuccess] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [listRes, propRes] = await Promise.all([
        api.get(`/listings`),
        api.get(`/properties`)
      ]);
      setListings(asArray(listRes.data, 'listings'));
      setProperties(asArray(propRes.data, 'properties'));
    } catch {
      setErrorMsg('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingSettings = async () => {
    try {
      const { data } = await api.get('/tenant/settings/pricing');
      setPricingForm({
        globalDiscountPercent: data.globalDiscountPercent ?? data.GlobalDiscountPercent ?? '',
        convenienceFeePercent: data.convenienceFeePercent ?? data.ConvenienceFeePercent ?? '',
        updatedBy: data.updatedBy ?? data.UpdatedBy ?? ''
      });
    } catch {
      setPricingForm({ globalDiscountPercent: '', convenienceFeePercent: '', updatedBy: '' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchPricingSettings();
  }, []);

  const resetForm = () => {
    setForm({
      name: '', propertyId: '', floor: '', type: '', status: 'active',
      wifiName: '', wifiPassword: '', maxGuests: '',
      checkInTime: '', checkOutTime: ''
    });
    setEditId(null);
    setErrorMsg('');
  };

  const resetBasePricingForm = () => {
    setBasePricingForm({
      listingId: '',
      baseNightlyRate: '',
      weekendNightlyRate: '',
      extraGuestRate: '',
      currency: 'INR'
    });
    setBasePricingError('');
    setBasePricingSuccess(false);
  };

  const submitBasePricing = async (e: any) => {
    e?.preventDefault();
    const listingId = parseInt(basePricingForm.listingId, 10);
    const baseNightlyRate = parseFloat(basePricingForm.baseNightlyRate);
    if (!listingId || listingId <= 0) {
      setBasePricingError('Please select a listing.');
      return;
    }
    if (Number.isNaN(baseNightlyRate) || baseNightlyRate < 0) {
      setBasePricingError('Base nightly rate must be 0 or greater.');
      return;
    }
    setBasePricingLoading(true);
    setBasePricingError('');
    setBasePricingSuccess(false);
    try {
      await api.post('/pricing/send', {
        listingId,
        baseNightlyRate,
        weekendNightlyRate: basePricingForm.weekendNightlyRate === '' ? null : parseFloat(basePricingForm.weekendNightlyRate),
        extraGuestRate: basePricingForm.extraGuestRate === '' ? null : parseFloat(basePricingForm.extraGuestRate),
        currency: basePricingForm.currency || 'INR'
      });
      setBasePricingSuccess(true);
      resetBasePricingForm();
    } catch (err: any) {
      setBasePricingError(err?.response?.data?.message || 'Failed to save base pricing.');
    } finally {
      setBasePricingLoading(false);
    }
  };

  const resetPricingForm = () => {
    setPricingError('');
    setPricingSuccess(false);
    fetchPricingSettings();
  };

  const submitPricing = async (e: any) => {
    e?.preventDefault();
    const convenienceFeePercent = Number(pricingForm.convenienceFeePercent);
    const globalDiscountPercent = Number(pricingForm.globalDiscountPercent);
    if (Number.isNaN(convenienceFeePercent) || convenienceFeePercent < 0 || convenienceFeePercent > 100) {
      setPricingError('Convenience fee must be between 0 and 100.');
      return;
    }
    if (Number.isNaN(globalDiscountPercent) || globalDiscountPercent < 0 || globalDiscountPercent > 100) {
      setPricingError('Global discount percent must be between 0 and 100.');
      return;
    }
    setPricingLoading(true);
    setPricingError('');
    setPricingSuccess(false);
    try {
      await api.put('/tenant/settings/pricing', {
        convenienceFeePercent,
        globalDiscountPercent,
        updatedBy: pricingForm.updatedBy?.trim() || null
      });
      setPricingSuccess(true);
      fetchPricingSettings();
    } catch (err: any) {
      setPricingError(err?.response?.data?.message || 'Failed to update pricing settings.');
    } finally {
      setPricingLoading(false);
    }
  };

  const submit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        ...form,
        propertyId: parseInt(form.propertyId),
        floor: parseInt(form.floor),
        maxGuests: parseInt(form.maxGuests)
      };
      const url = `/listings`;
      if (editId) {
        await api.put(`${url}/${editId}`, payload);
      } else {
        await api.post(url, payload);
      }
      resetForm();
      fetchData();
    } catch {
      setErrorMsg('Failed to save listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const edit = (l: any) => {
    setForm({ ...l, propertyId: l.propertyId.toString() });
    setEditId(l.id);
    setErrorMsg('');
  };

  const remove = async (id: number) => {
    if (confirm("Delete this listing?")) {
      setLoading(true);
      setErrorMsg('');
      try {
        await api.delete(`/listings/${id}`);
        fetchData();
      } catch {
        setErrorMsg('Failed to delete listing. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AdminShellLayout title="Listings">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {errorMsg && (
          <Alert severity="error" onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            {editId ? 'Edit Listing' : 'Add Listing'}
          </Typography>

          <Box component="form" onSubmit={(e: any) => { e.preventDefault(); submit(); }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                '& > *': {
                  flex: '1 1 300px',
                  minWidth: '250px'
                }
              }}>
                <FormControl required sx={{ flex: '1 1 300px' }}>
                  <InputLabel>Property</InputLabel>
                  <Select
                    value={form.propertyId}
                    label="Property"
                    onChange={e => setForm({ ...form, propertyId: e.target.value })}
                  >
                    <MenuItem value=""><em>Select Property</em></MenuItem>
                    {properties.map(p => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Name"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />

                <TextField
                  label="Floor"
                  type="number"
                  required
                  inputProps={{ min: 0 }}
                  value={form.floor}
                  onChange={e => setForm({ ...form, floor: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                '& > *': {
                  flex: '1 1 300px',
                  minWidth: '250px'
                }
              }}>
                <TextField
                  label="Type (1BHK)"
                  required
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />

                <TextField
                  label="Check-in Time (e.g. 14:00)"
                  required
                  inputProps={{ pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$" }}
                  value={form.checkInTime}
                  onChange={e => setForm({ ...form, checkInTime: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />

                <TextField
                  label="Check-out Time (e.g. 11:00)"
                  required
                  inputProps={{ pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$" }}
                  value={form.checkOutTime}
                  onChange={e => setForm({ ...form, checkOutTime: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                '& > *': {
                  flex: '1 1 300px',
                  minWidth: '250px'
                }
              }}>
                <FormControl required sx={{ flex: '1 1 300px' }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.status}
                    label="Status"
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="WiFi Name"
                  value={form.wifiName}
                  onChange={e => setForm({ ...form, wifiName: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />

                <TextField
                  label="WiFi Password"
                  value={form.wifiPassword}
                  onChange={e => setForm({ ...form, wifiPassword: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />
              </Box>

              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'end',
                justifyContent: 'space-between'
              }}>
                <TextField
                  label="Max Guests"
                  type="number"
                  required
                  inputProps={{ min: 1 }}
                  value={form.maxGuests}
                  onChange={e => setForm({ ...form, maxGuests: e.target.value })}
                  sx={{ flex: '0 1 300px', minWidth: '250px' }}
                />

                <Box sx={{
                  display: 'flex',
                  gap: 2,
                  flex: '1 1 auto',
                  justifyContent: 'flex-end',
                  minWidth: '250px'
                }}>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{
                      minWidth: 120,
                      height: 56,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    {editId ? 'Update Listing' : 'Add Listing'}
                  </Button>
                  {editId && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={resetForm}
                      disabled={loading}
                      sx={{
                        minWidth: 120,
                        height: 56,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '1rem'
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Base pricing
          </Typography>
          {basePricingError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setBasePricingError('')}>
              {basePricingError}
            </Alert>
          )}
          {basePricingSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Base pricing saved.
            </Alert>
          )}
          <Box component="form" onSubmit={submitBasePricing}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                '& > *': { flex: '1 1 300px', minWidth: '250px' }
              }}>
                <FormControl required sx={{ flex: '1 1 300px' }}>
                  <InputLabel>Listing ID *</InputLabel>
                  <Select
                    value={basePricingForm.listingId}
                    label="Listing ID *"
                    onChange={e => setBasePricingForm({ ...basePricingForm, listingId: e.target.value })}
                  >
                    <MenuItem value=""><em>Select Listing</em></MenuItem>
                    {listings.map(l => (
                      <MenuItem key={l.id} value={l.id}>{l.name} (ID: {l.id})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Base nightly rate *"
                  type="number"
                  required
                  inputProps={{ min: 0, step: '0.01' }}
                  value={basePricingForm.baseNightlyRate}
                  onChange={e => setBasePricingForm({ ...basePricingForm, baseNightlyRate: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />
                <TextField
                  label="Weekend nightly rate"
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  value={basePricingForm.weekendNightlyRate}
                  onChange={e => setBasePricingForm({ ...basePricingForm, weekendNightlyRate: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />
                <TextField
                  label="Extra guest rate"
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  value={basePricingForm.extraGuestRate}
                  onChange={e => setBasePricingForm({ ...basePricingForm, extraGuestRate: e.target.value })}
                  sx={{ flex: '1 1 300px' }}
                />
                <FormControl sx={{ flex: '1 1 300px' }}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={basePricingForm.currency}
                    label="Currency"
                    onChange={e => setBasePricingForm({ ...basePricingForm, currency: e.target.value })}
                  >
                    <MenuItem value="INR">INR</MenuItem>
                    <MenuItem value="USD">USD</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  onClick={resetBasePricingForm}
                  disabled={basePricingLoading}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={basePricingLoading}
                  sx={{ textTransform: 'none', minWidth: 120 }}
                >
                  {basePricingLoading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Tenant pricing settings
          </Typography>
          {pricingError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPricingError('')}>
              {pricingError}
            </Alert>
          )}
          {pricingSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPricingSuccess(false)}>
              Pricing settings updated.
            </Alert>
          )}
          <Box component="form" onSubmit={submitPricing}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                '& > *': {
                  flex: '1 1 300px',
                  minWidth: '250px'
                }
              }}>
                <TextField
                  label="Global discount (%)"
                  type="number"
                  value={pricingForm.globalDiscountPercent}
                  onChange={e => setPricingForm({ ...pricingForm, globalDiscountPercent: e.target.value })}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{ flex: '1 1 300px' }}
                />
                <TextField
                  label="Convenience fee (%)"
                  type="number"
                  value={pricingForm.convenienceFeePercent}
                  onChange={e => setPricingForm({ ...pricingForm, convenienceFeePercent: e.target.value })}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  sx={{ flex: '1 1 300px' }}
                />
                <TextField
                  label="Updated by"
                  value={pricingForm.updatedBy}
                  onChange={e => setPricingForm({ ...pricingForm, updatedBy: e.target.value })}
                  inputProps={{ maxLength: 100 }}
                  sx={{ flex: '1 1 300px' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={resetPricingForm}
                  disabled={pricingLoading}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={pricingLoading}
                  sx={{ minWidth: 120 }}
                >
                  {pricingLoading ? 'Saving…' : 'Save'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Floor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Check-out</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>WiFi Name</TableCell>
                <TableCell>Guests</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map(l => (
                <TableRow key={l.id}>
                  <TableCell>{safeFind(properties, (p) => p.id === l.propertyId)?.name || '—'}</TableCell>
                  <TableCell>{l.name}</TableCell>
                  <TableCell>{l.floor}</TableCell>
                  <TableCell>{l.type}</TableCell>
                  <TableCell>{(l as any).checkInTime}</TableCell>
                  <TableCell>{(l as any).checkOutTime}</TableCell>
                  <TableCell>{l.status}</TableCell>
                  <TableCell>{(l as any).wifiName}</TableCell>
                  <TableCell>{l.maxGuests}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => edit(l)} disabled={loading}>
                        Edit
                      </Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => remove(l.id)} disabled={loading}>
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </AdminShellLayout>
  );
};

export default Listings;
