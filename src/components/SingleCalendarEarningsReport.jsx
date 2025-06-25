import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Box, Typography } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ReportLayout from './ReportLayout';

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
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [listings, setListings] = useState([]);
  const [listingValue, setListingValue] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE}/listings`)
      .then(res => setListings(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          start: startDate.format('YYYY-MM-DD'),
          end: endDate.format('YYYY-MM-DD')
        });
        if (listingValue && listingValue.id) {
          params.set('listingId', listingValue.id);
        }
        const url = `${import.meta.env.VITE_API_BASE}/reports/bookings/calendar?${params.toString()}`;
        const res = await axios.get(url);
        const listingMap = {};
        listings.forEach(l => { listingMap[l.id] = l.name; });
        setEvents(
          res.data.map(b => ({
            title: `${listingMap[b.listingId] || b.listingId}: $${b.amount}`,
            start: new Date(b.start),
            end: new Date(b.end),
            listing: listingMap[b.listingId] || b.listingId,
            amount: parseFloat(b.amount) || 0
          }))
        );
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate, listingValue, listings]);
  return (
    <ReportLayout
      title="📅 Single Calendar Earnings Report"
      startDate={startDate}
      endDate={endDate}
      setStartDate={setStartDate}
      setEndDate={setEndDate}
      listings={listings}
      listingValue={listingValue}
      setListingValue={setListingValue}
      loading={loading}
      error={error}
    >
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
    </ReportLayout>
  );
}

export default SingleCalendarEarningsReport;
