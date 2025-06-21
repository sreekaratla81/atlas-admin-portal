import React from 'react';
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

const payoutData = [
  { date: '2025-06-20', listing: 'Green Villa', amount: 320, status: 'Sent' },
  { date: '2025-06-20', listing: 'Ocean Breeze', amount: 480, status: 'On Hold' },
  { date: '2025-06-21', listing: 'Skyline View', amount: 260, status: 'Sent' },
  { date: '2025-06-21', listing: 'Green Villa', amount: 320, status: 'Sent' },
  { date: '2025-06-22', listing: 'Mountain Stay', amount: 500, status: 'On Hold' },
  { date: '2025-06-22', listing: 'Ocean Breeze', amount: 400, status: 'Sent' },
];

const getStatusChip = (status) => {
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
            {payoutData.map((row, index) => (
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
