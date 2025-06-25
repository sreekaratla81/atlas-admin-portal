import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';

function aggregateData(bookings, listings) {
  const listingMap = {};
  listings.forEach(l => { listingMap[l.id] = l.name; });
  const months = {};
  bookings.forEach(b => {
    const monthKey = dayjs(b.paymentDate || b.createdAt).format('MMMM YYYY');
    if (!months[monthKey]) months[monthKey] = {};
    if (!months[monthKey][b.listingId]) months[monthKey][b.listingId] = 0;
    months[monthKey][b.listingId] += parseFloat(b.amountReceived) || 0;
  });
  return Object.entries(months).map(([month, entries]) => ({
    month,
    rows: Object.entries(entries).map(([listingId, amount]) => ({
      listing: listingMap[listingId] || listingId,
      taxType: '',
      gross: amount,
      fees: 0,
      net: amount
    }))
  }));
}

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
  const [earningsData, setEarningsData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookRes, listRes] = await Promise.all([
          axios.get(
            `${import.meta.env.VITE_API_BASE}/admin/reports/bookings`
          ),
          axios.get(
            `${import.meta.env.VITE_API_BASE}/admin/reports/listings`
          )
        ]);
        setEarningsData(aggregateData(bookRes.data, listRes.data));
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        📄 Monthly Earnings PDF Reports
      </Typography>
      <Typography variant="body1" gutterBottom>
        Download Airbnb earnings reports per month with breakdowns by listing and tax type.
      </Typography>

      {earningsData.map((entry, index) => (
        <Box key={index} sx={{ marginBottom: 2 }}>
          <Typography variant="subtitle1">{entry.month}</Typography>
          <Button
            variant="outlined"
            onClick={() => generatePDF(entry.month, entry.rows)}
          >
            Download {entry.month} PDF
          </Button>
        </Box>
      ))}
    </Box>
  );
}

export default MonthlyEarningsReport;
