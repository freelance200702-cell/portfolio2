import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { JourneyPage } from '@/pages/JourneyPage';
import { LazyWrapper } from '@/components/common/LazyWrapper';

// Code-split admin bundle to isolate CMS code from public visitors
const AdminLoginPage = lazy(() =>
  import('@/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminLayout = lazy(() =>
  import('@/components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminGuard = lazy(() =>
  import('@/components/admin/AdminGuard').then((m) => ({ default: m.AdminGuard }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <JourneyPage />,
      },
      {
        path: 'project/:slug',
        element: <JourneyPage />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <LazyWrapper>
        <AdminLoginPage />
      </LazyWrapper>
    ),
  },
  {
    path: '/admin',
    element: (
      <LazyWrapper>
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      </LazyWrapper>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
    ],
  },
  {
    path: '/404',
    element: (
      <LazyWrapper>
        <NotFoundPage />
      </LazyWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/404" replace />,
  },
]);
