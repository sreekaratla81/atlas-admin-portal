import type { AppRoute } from '@/app/types';
import { lazy } from 'react';

const BookingsPage = lazy(() => import('./ui'));

export const bookingRoutes: AppRoute[] = [
  {
    path: '/bookings',
    element: <BookingsPage />,
    meta: { title: 'Bookings', requiresAuth: true },
    handle: { title: 'Bookings' },
  },
];
