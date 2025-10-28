import { bookingRoutes } from '@/pages/Bookings';
import { dashboardRoutes } from '@/pages/Dashboard';
import { guestRoutes } from '@/pages/Guests';
import { listingRoutes } from '@/pages/Listings';
import { loginRoutes } from '@/pages/Login';
import { propertyRoutes } from '@/pages/Properties';
import { PageShell } from '@/widgets/PageShell';
import { Navigate, useRoutes } from 'react-router-dom';

import { AuthGuard } from './AuthGuard';
import type { AppRoute } from './types';

const protectedChildren: AppRoute[] = [
  { index: true, element: <Navigate to="/dashboard" replace /> },
  ...dashboardRoutes,
  ...propertyRoutes,
  ...listingRoutes,
  ...bookingRoutes,
  ...guestRoutes,
];

export const navigationRoutes = protectedChildren.filter(
  (route) => route.path && route.meta?.title,
);

const rootRoute: AppRoute = {
  path: '/',
  element: (
    <AuthGuard>
      <PageShell />
    </AuthGuard>
  ),
  handle: {
    navItems: navigationRoutes.map((route) => ({
      path: route.path!,
      title: route.meta?.title ?? '',
    })),
    title: 'Home',
  },
  children: protectedChildren,
};

const baseRoutes: AppRoute[] = [
  rootRoute,
  ...loginRoutes,
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export function AppRoutes() {
  return useRoutes(baseRoutes);
}

export const appRoutes = baseRoutes;

export default appRoutes;
