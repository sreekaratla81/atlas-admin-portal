import React, { useEffect, useState } from 'react';
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
  Typography,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
} from '../api/bankAccountsApi';
import AdminShellLayout from '@/components/layout/AdminShellLayout';
import BankAccountForm from '../components/BankAccountForm';
import BankAccountEarningsReport from '../components/BankAccountEarningsReport';
import type { BankAccount } from '@/types/api';

const BankAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bankName: '', accountNumber: '', ifsc: '', accountType: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteItem, setDeleteItem] = useState<BankAccount | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBankAccounts();
      setAccounts(data);
    } catch {
      setError('Failed to fetch bank accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpen = (acc?: BankAccount) => {
    if (acc) {
      setForm({
        bankName: acc.bankName || '',
        accountNumber: acc.accountNumber || '',
        ifsc: acc.ifsc || '',
        accountType: acc.accountType || ''
      });
      setEditId(acc.id);
    } else {
      setForm({ bankName: '', accountNumber: '', ifsc: '', accountType: '' });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      if (editId) {
        await updateBankAccount(editId, form);
        setSuccess('Bank account updated');
      } else {
        await createBankAccount(form);
        setSuccess('Bank account created');
      }
      fetchData();
      handleClose();
    } catch {
      setError('Failed to save bank account.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setLoading(true);
    setError('');
    try {
      await deleteBankAccount(deleteItem.id);
      setSuccess('Bank account deleted');
      fetchData();
    } catch {
      setError('Failed to delete bank account.');
    } finally {
      setLoading(false);
      setDeleteItem(null);
    }
  };

  return (
    <AdminShellLayout title="Bank Accounts">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Button variant="contained" onClick={() => handleOpen()} sx={{ alignSelf: 'flex-start' }}>
          New Bank Account
        </Button>

        {loading && accounts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bank</TableCell>
                  <TableCell>Account Number</TableCell>
                  <TableCell>IFSC</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map(acc => (
                  <TableRow key={acc.id} hover>
                    <TableCell>{acc.bankName}</TableCell>
                    <TableCell>{acc.accountNumber}</TableCell>
                    <TableCell>{acc.ifsc}</TableCell>
                    <TableCell>{acc.accountType}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => handleOpen(acc)} disabled={loading}>Edit</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => setDeleteItem(acc)} disabled={loading}>Delete</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {accounts.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No bank accounts found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        <BankAccountEarningsReport accounts={accounts} />
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Bank Account' : 'New Bank Account'}</DialogTitle>
        <DialogContent>
          <BankAccountForm form={form} setForm={setForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={submit} variant="contained" disabled={loading}>{editId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteItem)} onClose={() => setDeleteItem(null)}>
        <DialogTitle>Delete Bank Account</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this bank account?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteItem(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={loading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </AdminShellLayout>
  );
};

export default BankAccountsPage;
