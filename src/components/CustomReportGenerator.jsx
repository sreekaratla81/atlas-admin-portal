import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const listings = ['Green Villa', 'Ocean Breeze', 'Skyline View', 'Mountain Stay'];

const allData = [
  { date: '2025-06-20', listing: 'Green Villa', amount: 320 },
  { date: '2025-06-21', listing: 'Ocean Breeze', amount: 480 },
  { date: '2025-06-22', listing: 'Skyline View', amount: 260 },
  { date: '2025-06-23', listing: 'Mountain Stay', amount: 500 },
  { date: '2025-06-24', listing: 'Green Villa', amount: 410 },
];

function CustomReportGenerator() {
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedListings, setSelectedListings] = useState([]);

  const filteredData = allData.filter(item => {
    const date = dayjs(item.date);
    return date.isAfter(startDate.subtract(1, 'day')) &&
           date.isBefore(endDate.add(1, 'day')) &&
           (selectedListings.length === 0 || selectedListings.includes(item.listing));
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Custom Report', 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [['Date', 'Listing', 'Amount ($)']],
      body: filteredData.map(d => [d.date, d.listing, d.amount.toFixed(2)]),
    });

    doc.save('Custom_Report.pdf');
  };

  const exportToCSV = () => {
    const csv = Papa.unparse({
      fields: ['Date', 'Listing', 'Amount ($)'],
      data: filteredData.map(d => [d.date, d.listing, d.amount.toFixed(2)])
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
          renderInput={(params) => <TextField {...params} />}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          renderInput={(params) => <TextField {...params} />}
        />
      </Box>

      <Autocomplete
        multiple
        options={listings}
        value={selectedListings}
        onChange={(e, newVal) => setSelectedListings(newVal)}
        renderInput={(params) => <TextField {...params} label="Select Listings" />}
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
