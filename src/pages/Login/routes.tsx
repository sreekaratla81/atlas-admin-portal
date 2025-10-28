import type { AppRoute } from '@/app/types';
import { lazy } from 'react';

const LoginPage = lazy(() => import('./ui'));

export const loginRoutes: AppRoute[] = [
  {
    path: '/login',
    element: <LoginPage />,
    meta: { title: 'Login' },
    handle: { title: 'Login' },
  },
];
