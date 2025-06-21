import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Box, Typography } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parseISO } from 'date-fns';

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

// Sample calendar data (earnings + bookings)
const events = [
  {
    title: 'Green Villa: $250',
    start: new Date('2025-06-20'),
    end: new Date('2025-06-20'),
    listing: 'Green Villa',
    amount: 250,
  },
  {
    title: 'Ocean Breeze: $400',
    start: new Date('2025-06-20'),
    end: new Date('2025-06-22'),
    listing: 'Ocean Breeze',
    amount: 800,
  },
  {
    title: 'Skyline View: $300',
    start: new Date('2025-06-23'),
    end: new Date('2025-06-24'),
    listing: 'Skyline View',
    amount: 600,
  },
];

function SingleCalendarEarningsReport() {
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
