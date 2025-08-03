import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  addMonths,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { computeThresholds, getHighlightStyle } from '../utils/percentile';

function SingleCalendarEarningsReport() {
  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [earnings, setEarnings] = useState([]);
  const [thresholds, setThresholds] = useState({ top: 0, bottom: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [monthlyTotals, setMonthlyTotals] = useState([]);

  const earningsMap = React.useMemo(() => {
    const map = new Map();
    (earnings || []).forEach((entry) => {
      if (entry?.date) {
        const dateKey = entry.date.split('T')[0];
        map.set(dateKey, entry);
      }
    });
    return map;
  }, [earnings]);

  const calendarDates = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const dates = [];
    let day = start;
    while (day <= end) {
      dates.push(day);
      day = addDays(day, 1);
    }
    return dates;
  }, [currentDate]);

  // Fetch listings
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE}/admin/reports/listings`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const validListings = data.filter((l) => l?.listingId && l?.name);
        setListings(validListings);

        const defaultListing =
          validListings.find((l) => l.name.toLowerCase().includes('ph')) ||
          validListings[0];

        if (defaultListing?.listingId) {
          setSelectedListingId(String(defaultListing.listingId));
        }
      })
      .catch((err) => console.error('Failed to fetch listings:', err));
  }, []);

  // Fetch earnings
  useEffect(() => {
    if (!selectedListingId) return;
    const month = format(currentDate, 'yyyy-MM');
    setLoading(true);
    setEarnings([]);
    axios
      .get(`${import.meta.env.VITE_API_BASE}/reports/calendar-earnings`, {
        params: { listingId: selectedListingId, month },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setEarnings(data);

        const totalsObj = {};
        data.forEach((entry) => {
          if (entry?.date) {
            const dateKey = entry.date.split('T')[0];
            totalsObj[dateKey] = { amount: entry.total || 0 };
          }
        });
        setThresholds(computeThresholds(totalsObj));
      })
      .catch((err) => {
        console.error('Failed to fetch earnings:', err);
        setEarnings([]);
        setThresholds({ top: 0, bottom: 0 });
      })
      .finally(() => setLoading(false));
  }, [selectedListingId, currentDate]);

  // Compute monthly totals across listings for the current month
  useEffect(() => {
    async function fetchTotals() {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      try {
        const [bookRes, listRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE}/admin/reports/bookings`),
          axios.get(`${import.meta.env.VITE_API_BASE}/admin/reports/listings`),
        ]);

        const bookings = Array.isArray(bookRes.data) ? bookRes.data : [];
        const listData = Array.isArray(listRes.data) ? listRes.data : [];
        const listingMap = {};
        listData.forEach((l) => {
          const id = l.listingId || l.id;
          if (id) listingMap[id] = l.name;
        });

        const totals = {};
        bookings.forEach((b) => {
          const checkin = b.checkinDate || b.checkInDate;
          if (!checkin) return;
          const checkDate = parseISO(checkin);
          if (!isWithinInterval(checkDate, { start: monthStart, end: monthEnd }))
            return;

          const listingId = b.listingId || b.listing_id;
          if (!listingId) return;

          const amount = parseFloat(b.amountReceived) || 0;
          const source = String(b.bookingSource || b.source || '').toLowerCase();

          if (!totals[listingId]) {
            totals[listingId] = {
              name: listingMap[listingId] || listingId,
              total: 0,
              airbnb: 0,
              bookingcom: 0,
              agoda: 0,
              other: 0,
            };
          }

          totals[listingId].total += amount;
          if (source === 'airbnb') totals[listingId].airbnb += amount;
          else if (source === 'booking.com' || source === 'booking')
            totals[listingId].bookingcom += amount;
          else if (source === 'agoda') totals[listingId].agoda += amount;
          else totals[listingId].other += amount;
        });

        setMonthlyTotals(Object.values(totals));
      } catch (err) {
        console.error('Failed to load monthly totals', err);
        setMonthlyTotals([]);
      }
    }

    fetchTotals();
  }, [currentDate]);


  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        📅 Single Calendar Earnings Report
      </Typography>
      <Typography variant="body1" gutterBottom>
        View bookings and daily earnings in a calendar format per listing.
      </Typography>

      <label style={{ display: 'block', margin: '16px 0', fontWeight: 600 }}>
        Select Listing:
      </label>
      <select
        value={selectedListingId}
        onChange={(e) => setSelectedListingId(e.target.value)}
        style={{ width: 300, padding: 8, fontSize: 16 }}
      >
        {listings.map((l) => (
          <option key={l.listingId} value={String(l.listingId)}>
            {l.name}
          </option>
        ))}
      </select>

      <Box sx={{ height: 600, position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <button onClick={() => setCurrentDate(addMonths(currentDate, -1))}>Prev</button>
          <Typography variant="h6">{format(currentDate, 'MMMM yyyy')}</Typography>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next</button>
        </Box>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: '1fr',
            gap: 1,
            backgroundColor: '#e5e7eb',
            height: '100%',
          }}
        >
          {calendarDates.map((date) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const data = earningsMap.get(dateKey);
            const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');
            const isCurrentMonth =
              date.getMonth() === currentDate.getMonth() &&
              date.getFullYear() === currentDate.getFullYear();
            const highlightStyle = getHighlightStyle(
              data?.total || 0,
              thresholds,
              isCurrentMonth
            );
            return (
              <div
                key={dateKey}
                style={{
                  height: '82%',
                  padding: 8,
                  border: isToday ? '2px solid #2563eb' : '1px solid #ddd',
                  borderRadius: 4,
                  backgroundColor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isCurrentMonth ? 1 : 0.3,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    textAlign: 'right',
                    color: '#374151',
                  }}
                >
                  {format(date, 'd')}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', marginTop: 4 }}>
                  {(data?.earnings || []).map((e, i) => {
                    const amount = Number(e.amount).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    });
                    const tooltip = [
                      `Check-in: ${format(new Date(e.checkinDate), 'dd MMM')}`,
                      `Guest: ${e.guestName}`,
                      `Amount: ₹${amount}`,
                    ].join(' | ');
                    return (
                      <div
                        key={i}
                        style={{
                          fontSize: 14,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={tooltip}
                      >
                        {e.source}: ₹{amount}
                      </div>
                    );
                  })}
                </div>
                {data?.total > 0 && (
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      textAlign: 'right',
                      marginTop: 4,
                      color: '#000',
                      ...highlightStyle,
                    }}
                  >
                    ₹
                    {Number(data.total).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!loading && earnings.length === 0 && (
          <Typography sx={{ mt: 2 }}>No earnings found for this month</Typography>
        )}
      </Box>

      {!loading && earnings.length > 0 && (
        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
          Total:{' '}
          {earnings
            .reduce((sum, val) => sum + (parseFloat(val.total) || 0), 0)
            .toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
        </Typography>
      )}

      {!loading && monthlyTotals.length > 0 && (
        <Box sx={{ mt: 4, overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Monthly Revenue by Listing
          </Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '8px' }}>Listing</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Airbnb</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Booking.com</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Agoda</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Other</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTotals.map((row, idx) => (
                <tr
                  key={idx}
                  style={{ backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white' }}
                >
                  <td style={{ padding: '8px' }}>{row.name}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.total.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.airbnb.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.bookingcom.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.agoda.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.other.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {monthlyTotals.length > 0 && (
                <tr style={{ borderTop: '2px solid #ccc', fontWeight: 'bold' }}>
                  <td style={{ padding: '8px' }}>All Listings</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum, r) => sum + r.total, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum, r) => sum + r.airbnb, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum, r) => sum + r.bookingcom, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum, r) => sum + r.agoda, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum, r) => sum + r.other, 0)
                      .toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
}

export default SingleCalendarEarningsReport;
