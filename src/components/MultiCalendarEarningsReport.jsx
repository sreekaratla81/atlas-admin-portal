import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Typography, Paper, Chip } from '@mui/material';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ReportLayout from './ReportLayout';

const defaultStart = dayjs().startOf('month');

function isBookedOn(listing, date) {
  return listing.bookings.find(b => dayjs(date).isBetween(b.start, b.end, 'day', '[]'));
}

function MultiCalendarEarningsReport() {
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultStart.add(9, 'day'));
  const [listings, setListings] = useState([]);
  const [listingValue, setListingValue] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const arr = [];
    let d = startDate;
    while (d.isBefore(endDate) || d.isSame(endDate, 'day')) {
      arr.push(d.format('YYYY-MM-DD'));
      d = d.add(1, 'day');
    }
    setDays(arr);
  }, [startDate, endDate]);

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
        setListings(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate, listingValue]);
  return (
    <ReportLayout
      title="🗓️ Multi-Calendar Earnings Report"
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

      {/* Table headers */}
      <Box sx={{ display: 'flex', mt: 3, ml: '120px', overflowX: 'auto' }}>
        {days.map((day) => (
          <Box
            key={day}
            sx={{ width: 100, textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}
          >
            {dayjs(day).format('MMM D')}
          </Box>
        ))}
      </Box>

      {/* Listings */}
      {listings.map((listing, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Listing name */}
          <Box sx={{ width: 120, fontWeight: 'bold', borderRight: '1px solid #ccc' }}>
            {listing.name}
          </Box>

          {/* Booking cells */}
          <Box sx={{ display: 'flex', overflowX: 'auto' }}>
            {days.map((day) => {
              const booking = isBookedOn(listing, day);
              return (
                <Box
                  key={day}
                  sx={{
                    width: 100,
                    height: 50,
                    textAlign: 'center',
                    lineHeight: '50px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: booking ? '#d1e7dd' : 'white',
                  }}
                >
                  {booking ? (
                    <Chip label={`$${booking.amount}`} size="small" color="success" />
                  ) : null}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </ReportLayout>
  );
}

export default MultiCalendarEarningsReport;
