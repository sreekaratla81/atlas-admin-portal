import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';
import Papa from 'papaparse';
import ReportLayout from './ReportLayout';

function generatePDF(month, rows) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`${month} - Airbnb Earnings Report`, 14, 22);

  autoTable(doc, {
    startY: 30,
    head: [['Listing', 'Tax Type', 'Gross ($)', 'Fees ($)', 'Net ($)']],
    body: rows.map((row) => [
      row.listing,
      row.taxType,
      row.gross.toFixed(2),
      row.fees.toFixed(2),
      row.net.toFixed(2),
    ]),
    styles: { halign: 'center' },
    headStyles: { fillColor: [63, 81, 181] }, // MUI primary color
  });

  doc.save(`${month.replace(' ', '_')}_Report.pdf`);
}

function MonthlyEarningsReport() {
  const [startDate, setStartDate] = useState(dayjs().subtract(11, 'month').startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [listings, setListings] = useState([]);
  const [listingValue, setListingValue] = useState(null);
  const [earningsData, setEarningsData] = useState([]);
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
        const url = `${import.meta.env.VITE_API_BASE}/reports/earnings/monthly?${params.toString()}`;
        const res = await axios.get(url);
        setEarningsData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate, listingValue]);

  const exportCSV = () => {
    const rows = earningsData.flatMap(e =>
      e.rows.map(r => ({ month: e.month, ...r }))
    );
    const csv = Papa.unparse({
      fields: ['Month', 'Listing', 'Gross ($)', 'Net ($)'],
      data: rows.map(r => [r.month, r.listing, r.gross, r.net])
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'monthly_earnings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDFAll = () => {
    const doc = new jsPDF();
    earningsData.forEach((e, idx) => {
      if (idx !== 0) doc.addPage();
      doc.text(`${e.month} - Earnings`, 14, 22);
      autoTable(doc, {
        startY: 30,
        head: [['Listing', 'Gross ($)', 'Net ($)']],
        body: e.rows.map(r => [r.listing, r.gross.toFixed(2), r.net.toFixed(2)])
      });
    });
    doc.save('monthly_earnings.pdf');
  };

  return (
    <ReportLayout
      title="📄 Monthly Earnings PDF Reports"
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      listings={listings}
      listingValue={listingValue}
      setListingValue={setListingValue}
      onExportCSV={exportCSV}
      onExportPDF={exportPDFAll}
      loading={loading}
      error={error}
    >
      {earningsData.map((entry, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
          <Typography variant="subtitle1">{entry.month}</Typography>
          <Button variant="outlined" onClick={() => generatePDF(entry.month, entry.rows)}>
            Download {entry.month} PDF
          </Button>
        </Box>
      ))}
    </ReportLayout>
  );
}

export default MonthlyEarningsReport;
