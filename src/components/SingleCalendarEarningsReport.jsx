import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Box, Typography, TextField, MenuItem, CircularProgress } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import axios from 'axios';

import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function SingleCalendarEarningsReport() {
  const [listings, setListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [earnings, setEarnings] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE}/admin/reports/listings`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setListings(data);
        if (!selectedListingId && data.length > 0) {
          setSelectedListingId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedListingId && listings.length > 0) {
      setSelectedListingId(listings[0].id);
    }
  }, [listings]);

  useEffect(() => {
    if (!selectedListingId) return;
    const month = format(currentDate, 'yyyy-MM');
    setLoading(true);
    setEarnings({});
    axios
      .get(`${import.meta.env.VITE_API_BASE}/reports/calendar-earnings`, {
        params: { listingId: selectedListingId, month }
      })
      .then((res) => {
        const data = res.data && typeof res.data === 'object' ? res.data : {};
        setEarnings(data);
      })
      .catch((err) => {
        console.error(err);
        setEarnings({});
      })
      .finally(() => setLoading(false));
  }, [selectedListingId, currentDate]);

  const dayPropGetter = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    const amount = parseFloat(earnings[key]);
    if (amount > 0) {
      return { style: { backgroundColor: '#e6ffed' } };
    }
    return {};
  };

  const components = {
    month: {
      dateHeader: ({ label, date }) => {
        const key = format(date, 'yyyy-MM-dd');
        const amount = parseFloat(earnings[key]);
        const display =
          amount && !Number.isNaN(amount)
            ? amount.toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
              })
            : '₹0';
        return (
          <div style={{ textAlign: 'center' }}>
            <div>{label}</div>
            <div style={{ fontSize: '0.75em' }}>{display}</div>
          </div>
        );
      }
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        📅 Single Calendar Earnings Report
      </Typography>
      <Typography variant="body1" gutterBottom>
        View bookings and daily earnings in a calendar format per listing.
      </Typography>

      <TextField
        select
        label="Listing"
        value={selectedListingId}
        onChange={(e) => setSelectedListingId(e.target.value)}
        sx={{ my: 2, width: 300 }}
      >
        {listings.map((l) => (
          <MenuItem key={l.id} value={l.id}>
            {l.name}
          </MenuItem>
        ))}
      </TextField>

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
              zIndex: 1
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
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={['month']}
          dayPropGetter={dayPropGetter}
          components={components}
          style={{ height: '100%', border: '1px solid #ccc', borderRadius: 8 }}
        />
      </Box>
    </Box>
  );
}

export default SingleCalendarEarningsReport;
