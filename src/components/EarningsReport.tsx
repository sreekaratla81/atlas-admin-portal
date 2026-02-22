import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { api, asArray } from '@/lib/api';

function buildEmptyMonths() {
  const months: Record<string, { month: string; total: number }> = {};
  for (let i = 11; i >= 0; i--) {
    const d = dayjs().subtract(i, 'month');
    months[d.format('YYYY-MM')] = {
      month: d.format('MMM'),
      total: 0,
    };
  }
  return months;
}

function EarningsReport() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showZeroMonths, setShowZeroMonths] = useState<boolean>(false);

  useEffect(() => {
    async function fetchMonthlyEarnings() {
      try {
        const { data } = await api.get(`/admin/reports/earnings/monthly`);
        const normalized = asArray(data, 'monthly earnings').map((entry: any) => ({
  month: dayjs(entry.month).format('MMM'),
  total: entry.totalNet,
  totalNet: entry.totalNet,
}));

        setMonthlyData(normalized);
      } catch (err) {
        console.warn('Falling back to client aggregation', err);
        try {
          const { data: bookingsData } = await api.get(`/admin/reports/bookings`);
          const months = buildEmptyMonths();
          asArray(bookingsData, 'bookings').forEach((b: any) => {
            const key = dayjs(b.paymentDate || b.createdAt).format('YYYY-MM');
            if (months[key]) {
              months[key].total += parseFloat(b.amountReceived) || 0;
            }
          });
          setMonthlyData(Object.values(months));
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
    <section
      style={{
        background: '#fff',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        marginBottom: '2rem',
        minHeight: '300px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          📈 12-Month On-Month Earnings Report
        </h2>
        <button
          style={{
            fontSize: '0.875rem',
            color: '#2563eb',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          onClick={() => setShowZeroMonths(!showZeroMonths)}
        >
          {showZeroMonths ? 'Hide' : 'Show'} Zero Months
        </button>
      </div>

      {isLoading ? (
        <p>Loading earnings data...</p>
      ) : !Array.isArray(monthlyData) || monthlyData.length === 0 ? (
        <p>No data available</p>
      ) : (
        <>
          <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(val: any) => `₹${val.toLocaleString('en-IN')}`}
                />
                <Tooltip
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                />
                <Bar dataKey="total" fill="#4caf50" name="Total Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 600 }}>
                  <th style={{ padding: '0.5rem 1rem 0.5rem 0' }}>Month</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Net Earnings</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData
                  .filter((row: any) => showZeroMonths || row.total > 0)
                  .map((row: any, idx: number) => (
                    <tr
                      key={row.month}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'transparent',
                        opacity: row.total === 0 ? 0.5 : 1,
                      }}
                    >
                      <td style={{ padding: '0.5rem 1rem 0.5rem 0' }}>{row.month}</td>
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                        ₹{row.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                        ₹{row.totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default EarningsReport;
