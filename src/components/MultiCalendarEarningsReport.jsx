import React from 'react';
import dayjs from 'dayjs';
import { Box, Typography, Paper, Chip } from '@mui/material';

const listings = [
  { name: 'Green Villa', bookings: [{ start: '2025-06-20', end: '2025-06-22', amount: 450 }] },
  { name: 'Ocean Breeze', bookings: [{ start: '2025-06-21', end: '2025-06-24', amount: 800 }] },
  { name: 'Skyline View', bookings: [{ start: '2025-06-25', end: '2025-06-27', amount: 600 }] },
];

const startDate = dayjs('2025-06-20');
const numberOfDays = 10;
const days = [...Array(numberOfDays)].map((_, i) => startDate.add(i, 'day').format('YYYY-MM-DD'));

function isBookedOn(listing, date) {
  return listing.bookings.find(b => dayjs(date).isBetween(b.start, b.end, 'day', '[]'));
}

function MultiCalendarEarningsReport() {
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
