import React, { useEffect, useState } from 'react';
import { MonoLabel } from './Typography';

interface LoadingScreenProps {
  progress?: number;
  label?: string;
  subtext?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress = 100,
  label = 'INITIALIZING 3D ENGINE',
  subtext = 'Compiling shaders & assembling spatial trajectory...',
}) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Quick, responsive fade-out once mounted and active
    const timer = setTimeout(() => {
      setFading(true);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030305] p-6 select-none font-mono transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-xs w-full">
        {/* Subtle geometric pulsing reticle */}
        <div className="relative mb-6 flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 border border-white/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="h-2 w-2 bg-white rounded-full" />
        </div>

        <MonoLabel className="mb-2 tracking-[0.2em] text-center text-foreground text-[10px]">
          {label}
        </MonoLabel>

        <p className="text-[10px] text-muted-foreground text-center mb-6">
          {subtext}
        </p>

        {/* Hairline progress bar */}
        <div className="w-full h-1 bg-white/[0.08] rounded-none overflow-hidden mb-2">
          <div
            className="h-full bg-white transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        <div className="w-full flex justify-between text-[9px] text-muted-foreground tracking-wider">
          <span>GRAPHICS CONTEXT: ACTIVE</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};
