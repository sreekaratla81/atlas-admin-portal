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

  const fetchEarnings = (listingId) => {
    if (!listingId) return;
    const month = format(currentDate, 'yyyy-MM');
    setLoading(true);
    setEarnings({});
    axios
      .get(`${import.meta.env.VITE_API_BASE}/reports/calendar-earnings`, {
        params: { listingId, month }
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
  };

  const handleListingChange = (e) => {
    const id = e.target.value;
    setSelectedListingId(id);
    fetchEarnings(id);
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE}/admin/reports/listings`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setListings(data);
        if (data.length > 0) {
          const defaultListing =
            data.find((l) => {
              const name = l.name.toLowerCase();
              return name.includes('ph') || name.includes('penthouse');
            }) || data[0];
          setSelectedListingId(defaultListing.id);
          fetchEarnings(defaultListing.id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedListingId) {
      fetchEarnings(selectedListingId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

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
        onChange={handleListingChange}
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
