import React from 'react';
import { Box, TextField } from '@mui/material';

const BankAccountForm = ({ form, setForm }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
    <TextField
      label="Bank Name"
      required
      value={form.bankName}
      onChange={e => setForm({ ...form, bankName: e.target.value })}
    />
    <TextField
      label="Account Number"
      required
      value={form.accountNumber}
      onChange={e => setForm({ ...form, accountNumber: e.target.value })}
    />
    <TextField
      label="IFSC"
      required
      value={form.ifsc}
      onChange={e => setForm({ ...form, ifsc: e.target.value })}
    />
    <TextField
      label="Account Type"
      required
      value={form.accountType}
      onChange={e => setForm({ ...form, accountType: e.target.value })}
    />
  </Box>
);

export default BankAccountForm;
