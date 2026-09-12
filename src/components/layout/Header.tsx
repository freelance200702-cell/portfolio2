import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 pointer-events-none p-5 sm:p-7 flex items-center justify-between">
      {/* Brand Identification */}
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="h-5 w-[1.5px] bg-white/40" />
        <div className="flex flex-col">
          <span className="font-sans text-xs font-semibold tracking-wider text-foreground">
            ADEL R.
          </span>
          <span className="text-[10px] tracking-widest text-muted-foreground/80 uppercase font-sans">
            Spatial Works & Systems
          </span>
        </div>
      </div>

      {/* Discreet Admin / Settings Access */}
      <div className="pointer-events-auto flex items-center gap-2">
        <Link
          to="/admin"
          className="flex items-center gap-1.5 px-3 py-1 rounded-sm border border-white/[0.06] bg-black/30 hover:bg-white/[0.05] backdrop-blur-md text-[10px] tracking-wider text-muted-foreground hover:text-foreground hover:border-white/15 transition-all font-sans"
          title="Curator & Project Management"
        >
          <Shield className="h-3 w-3 text-muted-foreground/70" />
          <span>Admin</span>
        </Link>
      </div>
    </header>
  );
};
