import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import axios from 'axios';
import ReportLayout from './ReportLayout';

function CustomReportGenerator() {
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedListings, setSelectedListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [allData, setAllData] = useState([]);
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
        if (selectedListings.length === 1) {
          params.set('listingId', selectedListings[0].id || selectedListings[0]);
        }
        const url = `${import.meta.env.VITE_API_BASE}/bookings?${params.toString()}`;
        const res = await axios.get(url);
        const listingMap = {};
        listings.forEach(l => { listingMap[l.id] = l.name; });
        setAllData(
          res.data.map(b => ({
            date: b.checkinDate,
            listing: listingMap[b.listingId] || b.listingId,
            amount: parseFloat(b.amountReceived) || 0
          }))
        );
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate, selectedListings, listings]);

  const filteredData = allData;

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
    <ReportLayout
      title="✍️ Custom Reports (Date Range + Listings)"
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      listings={listings}
      listingValue={selectedListings}
      setListingValue={setSelectedListings}
      multiple
      onExportCSV={exportToCSV}
      onExportPDF={exportToPDF}
      loading={loading}
      error={error}
    >
      <Typography variant="body2" sx={{ mt: 1 }}>
        {filteredData.length} records matched.
      </Typography>
    </ReportLayout>
  );
}

export default CustomReportGenerator;
