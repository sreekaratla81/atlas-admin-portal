import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { Box, Typography, TextField, MenuItem } from '@mui/material';
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
  const [selectedListing, setSelectedListing] = useState('');
  const [earnings, setEarnings] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE}/admin/reports/listings`)
      .then((res) => setListings(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedListing) return;
    const month = format(currentDate, 'yyyy-MM');
    axios
      .get(`${import.meta.env.VITE_API_BASE}/api/reports/calendar-earnings`, {
        params: { listingId: selectedListing, month }
      })
      .then((res) => {
        const map = {};
        (Array.isArray(res.data) ? res.data : []).forEach((d) => {
          map[d.date] = d.amount;
        });
        setEarnings(map);
      })
      .catch((err) => {
        console.error(err);
        setEarnings({});
      });
  }, [selectedListing, currentDate]);

  const dayPropGetter = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    const amount = earnings[key];
    if (amount > 0) {
      return { style: { backgroundColor: '#e6ffed' } };
    }
    return {};
  };

  const components = {
    month: {
      dateHeader: ({ label, date }) => {
        const key = format(date, 'yyyy-MM-dd');
        const amount = earnings[key];
        return (
          <div style={{ textAlign: 'center' }}>
            <div>{label}</div>
            <div style={{ fontSize: '0.75em' }}>
              {amount ? `₹${amount}` : '₹0'}
            </div>
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
        value={selectedListing}
        onChange={(e) => setSelectedListing(e.target.value)}
        sx={{ my: 2, width: 300 }}
      >
        {listings.map((l) => (
          <MenuItem key={l.id} value={l.id}>
            {l.name}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ height: 600 }}>
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
