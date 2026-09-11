import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Fatal Application Crash">
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

export default App;
