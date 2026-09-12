import React from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useUIStore } from '@/stores/useUIStore';
import { ArrowDown, Compass, Eye } from 'lucide-react';

export const IntroOverlay: React.FC = () => {
  const currentProgress = useJourneyStore((s) => s.currentProgress);
  const startJourney = useJourneyStore((s) => s.startJourney);
  const isTouchDevice = useUIStore((s) => s.isTouchDevice);
  const toggleReduced3D = useUIStore((s) => s.toggleReduced3D);

  // Dissolve intro smoothly as journey moves past 0.05
  const opacity = Math.max(0, Math.min(1, 1 - currentProgress / 0.05));
  const isVisible = opacity > 0.01;

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-mono transition-opacity duration-300"
      style={{
        opacity,
        pointerEvents: opacity > 0.3 ? 'auto' : 'none',
      }}
    >
      <div className="max-w-2xl w-full flex flex-col items-center text-center">
        {/* 1. Technical Telemetry Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 sm:mb-6 rounded-sm border border-white/[0.08] bg-black/40 backdrop-blur-md text-[9px] sm:text-[10px] text-muted-foreground tracking-[0.2em] sm:tracking-[0.25em]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>PORTFOLIO SPECIFICATION // 2026</span>
        </div>

        {/* 2. Developer Name */}
        <h1 className="text-3xl sm:text-6xl font-bold tracking-tight text-foreground mb-2 sm:mb-3 font-sans">
          ADEL R.
        </h1>

        {/* 3. Core Disciplines */}
        <div className="text-[11px] sm:text-sm font-mono tracking-widest text-primary/90 mb-3 sm:mb-4 uppercase">
          DEVELOPER <span className="text-white/30">/</span> GAME DEV{' '}
          <span className="text-white/30">/</span> AI SYSTEMS{' '}
          <span className="text-white/30">/</span> 3D GRAPHICS
        </div>

        {/* 4. Concise Capability Statement */}
        <p className="text-xs sm:text-sm font-sans text-muted-foreground max-w-lg leading-relaxed mb-6 sm:mb-8 px-2">
          An interactive 3D spatial developer journey featuring real-time procedural landmarks,
          camera choreography, and administration systems.
        </p>

        {/* 5. Primary Cinematic CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4 sm:px-0">
          <button
            onClick={startJourney}
            className="w-full sm:w-auto justify-center group relative inline-flex items-center gap-3 px-6 py-3 rounded-sm bg-foreground text-background font-mono text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]"
          >
            <Compass className="h-4 w-4 text-background group-hover:rotate-90 transition-transform duration-300" />
            <span>INITIALIZE EXPEDITION</span>
            <span className="text-black/40 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Accessible Reduced 3D Switch */}
          <button
            onClick={toggleReduced3D}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-white/[0.1] hover:border-white/30 bg-black/40 text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-wider transition-all"
            title="Browse low-power reduced-3D stream view"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Accessible Stream</span>
          </button>
        </div>

        {/* 6. Subtle Navigation Hint */}
        <div className="mt-8 sm:mt-14 flex flex-col items-center gap-2 text-[9px] sm:text-[10px] tracking-[0.2em] text-muted-foreground/70">
          <span>{isTouchDevice ? 'SWIPE UP TO TRAVERSE' : 'OR SCROLL DOWN TO TRAVERSE'}</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce text-muted-foreground/50" />
        </div>
      </div>
    </div>
  );
};
