import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import ReportLayout from './ReportLayout';

function EarningsReport() {
  const [startDate, setStartDate] = useState(dayjs().subtract(11, 'month').startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [listings, setListings] = useState([]);
  const [listingValue, setListingValue] = useState(null);
  const [data, setData] = useState([]);
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
        setData(res.data);
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
      fields: ['Month', 'Gross ($)', 'Net ($)'],
      data: data.map(d => [d.month, d.gross, d.net])
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'earnings.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Monthly Earnings', 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Month', 'Gross ($)', 'Net ($)']],
      body: data.map(d => [d.month, d.gross.toFixed(2), d.net.toFixed(2)])
    });
    doc.save('earnings.pdf');
  };

  return (
    <ReportLayout
      title="📈 12-Month On-Month Earnings Report"
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
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}`} />
            <Legend />
            <Bar dataKey="gross" fill="#8884d8" name="Gross Earnings" />
            <Bar dataKey="net" fill="#82ca9d" name="Net Payout" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ReportLayout>
  );
}

export default EarningsReport;
