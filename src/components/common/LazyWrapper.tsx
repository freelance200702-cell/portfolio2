import React, { Suspense } from 'react';
import { LoadingScreen } from './LoadingScreen';

interface LazyWrapperProps {
  children: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ children }) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};
