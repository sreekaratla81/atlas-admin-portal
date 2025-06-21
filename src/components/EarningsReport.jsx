import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const earningsData = [
  { month: 'Jan', gross: 5000, fees: 1000, net: 4000 },
  { month: 'Feb', gross: 6000, fees: 1200, net: 4800 },
  { month: 'Mar', gross: 5500, fees: 1100, net: 4400 },
  { month: 'Apr', gross: 7000, fees: 1300, net: 5700 },
  { month: 'May', gross: 8000, fees: 1400, net: 6600 },
  { month: 'Jun', gross: 7500, fees: 1250, net: 6250 },
  { month: 'Jul', gross: 8200, fees: 1500, net: 6700 },
  { month: 'Aug', gross: 7900, fees: 1450, net: 6450 },
  { month: 'Sep', gross: 8500, fees: 1600, net: 6900 },
  { month: 'Oct', gross: 8700, fees: 1650, net: 7050 },
  { month: 'Nov', gross: 9000, fees: 1700, net: 7300 },
  { month: 'Dec', gross: 9500, fees: 1800, net: 7700 },
];

function EarningsReport() {
  return (
    <div style={{ width: '100%', height: 500 }}>
      <h2>📈 12-Month On-Month Earnings Report</h2>
      <ResponsiveContainer>
        <BarChart
          data={earningsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
          <Bar dataKey="gross" fill="#8884d8" name="Gross Earnings" />
          <Bar dataKey="fees" fill="#ffc658" name="Fees" />
          <Bar dataKey="net" fill="#82ca9d" name="Net Payout" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EarningsReport;
