import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { api, asArray } from '@/lib/api';
import { safeIncludes } from '../utils/array';

function CustomReportGenerator() {
  const [startDate, setStartDate] = useState<any>(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState<any>(dayjs());
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [listings, setListings] = useState<string[]>([]);
  const [allData, setAllData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
          const [listRes, bookRes] = await Promise.all([
            api.get(`/admin/reports/listings`),
            api.get(`/admin/reports/bookings`)
          ]);
        const listArr = asArray(listRes.data, 'listings');
        setListings(listArr.map((l: any) => l.name));
        const listingMap: Record<string, string> = {};
        listArr.forEach((l: any) => { listingMap[l.id] = l.name; });
        const bookArr = asArray(bookRes.data, 'bookings');
        setAllData(bookArr.map((b: any) => ({
          date: b.checkinDate,
          listing: listingMap[b.listingId] || b.listingId,
          amount: parseFloat(b.amountReceived) || 0
        })));
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const filteredData = allData.filter((item: any) => {
    const date = dayjs(item.date);
    return date.isAfter(startDate.subtract(1, 'day')) &&
           date.isBefore(endDate.add(1, 'day')) &&
           (selectedListings.length === 0 || safeIncludes(selectedListings, item.listing));
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Custom Report', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Listing', 'Amount ($)']],
      body: filteredData.map((d: any) => [d.date, d.listing, d.amount.toFixed(2)]),
    });

    doc.save('Custom_Report.pdf');
  };

  const exportToCSV = () => {
    const csv = Papa.unparse({
      fields: ['Date', 'Listing', 'Amount ($)'],
      data: filteredData.map((d: any) => [d.date, d.listing, d.amount.toFixed(2)])
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Custom_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>✍️ Custom Reports (Date Range + Listings)</Typography>
      <Typography variant="body1" gutterBottom>
        Select a date range and listings to generate a PDF or CSV report.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          renderInput={(params: any) => <TextField {...params} />}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          renderInput={(params: any) => <TextField {...params} />}
        />
      </Box>

      <Autocomplete
        multiple
        options={listings}
        value={selectedListings}
        onChange={(_e: any, newVal: string[]) => setSelectedListings(newVal)}
        renderInput={(params: any) => <TextField {...params} label="Select Listings" />}
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={exportToPDF}>Export PDF</Button>
        <Button variant="outlined" onClick={exportToCSV}>Export CSV</Button>
      </Box>

      <Typography variant="body2" sx={{ mt: 3 }}>
        {filteredData.length} records matched.
      </Typography>
    </Box>
  );
}

export default CustomReportGenerator;
