import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, FormControl, InputLabel, MenuItem,
  Select, TextField, Typography, Table, TableHead, TableRow, TableCell,
  TableBody, Paper, Alert
} from '@mui/material';
import { api, asArray } from '@/lib/api';

const Properties = () => {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    name: '', address: '', type: '', ownerName: '', contactPhone: '', commissionPercent: '', status: 'active'
  });
  const [editId, setEditId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
        const { data } = await api.get(`/properties`);
      setList(asArray(data, 'properties'));
    } catch (err) {
      setErrorMsg('Failed to fetch properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm({
      name: '', address: '', type: '', ownerName: '', contactPhone: '', commissionPercent: '', status: 'active'
    });
    setEditId(null);
    setErrorMsg('');
  };

  const submit = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        commissionPercent: parseFloat(form.commissionPercent)
      };
        const url = `/properties`;
        if (editId) {
          await api.put(`${url}/${editId}`, payload);
        } else {
          await api.post(url, payload);
        }
      resetForm();
      fetchData();
    } catch (err) {
      setErrorMsg('Failed to save property. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  const edit = (prop) => {
    setForm({ ...prop, commissionPercent: prop.commissionPercent.toString() });
    setEditId(prop.id);
    setErrorMsg('');
  };

  const remove = async (id) => {
    if (confirm("Are you sure you want to delete this property?")) {
      setLoading(true);
      setErrorMsg('');
      try {
          await api.delete(`/properties/${id}`);
        fetchData();
      } catch (err) {
        setErrorMsg('Failed to delete property. Please try again.');
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
          {editId ? 'Edit Property' : 'Add Property'}
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
              <TextField
                label="Property Name"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                sx={{ flex: '1 1 300px' }}
              />

              <TextField
                label="Address"
                required
                multiline
                rows={1}
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                sx={{ flex: '1 1 300px' }}
              />

              <TextField
                label="Property Type"
                required
                placeholder="e.g., Apartment, Villa, House"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
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
                label="Owner Name"
                required
                value={form.ownerName}
                onChange={e => setForm({ ...form, ownerName: e.target.value })}
                sx={{ flex: '1 1 300px' }}
              />

              <TextField
                label="Contact Phone"
                required
                inputProps={{
                  pattern: "^[0-9+\\-\\s]{7,15}$",
                  title: "Please enter a valid phone number (7-15 digits, can include +, -, spaces)"
                }}
                value={form.contactPhone}
                onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                sx={{ flex: '1 1 300px' }}
              />

              <TextField
                label="Commission Percentage"
                type="number"
                required
                inputProps={{
                  min: 0,
                  max: 100,
                  step: 0.1
                }}
                value={form.commissionPercent}
                onChange={e => setForm({ ...form, commissionPercent: e.target.value })}
                sx={{ flex: '1 1 300px' }}
              />
            </Box>

            {/* Third Row */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'end',
              justifyContent: 'space-between'
            }}>
              <FormControl required sx={{ flex: '0 1 300px', minWidth: '250px' }}>
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
                    minWidth: 140,
                    height: 56,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem'
                  }}
                >
                  {editId ? 'Update Property' : 'Add Property'}
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
              <TableCell><strong>Property Name</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Owner</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Address</strong></TableCell>
              <TableCell><strong>Commission %</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No properties found. Add your first property above.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              list.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.ownerName}</TableCell>
                  <TableCell>{p.contactPhone}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" noWrap title={p.address}>
                      {p.address}
                    </Typography>
                  </TableCell>
                  <TableCell>{p.commissionPercent}%</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: p.status === 'active' ? 'success.light' : 'error.light',
                        color: p.status === 'active' ? 'success.dark' : 'error.dark',
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 'medium',
                        textTransform: 'capitalize'
                      }}
                    >
                      {p.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => edit(p)}
                        disabled={loading}
                        sx={{ minWidth: 60 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => remove(p.id)}
                        disabled={loading}
                        sx={{ minWidth: 60 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default Properties;