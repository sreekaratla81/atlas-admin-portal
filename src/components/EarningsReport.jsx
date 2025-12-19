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
import { api, asArray } from '@/lib/api';

function buildEmptyMonths() {
  const months = {};
  for (let i = 11; i >= 0; i--) {
    const d = dayjs().subtract(i, 'month');
    months[d.format('YYYY-MM')] = {
      month: d.format('MMM'),
      totalFees: 0,
      totalNet: 0,
    };
  }
  return months;
}

function EarningsReport() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showZeroMonths, setShowZeroMonths] = useState(false);

  useEffect(() => {
    async function fetchMonthlyEarnings() {
      try {
          const { data } = await api.get(`/admin/reports/earnings/monthly`);
        const normalized = asArray(data, 'monthly earnings')
          .map((entry) => ({
              month: dayjs(entry.month).format('MMM'),
              totalFees: entry.totalFees,
              totalNet: entry.totalNet,
            }))
        ;
        setMonthlyData(normalized);
      } catch (err) {
        console.warn('Falling back to client aggregation', err);
        try {
            const { data: bookingsData } = await api.get(
              `/admin/reports/bookings`
            );
            const months = buildEmptyMonths();
            asArray(bookingsData, 'bookings').forEach((b) => {
              const key = dayjs(b.paymentDate || b.createdAt).format('YYYY-MM');
              if (months[key]) {
                const net = parseFloat(b.amountReceived) || 0;
                const fee = parseFloat(b.commissionAmount) || 0;
                months[key].totalNet += net;
                months[key].totalFees += fee;
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
    <section
      style={{
        background: 'var(--bg-surface)',
        borderRadius: '0.5rem',
        boxShadow: 'var(--shadow-level1)',
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
            color: 'var(--accent-primary)',
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
                  tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                />
                <Tooltip
                  formatter={(val, name) => [
                    `₹${Number(val).toLocaleString('en-IN')}`,
                    name,
                  ]}
                />
                <Legend />
                <Bar dataKey="totalNet" stackId="a" fill="var(--status-success-strong)" name="Net Earnings" />
                <Bar dataKey="totalFees" stackId="a" fill="var(--status-error-strong)" name="Commissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600 }}>
                  <th style={{ padding: '0.5rem 1rem 0.5rem 0' }}>Month</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Total Fees</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>Total Net</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData
                  .filter((row) => showZeroMonths || row.totalNet + row.totalFees > 0)
                  .map((row, idx) => {
                    const total = row.totalNet + row.totalFees;
                    return (
                      <tr
                        key={row.month}
                        style={{
                          backgroundColor: idx % 2 === 0 ? 'var(--bg-subtle)' : 'transparent',
                          opacity: total === 0 ? 0.5 : 1,
                        }}
                      >
                        <td style={{ padding: '0.5rem 1rem 0.5rem 0' }}>{row.month}</td>
                        <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                          ₹{row.totalFees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>
                          ₹{row.totalNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default EarningsReport;
