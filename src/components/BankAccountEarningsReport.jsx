import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getBankAccountEarnings } from '../api/bankAccountsApi';

const BankAccountEarningsReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getBankAccountEarnings();
        const arr = Array.isArray(res) ? res : [];
        const normalized = arr.map((entry) => ({
          label: `${entry.bankName} ${entry.accountNumber}`,
          tooltip: `${entry.bankName} (${String(entry.accountNumber).slice(-4)})`,
          amount: parseFloat(entry.amountReceived) || 0,
        }));
        setData(normalized);
      } catch (err) {
        console.error(err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        🏦 Bank Account Earnings Report (FY 2025–26)
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
              <Tooltip
                formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                labelFormatter={(label, payload) => {
                  const item = payload && payload[0] && payload[0].payload;
                  return item ? item.tooltip : label;
                }}
              />
              <Bar dataKey="amount" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default BankAccountEarningsReport;
