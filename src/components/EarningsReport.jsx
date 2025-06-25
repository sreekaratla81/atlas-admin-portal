import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';
import axios from 'axios';

function buildEmptyMonths() {
  const months = {};
  for (let i = 11; i >= 0; i--) {
    const d = dayjs().subtract(i, 'month');
    months[d.format('YYYY-MM')] = {
      month: d.format('MMM'),
      gross: 0,
      fees: 0,
      net: 0
    };
  }
  return months;
}

function EarningsReport() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE}/reports/earnings/monthly`
        );
        setData(res.data);
      } catch (err) {
        console.warn('Falling back to client aggregation', err);
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_BASE}/bookings`);
          const months = buildEmptyMonths();
          res.data.forEach((b) => {
            const key = dayjs(b.paymentDate || b.createdAt).format('YYYY-MM');
            if (months[key]) {
              const amt = parseFloat(b.amountReceived) || 0;
              months[key].gross += amt;
              months[key].net += amt;
            }
          });
          setData(Object.values(months));
        } catch (err2) {
          console.error(err2);
        }
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <h2>📈 12-Month On-Month Earnings Report</h2>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
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
  );
}

export default EarningsReport;
