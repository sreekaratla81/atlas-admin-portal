import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Box, Typography, CircularProgress } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import axios from 'axios';
import { enUS } from 'date-fns/locale';
import { computeThresholds, getHighlightStyle } from '../utils/percentile';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function SingleCalendarEarningsReport() {
  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [earnings, setEarnings] = useState({});
  const [thresholds, setThresholds] = useState({ top: 0, bottom: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [monthlyTotals, setMonthlyTotals] = useState([]);

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
    setEarnings({});
    axios
      .get(`${import.meta.env.VITE_API_BASE}/reports/calendar-earnings`, {
        params: { listingId: selectedListingId, month },
      })
      .then((res) => {
        let data = res.data;
        if (Array.isArray(data)) {
          const map = {};
          data.forEach((entry) => {
            const date = entry && entry.date;
            if (date) {
              map[date] = {
                amount: parseFloat(entry.amount) || 0,
                source: entry.source || null,
              };
            }
          });
          data = map;
        }

        if (!data || typeof data !== 'object') data = {};

        setEarnings(data);
        setThresholds(computeThresholds(data));
      })
      .catch((err) => {
        console.error('Failed to fetch earnings:', err);
        setEarnings({});
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

  const dayPropGetter = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    const entry = earnings[key];
    const amount = entry && typeof entry === 'object' ? parseFloat(entry.amount) : parseFloat(entry);
    if (isNaN(amount) || amount <= 0) return {};

    if (entry && typeof entry === 'object') {
      const source = String(entry.source || '').toLowerCase();
      if (source === 'airbnb') {
        return { style: { backgroundColor: '#FD5C63' } };
      }
      if (source === 'booking.com') {
        return { style: { backgroundColor: '#499FDD' } };
      }
      if (source === 'agoda') {
        return { style: { backgroundColor: '#FDB812' } };
      }
    }

    return { style: { backgroundColor: '#e6ffed' } };
  };

  const components = {
    month: {
      dateHeader: ({ label, date }) => {
        const key = format(date, 'yyyy-MM-dd');
        const entry = earnings[key];
        const amount = entry && typeof entry === 'object' ? parseFloat(entry.amount) : parseFloat(entry);
        const price = isNaN(amount) ? 0 : amount;
        const display = `₹${price.toLocaleString('en-IN')}`;
        const sameMonth = format(date, 'yyyy-MM') === format(currentDate, 'yyyy-MM');
        const highlightStyle = getHighlightStyle(price, thresholds, sameMonth);
        const source = entry && typeof entry === 'object' ? entry.source : null;
        return (
          <div style={{ textAlign: 'center' }}>
            <div>{label}</div>
            {source && (
              <div style={{ fontSize: '0.75em', textTransform: 'capitalize' }}>
                {source}
              </div>
            )}
            <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>
              <span style={highlightStyle}>{display}</span>
            </div>
          </div>
        );
      },
    },
  };

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
        <Calendar
          localizer={localizer}
          events={[]}
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          defaultView="month"
          views={['month']}
          dayPropGetter={dayPropGetter}
          components={components}
          style={{ height: '100%', border: '1px solid #ccc', borderRadius: 8 }}
        />
        {!loading && Object.keys(earnings).length === 0 && (
          <Typography sx={{ mt: 2 }}>No earnings found for this month</Typography>
        )}
      </Box>

      {!loading && Object.keys(earnings).length > 0 && (
        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
          Total:{' '}
          {Object.values(earnings)
            .reduce((sum, val) => {
              const amt = val && typeof val === 'object' ? parseFloat(val.amount) : parseFloat(val);
              return sum + (isNaN(amt) ? 0 : amt);
            }, 0)
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
