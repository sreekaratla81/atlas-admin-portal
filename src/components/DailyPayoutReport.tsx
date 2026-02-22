import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
} from '@mui/material';

import { api, asArray } from '@/lib/api';

const getStatusChip = (status: string) => {
  switch (status) {
    case 'Sent':
      return <Chip label="Sent" color="success" size="small" />;
    case 'On Hold':
      return <Chip label="On Hold" color="warning" size="small" />;
    default:
      return <Chip label={status} color="default" size="small" />;
  }
};

function DailyPayoutReport() {
  const [payoutData, setPayoutData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
        try {
          const res = await api.get(
            `/admin/reports/payouts/daily`
          );
          setPayoutData(asArray(res.data, 'payouts'));
        } catch (err) {
          console.warn('Falling back to /payouts', err);
          api
            .get(`/admin/reports/payouts`)
            .then((res: any) => setPayoutData(asArray(res.data, 'payouts')))
            .catch((err2: any) => console.error(err2));
        }
    }
    fetchData();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        📆 Day-Wise Upcoming and Paid Report
      </Typography>
      <Typography variant="body1" gutterBottom>
        Tracks daily payouts by listing, date, and status.
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Listing</strong></TableCell>
              <TableCell><strong>Amount ($)</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payoutData.map((row: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.listing}</TableCell>
                <TableCell>${row.amount.toFixed(2)}</TableCell>
                <TableCell>{getStatusChip(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default DailyPayoutReport;
