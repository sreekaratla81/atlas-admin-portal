import type { RouteObject } from 'react-router-dom';

export interface AppRouteMeta {
  title: string;
  requiresAuth?: boolean;
}

export interface AppRoute extends Omit<RouteObject, 'children'> {
  path: string;
  meta?: AppRouteMeta;
  children?: AppRoute[];
}
