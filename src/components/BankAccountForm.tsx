import React from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface BankAccountFormProps {
  form: any;
  setForm: (form: any) => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ form, setForm }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
    <TextField
      label="Bank Name"
      required
      value={form.bankName}
      onChange={(e: any) => setForm({ ...form, bankName: e.target.value })}
    />
    <TextField
      label="Account Number"
      required
      value={form.accountNumber}
      onChange={(e: any) => setForm({ ...form, accountNumber: e.target.value })}
    />
    <TextField
      label="IFSC"
      required
      value={form.ifsc}
      onChange={(e: any) => setForm({ ...form, ifsc: e.target.value })}
    />
    <FormControl required>
      <InputLabel id="account-type-label">Account Type</InputLabel>
      <Select
        labelId="account-type-label"
        label="Account Type"
        value={form.accountType}
        onChange={(e: any) => setForm({ ...form, accountType: e.target.value })}
      >
        <MenuItem value="Current">Current Account</MenuItem>
        <MenuItem value="Savings">Savings Account</MenuItem>
      </Select>
    </FormControl>
  </Box>
);

export default BankAccountForm;
