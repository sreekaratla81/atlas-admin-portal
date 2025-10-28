import type { AppRoute } from '@/app/types';
import { lazy } from 'react';

const DashboardPage = lazy(() => import('./ui'));

export const dashboardRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
    meta: { title: 'Dashboard', requiresAuth: true },
    handle: { title: 'Dashboard' },
  },
];
