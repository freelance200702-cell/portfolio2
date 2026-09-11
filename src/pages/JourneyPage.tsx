import React from 'react';
import { HUD } from '@/components/ui/HUD';

export const JourneyPage: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* 2D Interactive HUD Overlay */}
      <HUD />
    </div>
  );
};
