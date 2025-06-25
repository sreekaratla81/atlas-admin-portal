import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Box, Typography } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

// Setup localizer using date-fns
import { dateFnsLocalizer } from 'react-big-calendar';
import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: () => new Date(),
  getDay: date => date.getDay(),
  locales,
});

function SingleCalendarEarningsReport() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE}/admin/reports/bookings/calendar`
        );
        setEvents(
          res.data.map((e) => ({
            ...e,
            start: new Date(e.start),
            end: new Date(e.end)
          }))
        );
      } catch (err) {
        console.warn('Falling back to client aggregation', err);
        try {
          const [bookRes, listRes] = await Promise.all([
            axios.get(
              `${import.meta.env.VITE_API_BASE}/admin/reports/bookings`
            ),
            axios.get(
              `${import.meta.env.VITE_API_BASE}/admin/reports/listings`
            )
          ]);
          const listingMap = {};
          listRes.data.forEach((l) => {
            listingMap[l.id] = l.name;
          });
          setEvents(
            bookRes.data.map((b) => ({
              title: `${listingMap[b.listingId] || b.listingId}: $${b.amountReceived}`,
              start: new Date(b.checkinDate),
              end: new Date(b.checkoutDate),
              listing: listingMap[b.listingId] || b.listingId,
              amount: parseFloat(b.amountReceived) || 0
            }))
          );
        } catch (err2) {
          console.error(err2);
        }
      }
    }
    fetchData();
  }, []);
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        📅 Single Calendar Earnings Report
      </Typography>
      <Typography variant="body1" gutterBottom>
        View bookings and daily earnings in a calendar format per listing.
      </Typography>

      <Box sx={{ height: 600, mt: 3 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={['month', 'week', 'day']}
          style={{ height: '100%', border: '1px solid #ccc', borderRadius: 8 }}
          tooltipAccessor={event => `${event.listing}: $${event.amount}`}
        />
      </Box>
    </Box>
  );
}

export default SingleCalendarEarningsReport;
