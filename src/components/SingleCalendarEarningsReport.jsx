import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Box, Typography, CircularProgress } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import axios from 'axios';
import { enUS } from 'date-fns/locale';
import { computeThresholds, getHighlightClass } from '../utils/percentile';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function SingleCalendarEarningsReport() {
  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [earnings, setEarnings] = useState({});
  const [thresholds, setThresholds] = useState({ top: 0, bottom: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

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
        const data = res.data && typeof res.data === 'object' ? res.data : {};
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

  const dayPropGetter = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    const amount = parseFloat(earnings[key]);
    return amount > 0 ? { style: { backgroundColor: '#e6ffed' } } : {};
  };

  const components = {
    month: {
      dateHeader: ({ label, date }) => {
        const key = format(date, 'yyyy-MM-dd');
        const amount = parseFloat(earnings[key]);
        const price = isNaN(amount) ? 0 : amount;
        const display = `₹${price.toLocaleString('en-IN')}`;
        const highlightClass = getHighlightClass(price, thresholds);
        return (
          <div style={{ textAlign: 'center' }}>
            <div>{label}</div>
            <div style={{ fontSize: '0.75em' }}>
              <span className={highlightClass}>{display}</span>
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
            .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
            .toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
        </Typography>
      )}
    </Box>
  );
}

export default SingleCalendarEarningsReport;
