import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-4 sm:p-6 flex items-center justify-between">
      {/* Brand & Mission Telemetry */}
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="h-6 w-1 bg-white/60" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tracking-widest text-foreground">
              DEVELOPER EXPEDITION
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground block">
            3D SYSTEMS & APPLIED AI PORTFOLIO
          </span>
        </div>
      </div>

      {/* Admin CMS Portal Link */}
      <div className="pointer-events-auto flex items-center gap-2">
        <Link
          to="/admin"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-white/[0.08] bg-black/40 backdrop-blur-md font-mono text-[10px] tracking-wider text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
          title="Private Management Dashboard"
        >
          <Shield className="h-3 w-3 text-muted-foreground" />
          <span>MANAGEMENT</span>
        </Link>
      </div>
    </header>
  );
};
