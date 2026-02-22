import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { api, asArray } from '@/lib/api';

function aggregateData(bookings: any[], listings: any[]) {
  const listingMap: Record<string, string> = {};
  listings.forEach((l: any) => {
    listingMap[l.id] = l.name;
  });
  const months: Record<string, Record<string, { net: number; fees: number }>> = {};
  bookings.forEach((b: any) => {
    const monthKey = dayjs(b.paymentDate || b.createdAt).format('MMMM YYYY');
    if (!months[monthKey]) months[monthKey] = {};
    if (!months[monthKey][b.listingId]) {
      months[monthKey][b.listingId] = { net: 0, fees: 0 };
    }
    months[monthKey][b.listingId].net += parseFloat(b.amountReceived) || 0;
    months[monthKey][b.listingId].fees += parseFloat(b.commissionAmount) || 0;
  });
  return Object.entries(months).map(([month, entries]) => ({
    month,
    rows: Object.entries(entries).map(([listingId, amounts]) => ({
      listing: listingMap[listingId] || listingId,
      taxType: '',
      total: amounts.net + amounts.fees,
      fees: amounts.fees,
      net: amounts.net,
    })),
  }));
}

function generatePDF(month: string, rows: any[]) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`${month} - Airbnb Earnings Report`, 14, 22);

  autoTable(doc, {
    startY: 30,
    head: [['Listing', 'Tax Type', 'Total ($)', 'Fees ($)', 'Net ($)']],
    body: rows.map((row: any) => [
      row.listing,
      row.taxType,
      row.total.toFixed(2),
      row.fees.toFixed(2),
      row.net.toFixed(2),
    ]),
    styles: { halign: 'center' },
    headStyles: { fillColor: [63, 81, 181] },
  });

  doc.save(`${month.replace(' ', '_')}_Report.pdf`);
}

function MonthlyEarningsReport() {
  const [earningsData, setEarningsData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
          const [bookRes, listRes] = await Promise.all([
            api.get(`/admin/reports/bookings`),
            api.get(`/admin/reports/listings`)
          ]);
        setEarningsData(aggregateData(asArray(bookRes.data, 'bookings'), asArray(listRes.data, 'listings')));
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

      {earningsData.map((entry: any, index: number) => (
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
