import type { AppRoute } from '@/app/types';
import { lazy } from 'react';

const PropertiesPage = lazy(() => import('./ui'));

export const propertyRoutes: AppRoute[] = [
  {
    path: '/properties',
    element: <PropertiesPage />,
    meta: { title: 'Properties', requiresAuth: true },
    handle: { title: 'Properties' },
  },
];
