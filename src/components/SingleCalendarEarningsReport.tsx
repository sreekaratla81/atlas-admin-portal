import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { api, asArray } from '@/lib/api';
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  addMonths,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { computeThresholds, getHighlightStyle } from '../utils/percentile';
import { safeFind } from '../utils/array';

const SOURCE_COLORS: Record<string, string> = {
  airbnb: 'var(--accent-primary)',
  agoda: 'var(--status-warning-strong)',
  'walk-in': 'var(--status-error-strong)',
  'booking.com': 'var(--accent-strong)',
  booking: 'var(--accent-strong)',
  makemytrip: 'var(--status-info-strong)',
  'make my trip': 'var(--status-info-strong)',
  mmt: 'var(--status-info-strong)',
};

function SingleCalendarEarningsReport() {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>('');
  const [earnings, setEarnings] = useState<any[]>([]);
  const [thresholds, setThresholds] = useState({ top: 0, bottom: 0 });
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [monthlyTotals, setMonthlyTotals] = useState<any[]>([]);

  const earningsMap = React.useMemo(() => {
    const map = new Map<string, any>();
    (earnings || []).forEach((entry: any) => {
      if (entry?.date) {
        const dateKey = entry.date.split('T')[0];
        map.set(dateKey, entry);
      }
    });
    return map;
  }, [earnings]);

  const calendarDates = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const dates: Date[] = [];
    let day = start;
    while (day <= end) {
      dates.push(day);
      day = addDays(day, 1);
    }
    return dates;
  }, [currentDate]);

  const calendarTotal = React.useMemo(() => {
    return earnings
      .filter((val: any) => {
        const d = new Date(val.date);
        return (
          d.getFullYear() === currentDate.getFullYear() &&
          d.getMonth() === currentDate.getMonth()
        );
      })
      .reduce((sum: number, val: any) => sum + (parseFloat(val.total) || 0), 0);
  }, [earnings, currentDate]);

  useEffect(() => {
    api
      .get(`/admin/reports/listings`)
      .then((res: any) => {
        const data = asArray(res.data, 'listings');
        const validListings = data.filter((l: any) => l?.listingId && l?.name);
        setListings(validListings);

        const defaultListing =
          safeFind(validListings, (l: any) => l.name.toLowerCase().includes('ph')) ||
          validListings[0];

        if (defaultListing?.listingId) {
          setSelectedListingId(String(defaultListing.listingId));
        }
      })
      .catch((err: any) => console.error('Failed to fetch listings:', err));
  }, []);

  useEffect(() => {
    if (!selectedListingId) return;
    const month = format(currentDate, 'yyyy-MM');
    setLoading(true);
    setEarnings([]);
    api
      .get(`/reports/calendar-earnings`, {
        params: { listingId: selectedListingId, month },
      })
      .then((res: any) => {
        const data = asArray(res.data, 'earnings');
        setEarnings(data);

        const totalsObj: Record<string, { amount: number }> = {};
        data.forEach((entry: any) => {
          if (entry?.date) {
            const dateKey = entry.date.split('T')[0];
            totalsObj[dateKey] = { amount: entry.total || 0 };
          }
        });
        setThresholds(computeThresholds(totalsObj));
      })
      .catch((err: any) => {
        console.error('Failed to fetch earnings:', err);
        setEarnings([]);
        setThresholds({ top: 0, bottom: 0 });
      })
      .finally(() => setLoading(false));
  }, [selectedListingId, currentDate]);

  useEffect(() => {
    async function fetchTotals() {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      try {
        const [bookRes, listRes] = await Promise.all([
            api.get(`/admin/reports/bookings`),
            api.get(`/admin/reports/listings`),
          ]);

        const bookings = asArray(bookRes.data, 'bookings');
        const listData = asArray(listRes.data, 'listings');
        const listingMap: Record<string, string> = {};
        listData.forEach((l: any) => {
          const id = l.listingId || l.id;
          if (id) listingMap[id] = l.name;
        });

        const totals: Record<string, any> = {};
        bookings.forEach((b: any) => {
          const checkin = b.checkinDate || b.checkInDate;
          if (!checkin) return;
          const checkDate = parseISO(checkin);
          if (!isWithinInterval(checkDate, { start: monthStart, end: monthEnd }))
            return;

          const listingId = b.listingId || b.listing_id;
          if (!listingId) return;

          const amount = parseFloat(b.amountReceived) || 0;
          const source = String(b.bookingSource || b.source || '').toLowerCase();

          if (!totals[listingId]) {
            totals[listingId] = {
              name: listingMap[listingId] || listingId,
              total: 0,
              airbnb: 0,
              bookingcom: 0,
              agoda: 0,
              makemytrip: 0,
              other: 0,
            };
          }

          totals[listingId].total += amount;
          if (source === 'airbnb') totals[listingId].airbnb += amount;
          else if (source === 'booking.com' || source === 'booking')
            totals[listingId].bookingcom += amount;
          else if (source === 'agoda') totals[listingId].agoda += amount;
          else if (
            source === 'makemytrip' ||
            source === 'make my trip' ||
            source === 'mmt'
          )
            totals[listingId].makemytrip += amount;
          else totals[listingId].other += amount;
        });

        setMonthlyTotals(Object.values(totals));
      } catch (err) {
        console.error('Failed to load monthly totals', err);
        setMonthlyTotals([]);
      }
    }

    fetchTotals();
  }, [currentDate]);


  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        📅 Single Calendar Earnings Report
      </Typography>
      <Typography variant="body1" gutterBottom>
        View bookings and daily earnings in a calendar format per listing.
      </Typography>

      <label style={{ display: 'block', margin: '16px 0', fontWeight: 600 }}>
        Select Listing:
      </label>
      <select
        value={selectedListingId}
        onChange={(e: any) => setSelectedListingId(e.target.value)}
        style={{ width: 300, padding: 8, fontSize: 16 }}
      >
        {listings.map((l: any) => (
          <option key={l.listingId} value={String(l.listingId)}>
            {l.name}
          </option>
        ))}
      </select>

      <Box sx={{ position: 'relative' }}>
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
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <button onClick={() => setCurrentDate(addMonths(currentDate, -1))}>Prev</button>
          <Typography variant="h6">{format(currentDate, 'MMMM yyyy')}</Typography>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>Next</button>
        </Box>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridAutoRows: '1fr',
            gap: 1,
            backgroundColor: 'var(--bg-subtle)',
            height: '100%',
          }}
        >
          {calendarDates.map((date: Date) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const data = earningsMap.get(dateKey);
            const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');
            const isCurrentMonth =
              date.getMonth() === currentDate.getMonth() &&
              date.getFullYear() === currentDate.getFullYear();
            const highlightStyle = getHighlightStyle(
              data?.total || 0,
              thresholds,
              isCurrentMonth
            );
            const totalAmount = Number(data?.total) || 0;
            const isLowRevenue = totalAmount < 2000;
            return (
              <div
                key={dateKey}
                onClick={() => {
                  /* placeholder for modal */
                }}
                style={{
                  height: '82%',
                  padding: 8,
                  border: isToday
                    ? `2px solid var(--accent-primary)`
                    : `1px solid var(--border-subtle)`,
                  borderRadius: 4,
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isCurrentMonth ? 1 : 0.3,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    textAlign: 'right',
                    color: 'var(--text-strong)',
                  }}
                >
                  {format(date, 'd')}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', marginTop: 4 }}>
                  {(data?.earnings || []).map((e: any, i: number) => {
                    const amount = Number(e.amount).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    });
                    const color =
                      SOURCE_COLORS[String(e.source).toLowerCase()] ||
                      'var(--text-muted)';
                    const info = [
                      e.checkinDate
                        ? format(new Date(e.checkinDate), 'dd MMM')
                        : null,
                      e.guestName,
                    ]
                      .filter(Boolean)
                      .join(' - ');
                    return (
                      <div
                        key={i}
                        style={{
                          fontSize: 14,
                          marginBottom: 4,
                          paddingLeft: 4,
                          borderLeft: `4px solid ${color}`,
                        }}
                      >
                        <div
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {e.source}: ₹{amount}
                        </div>
                        {info && (
                          <div
                            style={{
                              fontSize: 10,
                              color: 'var(--text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {info}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {totalAmount > 0 && (
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      textAlign: 'right',
                      marginTop: 4,
                      ...highlightStyle,
                      color: isLowRevenue
                        ? 'var(--status-error-strong)'
                        : highlightStyle.color || 'var(--text-primary)',
                    }}
                  >
                    ₹
                    {totalAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {!loading && earnings.length === 0 && (
          <Typography sx={{ mt: 2 }}>No earnings found for this month</Typography>
        )}
      </Box>

      {!loading && earnings.length > 0 && (
        <Typography sx={{ mt: 2, fontWeight: 'bold' }}>
          Total:{' '}
          {calendarTotal.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
          })}
        </Typography>
      )}

      {!loading && monthlyTotals.length > 0 && (
        <Box sx={{ mt: 4, overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Monthly Revenue by Listing
          </Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '8px' }}>Listing</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Airbnb</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Booking.com</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Agoda</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>MakeMyTrip</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Other</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTotals.map((row: any, idx: number) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                  }}
                >
                  <td style={{ padding: '8px' }}>{row.name}</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.total.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.airbnb.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.bookingcom.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.agoda.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.makemytrip.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹{row.other.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}

              {monthlyTotals.length > 0 && (
                <tr style={{ borderTop: '2px solid var(--border-strong)', fontWeight: 'bold' }}>
                  <td style={{ padding: '8px' }}>All Listings</td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum: number, r: any) => sum + r.total, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum: number, r: any) => sum + r.airbnb, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum: number, r: any) => sum + r.bookingcom, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum: number, r: any) => sum + r.agoda, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum: number, r: any) => sum + r.makemytrip, 0)
                      .toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'right' }}>
                    ₹
                    {monthlyTotals
                      .reduce((sum: number, r: any) => sum + r.other, 0)
                      .toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
}

export default SingleCalendarEarningsReport;
