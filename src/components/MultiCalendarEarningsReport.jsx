import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { api, asArray } from '@/lib/api';
import { safeFind } from '../utils/array';

const startDate = dayjs().startOf('month');
const numberOfDays = 10;
const days = [...Array(numberOfDays)].map((_, i) => startDate.add(i, 'day').format('YYYY-MM-DD'));

function isBookedOn(listing, date) {
  return safeFind(listing?.bookings, (b) =>
    dayjs(date).isBetween(b.start, b.end, 'day', '[]')
  );
}

function MultiCalendarEarningsReport() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
        try {
          const res = await api.get(
            `/admin/reports/bookings/calendar`
          );
        setListings(asArray(res.data, 'listings'));
      } catch (err) {
        console.warn('Falling back to client aggregation', err);
        try {
            const [listRes, bookRes] = await Promise.all([
              api.get(
                `/admin/reports/listings`
              ),
              api.get(
                `/admin/reports/bookings`
              )
            ]);
          const listData = asArray(listRes.data, 'listings');
          const bookData = asArray(bookRes.data, 'bookings');
          const map = {};
          const listObjects = listData.map((l) => ({
            id: l.id,
            name: l.name,
            bookings: []
          }));
          listObjects.forEach((l) => {
            map[l.id] = l;
          });
          bookData.forEach((b) => {
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
          setError('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <Typography>Loading report...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

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
            sx={{
              width: 100,
              textAlign: 'center',
              fontWeight: 'bold',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {dayjs(day).format('MMM D')}
          </Box>
        ))}
      </Box>

      {/* Listings */}
      {listings.map((listing, idx) => (
        <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Listing name */}
          <Box
            sx={{
              width: 120,
              fontWeight: 'bold',
              borderRight: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
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
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: booking ? 'var(--status-success-bg)' : 'var(--bg-surface)',
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
