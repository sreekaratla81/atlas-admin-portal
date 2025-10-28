import type { AppRoute } from '@/app/types';
import { lazy } from 'react';

const GuestsPage = lazy(() => import('./ui'));

export const guestRoutes: AppRoute[] = [
  {
    path: '/guests',
    element: <GuestsPage />,
    meta: { title: 'Guests', requiresAuth: true },
    handle: { title: 'Guests' },
  },
];
