import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography, Paper, Alert
} from '@mui/material';

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', idProofUrl: '' });
  const [editId, setEditId] = useState(null);

  const fetchGuests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE}/guests`);
      setGuests(res.data);
    } catch (err) {
      setError('Failed to fetch guests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleOpen = (guest) => {
    if (guest) {
      setForm({
        name: guest.name || '',
        phone: guest.phone || '',
        email: guest.email || '',
        idProofUrl: guest.idProofUrl || ''
      });
      setEditId(guest.id);
    } else {
      setForm({ name: '', phone: '', email: '', idProofUrl: '' });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      if (editId) {
        await axios.put(`${import.meta.env.VITE_API_BASE}/guests/${editId}`, form);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE}/guests`, form);
      }
      handleClose();
      fetchGuests();
    } catch (err) {
      setError('Failed to save guest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        New Guest
      </Button>

      {loading && guests.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>ID Proof URL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {guests.map(g => (
                <TableRow
                  key={g.id}
                  hover
                  onClick={() => handleOpen(g)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{g.name}</TableCell>
                  <TableCell>{g.phone}</TableCell>
                  <TableCell>{g.email || '—'}</TableCell>
                  <TableCell>
                    {g.idProofUrl ? (
                      <a href={g.idProofUrl} target="_blank" rel="noopener noreferrer">Link</a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {guests.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No guests found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Guest' : 'New Guest'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Phone"
            required
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            label="ID Proof URL"
            value={form.idProofUrl}
            onChange={e => setForm({ ...form, idProofUrl: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={loading}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Guests;
