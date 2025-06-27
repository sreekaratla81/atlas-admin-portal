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
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    }
    fetchMonthlyEarnings();
  }, []);

  return (
    <section style={{ minHeight: '300px', marginBottom: '2rem' }}>
      <h2>📈 12-Month On-Month Earnings Report</h2>

      {isLoading ? (
        <p>Loading earnings data...</p>
      ) : !Array.isArray(monthlyData) || monthlyData.length === 0 ? (
        <p>No data available</p>
      ) : (
        <>
          <div style={{ width: '100%', height: 500 }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}`
                  }
                />
                <Legend />
                <Bar dataKey="totalNet" stackId="a" fill="#4caf50" name="Net Earnings" />
                <Bar dataKey="totalFees" stackId="a" fill="#f44336" name="Commissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
                  <td>
                    ₹{row.totalGross.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    ₹{row.totalFees.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    ₹{row.totalNet.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

export default EarningsReport;
