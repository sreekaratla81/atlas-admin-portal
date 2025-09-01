import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, FormControl, InputLabel, MenuItem,
  Select, TextField, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Grid, Alert
} from '@mui/material';
import { api, asArray } from '@/lib/api';
import { safeFind } from '../utils/array';

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    name: '', propertyId: '', floor: '', type: '', status: 'active',
    wifiName: '', wifiPassword: '', maxGuests: '',
    checkInTime: '', checkOutTime: ''
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    } catch (err) {
      setErrorMsg('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
    } catch (err) {
      setErrorMsg('Failed to save listing. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const edit = (l) => {
    setForm({ ...l, propertyId: l.propertyId.toString() });
    setEditId(l.id);
    setErrorMsg('');
  };

  const remove = async (id) => {
    if (confirm("Delete this listing?")) {
      setLoading(true);
      setErrorMsg('');
      try {
          await api.delete(`/listings/${id}`);
        fetchData();
      } catch (err) {
        setErrorMsg('Failed to delete listing. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          {editId ? 'Edit Listing' : 'Add Listing'}
        </Typography>

        <Box component="form" onSubmit={e => { e.preventDefault(); submit(); }}>
          
          {/* Form Row Container */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 3 
          }}>
            
            {/* First Row */}
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

            {/* Second Row */}
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

            {/* Third Row */}
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

            {/* Fourth Row */}
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
                <TableCell>{l.checkInTime}</TableCell>
                <TableCell>{l.checkOutTime}</TableCell>
                <TableCell>{l.status}</TableCell>
                <TableCell>{l.wifiName}</TableCell>
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
  );
};

export default Listings;