import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE;

function buildEmptyMonths() {
  const months = {};
  for (let i = 11; i >= 0; i--) {
    const d = dayjs().subtract(i, 'month');
    months[d.format('YYYY-MM')] = {
      month: d.format('MMM'),
      totalGross: 0,
      totalFees: 0,
      totalNet: 0,
    };
  }
  return months;
}

function EarningsReport() {
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    async function fetchMonthlyEarnings() {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/reports/earnings/monthly`);
        const data = await res.json();
        const normalized = Array.isArray(data)
          ? data.map((entry) => ({
              month: dayjs(entry.month).format('MMM'),
              totalGross: entry.totalGross,
              totalFees: entry.totalFees,
              totalNet: entry.totalNet,
            }))
          : [];
        setMonthlyData(normalized);
      } catch (err) {
        console.warn('Falling back to client aggregation', err);
        try {
          const res = await axios.get(
            `${API_BASE_URL}/admin/reports/bookings`
          );
          const months = buildEmptyMonths();
          res.data.forEach((b) => {
            const key = dayjs(b.paymentDate || b.createdAt).format('YYYY-MM');
            if (months[key]) {
              const amt = parseFloat(b.amountReceived) || 0;
              months[key].totalGross += amt;
              months[key].totalNet += amt;
            }
          });
          const aggregated = Object.values(months);
          setMonthlyData(aggregated);
        } catch (err2) {
          console.error(err2);
        }
      }
    }
    fetchMonthlyEarnings();
  }, []);

  if (!Array.isArray(monthlyData) || monthlyData.length === 0) {
    return <p>No data available</p>;
  }

  return (
    <div style={{ width: '100%', height: 500 }}>
      <h2>📈 12-Month On-Month Earnings Report</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={monthlyData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
          <Legend />
          <Bar dataKey="totalNet" stackId="a" fill="#4caf50" name="Net Earnings" />
          <Bar dataKey="totalFees" stackId="a" fill="#f44336" name="Commissions" />
        </BarChart>
      </ResponsiveContainer>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Total Gross</th>
            <th>Total Fees</th>
            <th>Total Net</th>
          </tr>
        </thead>
        <tbody>
          {monthlyData.map((row) => (
            <tr key={row.month}>
              <td>{row.month}</td>
              <td>₹{Number(row.totalGross).toLocaleString()}</td>
              <td>₹{Number(row.totalFees).toLocaleString()}</td>
              <td>₹{Number(row.totalNet).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EarningsReport;
