import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Typography, Paper, Chip } from '@mui/material';
import axios from 'axios';

const startDate = dayjs().startOf('month');
const numberOfDays = 10;
const days = [...Array(numberOfDays)].map((_, i) => startDate.add(i, 'day').format('YYYY-MM-DD'));

function isBookedOn(listing, date) {
  return listing.bookings.find(b => dayjs(date).isBetween(b.start, b.end, 'day', '[]'));
}

function MultiCalendarEarningsReport() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE}/reports/bookings/calendar`
        );
        setListings(res.data);
      } catch (err) {
        console.warn('Falling back to client aggregation', err);
        try {
          const [listRes, bookRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE}/listings`),
            axios.get(`${import.meta.env.VITE_API_BASE}/bookings`)
          ]);
          const map = {};
          const listObjects = listRes.data.map((l) => ({
            id: l.id,
            name: l.name,
            bookings: []
          }));
          listObjects.forEach((l) => {
            map[l.id] = l;
          });
          bookRes.data.forEach((b) => {
            const obj = map[b.listingId];
            if (obj) {
              obj.bookings.push({
                start: b.checkinDate,
                end: b.checkoutDate,
                amount: parseFloat(b.amountReceived) || 0
              });
            }
          });
          setListings(listObjects);
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
        🗓️ Multi-Calendar Earnings Report
      </Typography>
      <Typography variant="body1" gutterBottom>
        Horizontal scroll view of bookings across listings.
      </Typography>

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
    </Box>
  );
}

export default MultiCalendarEarningsReport;
