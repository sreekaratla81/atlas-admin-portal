import React, { useEffect, useState, useMemo } from 'react';
import { api, asArray } from '@/lib/api';
import { hydrateGuests } from '@/services/guests.local';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Guests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', idProofUrl: '' });
  const [editId, setEditId] = useState(null);
  const [deleteGuest, setDeleteGuest] = useState(null);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');

  const fetchGuests = async () => {
    setLoading(true);
    setError('');
      try {
        const { data } = await api.get(`/api/guests`);
        setGuests(asArray(data, 'guests'));
      } catch (err) {
      setError('Failed to fetch guests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

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
          await api.put(`/guests/${editId}`, form);
        } else {
          await api.post(`/guests`, form);
        }
      // Ensure the bookings page sees the latest guests by refreshing the
      // cached list used for typeahead search.
      await hydrateGuests(true);
      handleClose();
      fetchGuests();
    } catch (err) {
      setError('Failed to save guest.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    setError('');
    try {
        await api.delete(`/guests/${id}`);
      await hydrateGuests(true);
      fetchGuests();
    } catch (err) {
      setError('Failed to delete guest.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (guest) => {
    setDeleteGuest(guest);
  };

  const confirmDelete = async () => {
    if (deleteGuest) {
      await remove(deleteGuest.id);
      setDeleteGuest(null);
    }
  };

  const cancelDelete = () => setDeleteGuest(null);

  const filteredGuests = useMemo(() => {
    if (!search) return guests;
    return guests.filter((g) => {
      const term = search.toLowerCase();
      return (
        (g.name || '').toLowerCase().includes(term) ||
        (g.phone || '').toLowerCase().includes(term) ||
        (g.email || '').toLowerCase().includes(term)
      );
    });
  }, [search, guests]);

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

      <TextField
        label="Search guests"
        fullWidth
        size="small"
        variant="outlined"
        placeholder="Search by name, phone, or email"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

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
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGuests.map(g => (
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
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen(g);
                        }}
                        disabled={loading}
                        startIcon={<EditIcon />}
                        sx={{ minWidth: 80 }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(g);
                        }}
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
              {filteredGuests.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
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

      <Dialog open={Boolean(deleteGuest)} onClose={cancelDelete}>
        <DialogTitle>Delete Guest</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteGuest?.name}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} disabled={loading}>Cancel</Button>
          <Button color="error" onClick={confirmDelete} disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Guests;
