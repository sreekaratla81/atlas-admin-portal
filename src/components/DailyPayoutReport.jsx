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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import dayjs from 'dayjs';
import ReportLayout from './ReportLayout';

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
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [listings, setListings] = useState([]);
  const [listingValue, setListingValue] = useState(null);
  const [payoutData, setPayoutData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE}/listings`)
      .then(res => setListings(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          start: startDate.format('YYYY-MM-DD'),
          end: endDate.format('YYYY-MM-DD')
        });
        if (listingValue && listingValue.id) {
          params.set('listingId', listingValue.id);
        }
        const url = `${import.meta.env.VITE_API_BASE}/reports/payouts/daily?${params.toString()}`;
        const res = await axios.get(url);
        setPayoutData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate, listingValue]);

  const exportCSV = () => {
    const csv = Papa.unparse({
      fields: ['Date', 'Listing', 'Amount ($)', 'Status'],
      data: payoutData.map(p => [p.date, p.listing, p.amount, p.status])
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'payouts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Daily Payouts', 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Listing', 'Amount ($)', 'Status']],
      body: payoutData.map(p => [p.date, p.listing, p.amount.toFixed(2), p.status])
    });
    doc.save('payouts.pdf');
  };

  return (
    <ReportLayout
      title="📆 Day-Wise Upcoming and Paid Report"
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      listings={listings}
      listingValue={listingValue}
      setListingValue={setListingValue}
      onExportCSV={exportCSV}
      onExportPDF={exportPDF}
      loading={loading}
      error={error}
    >
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
    </ReportLayout>
  );
}

export default DailyPayoutReport;
