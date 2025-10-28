import type { AppRoute } from '@/app/types';
import { lazy } from 'react';

const ListingsPage = lazy(() => import('./ui'));

export const listingRoutes: AppRoute[] = [
  {
    path: '/listings',
    element: <ListingsPage />,
    meta: { title: 'Listings', requiresAuth: true },
    handle: { title: 'Listings' },
  },
];
