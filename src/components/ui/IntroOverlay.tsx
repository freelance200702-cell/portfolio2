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
      className="fixed inset-0 z-20 flex flex-col items-center justify-center p-6 select-none transition-opacity duration-500"
      style={{
        opacity,
        pointerEvents: opacity > 0.3 ? 'auto' : 'none',
      }}
    >
      <div className="max-w-2xl w-full flex flex-col items-center text-center">
        {/* Subtitle / Discipline pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md text-[11px] text-muted-foreground tracking-[0.25em] uppercase font-sans">
          <span>Spatial Journey & Architecture</span>
        </div>

        {/* Developer / Artist Name */}
        <h1 className="text-4xl sm:text-7xl font-light tracking-tight text-foreground mb-4 font-sans">
          ADEL R.
        </h1>

        {/* Disciplines */}
        <p className="text-xs sm:text-sm font-sans tracking-widest text-muted-foreground/80 max-w-md uppercase mb-8 leading-relaxed">
          3D Graphics · Systems Engine · Machine Learning
        </p>

        {/* Primary Cinematic CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto px-4 sm:px-0">
          <button
            onClick={startJourney}
            className="w-full sm:w-auto justify-center group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-black font-sans text-xs font-medium tracking-wider hover:bg-white/90 transition-all shadow-[0_4px_25px_rgba(255,255,255,0.12)] active:scale-[0.98]"
          >
            <Compass className="h-4 w-4 text-black group-hover:rotate-45 transition-transform duration-500" />
            <span>Begin Journey</span>
            <span className="text-black/40 group-hover:translate-x-0.5 transition-transform">→</span>
          </button>

          {/* Accessible View Option */}
          <button
            onClick={toggleReduced3D}
            className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-white/[0.08] hover:border-white/20 bg-black/20 text-muted-foreground hover:text-foreground text-xs font-sans tracking-wide transition-all"
            title="Browse low-power reduced-3D stream view"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Catalog View</span>
          </button>
        </div>

        {/* Subtle Navigation Hint */}
        <div className="mt-12 sm:mt-16 flex flex-col items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground/60 font-sans">
          <span>{isTouchDevice ? 'SWIPE TO DISCOVER' : 'SCROLL TO EXPLORE'}</span>
          <ArrowDown className="h-3 w-3 animate-bounce text-muted-foreground/40" />
        </div>
      </div>
    </div>
  );
};
