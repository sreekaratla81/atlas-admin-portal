import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button, Box, Typography } from '@mui/material';

const earningsData = [
  {
    month: 'June 2025',
    rows: [
      { listing: 'Green Villa', taxType: 'GST', gross: 5000, fees: 800, net: 4200 },
      { listing: 'Ocean Breeze', taxType: 'VAT', gross: 6200, fees: 950, net: 5250 },
      { listing: 'Skyline View', taxType: 'GST', gross: 4000, fees: 700, net: 3300 },
    ],
  },
  {
    month: 'May 2025',
    rows: [
      { listing: 'Green Villa', taxType: 'GST', gross: 4800, fees: 750, net: 4050 },
      { listing: 'Ocean Breeze', taxType: 'VAT', gross: 6000, fees: 900, net: 5100 },
    ],
  },
];

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
