import React from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { DISCIPLINES } from '@/data/aboutSkillsData';
import { X, ChevronLeft, ChevronRight, ExternalLink, Cpu, Layers } from 'lucide-react';

export const ObservatoryOverlay: React.FC = () => {
  const cameraMode = useJourneyStore((s) => s.cameraMode);
  const selectedDiscipline = useJourneyStore((s) => s.selectedDiscipline);
  const selectDiscipline = useJourneyStore((s) => s.selectDiscipline);
  const closeInspection = useJourneyStore((s) => s.closeInspection);
  const selectProjectBySlug = useJourneyStore((s) => s.selectProjectBySlug);

  const isVisible = cameraMode === 'observatory';

  if (!isVisible) return null;

  const currentDisc = DISCIPLINES.find((d) => d.id === selectedDiscipline) || DISCIPLINES[0];
  const currentIdx = DISCIPLINES.findIndex((d) => d.id === currentDisc.id);

  const handleNext = () => {
    const nextIdx = (currentIdx + 1) % DISCIPLINES.length;
    selectDiscipline(DISCIPLINES[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = (currentIdx - 1 + DISCIPLINES.length) % DISCIPLINES.length;
    selectDiscipline(DISCIPLINES[prevIdx].id);
  };

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-8 font-mono select-none">
      {/* 1. Header Bar: Discipline Selector Tabs */}
      <div className="pointer-events-auto flex items-center justify-between gap-3 w-full max-w-5xl mx-auto bg-[#050508]/80 backdrop-blur-xl border border-white/[0.08] p-2 rounded-sm shadow-2xl">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {DISCIPLINES.map((d) => {
            const isActive = d.id === currentDisc.id;
            return (
              <button
                key={d.id}
                onClick={() => selectDiscipline(d.id)}
                className={`px-3 py-1 text-[11px] uppercase tracking-wider rounded-sm transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                {d.title}
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={closeInspection}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-sm border border-white/[0.08] hover:border-white/30 transition-all ml-2"
          title="Return to 3D Trajectory (ESC)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Main Technical Dossier Card */}
      <div className="pointer-events-auto max-w-2xl w-full mx-auto my-auto bg-[#050508]/85 backdrop-blur-2xl border border-white/[0.08] rounded-sm p-6 sm:p-8 shadow-2xl animate-fade-in flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
        {/* Top Discipline Metadata Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: currentDisc.color }}
            />
            <span className="tracking-widest font-bold text-foreground">
              {currentDisc.code} // {currentDisc.category.toUpperCase()}
            </span>
          </div>
          <span className="tracking-wider text-muted-foreground hidden sm:inline">
            3D ARCHITECTURAL OBSERVATORY
          </span>
        </div>

        {/* Title and Tagline */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-foreground">
            {currentDisc.title}
          </h2>
          <p className="text-xs sm:text-sm text-primary/90 mt-1 font-mono">
            {currentDisc.tagline}
          </p>
        </div>

        {/* Engineering Philosophy Thesis */}
        <div className="p-4 rounded-sm border border-white/[0.06] bg-white/[0.02]">
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase block mb-1">
            // Engineering Thesis & Architectural Approach
          </span>
          <p className="text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
            {currentDisc.thesis}
          </p>
        </div>

        {/* Production Principles (Demonstrated focus instead of percentage bars) */}
        <div>
          <span className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
            <Cpu className="h-3.5 w-3.5 text-primary" />
            <span>Production Principles & Hardware Sympathy</span>
          </span>
          <ul className="flex flex-col gap-2">
            {currentDisc.productionPrinciples.map((principle, idx) => (
              <li
                key={idx}
                className="text-xs font-sans text-muted-foreground/90 pl-3 border-l-2 border-white/20 leading-relaxed"
              >
                {principle}
              </li>
            ))}
          </ul>
        </div>

        {/* Architectural Patterns & Core Toolchain */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
          <div>
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span>Key Architectural Patterns</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentDisc.architecturalPatterns.map((pat) => (
                <span
                  key={pat}
                  className="text-[10px] px-2 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.08] text-foreground"
                >
                  {pat}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase block mb-2">
              // Systems Toolchain & Runtimes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentDisc.coreToolchain.map((tool) => (
                <span
                  key={tool}
                  className="text-[10px] px-2 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.08] text-muted-foreground"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Demonstrated Projects in Portfolio */}
        {currentDisc.demonstratedProjectSlugs.length > 0 && (
          <div className="pt-2 border-t border-white/[0.06]">
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase block mb-2">
              // Demonstrated In Flagship Portfolio Exhibits
            </span>
            <div className="flex flex-wrap gap-2">
              {currentDisc.demonstratedProjectSlugs.map((slug) => (
                <button
                  key={slug}
                  onClick={() => selectProjectBySlug(slug, true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-sans border border-white/[0.12] hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.08] text-foreground transition-all group"
                >
                  <span className="capitalize">{slug.replace(/-/g, ' ')}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Bottom Stepping Footer */}
      <div className="pointer-events-auto flex items-center justify-between w-full max-w-2xl mx-auto text-[10px] text-muted-foreground tracking-wider bg-[#050508]/80 backdrop-blur-xl border border-white/[0.08] px-4 py-2 rounded-sm shadow-xl">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 hover:text-foreground transition-colors p-1"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>PREV DISCIPLINE (A / ←)</span>
        </button>

        <span className="text-foreground">
          {currentIdx + 1} / {DISCIPLINES.length}
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 hover:text-foreground transition-colors p-1"
        >
          <span>NEXT DISCIPLINE (D / →)</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
