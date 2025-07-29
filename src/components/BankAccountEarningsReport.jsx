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
import { getBankAccountEarnings, getBankAccounts } from '../api/bankAccountsApi';

const BankAccountEarningsReport = ({ accounts: externalAccounts }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [accountsRes, earningsRes] = await Promise.all([
          externalAccounts ? Promise.resolve(externalAccounts) : getBankAccounts(),
          getBankAccountEarnings(),
        ]);

        const accounts = Array.isArray(accountsRes) ? accountsRes : [];
        const earningsArr = Array.isArray(earningsRes) ? earningsRes : [];

        const earningsMap = {};
        earningsArr.forEach((e) => {
          const key =
            e.accountDisplay || `${e.bank} - ${String(e.accountNumber || '').slice(-4)}`;
          earningsMap[key] = parseFloat(e.amountReceived) || 0;
        });

        const normalized = accounts.map((acc) => {
          const label = `${acc.bankName} - ${String(acc.accountNumber).slice(-4)}`;
          return {
            label,
            amount: earningsMap[label] ?? 0,
          };
        });

        setData(normalized);
      } catch (err) {
        console.error(err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [externalAccounts]);

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
              <YAxis
                tickFormatter={(v) =>
                  v.toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })
                }
              />
              <Tooltip
                formatter={(val) =>
                  Number(val).toLocaleString('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  })
                }
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
