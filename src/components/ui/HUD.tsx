import React from 'react';
import { Link } from 'react-router-dom';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useUIStore, type QualityPreset } from '@/stores/useUIStore';
import { Button } from '../common/Button';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Crosshair,
  ArrowUpRight,
} from 'lucide-react';
import type { ProjectCategory } from '@/types/project';

const CATEGORIES: { id: ProjectCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ALL' },
  { id: 'three_d_graphics', label: '3D GRAPHICS' },
  { id: 'ai_ml', label: 'AI & SYSTEMS' },
  { id: 'systems_engine', label: 'BARE-METAL' },
];

export const HUD: React.FC = () => {
  const projects = useJourneyStore((s) => s.projects);
  const targetProgress = useJourneyStore((s) => s.targetProgress);
  const setTargetProgress = useJourneyStore((s) => s.setTargetProgress);
  const activeProjectIndex = useJourneyStore((s) => s.activeProjectIndex);
  const nextProject = useJourneyStore((s) => s.nextProject);
  const prevProject = useJourneyStore((s) => s.prevProject);
  const jumpToIndex = useJourneyStore((s) => s.jumpToIndex);
  const selectProject = useJourneyStore((s) => s.selectProject);

  const selectedCategory = useUIStore((s) => s.selectedCategory);
  const setCategory = useUIStore((s) => s.setCategory);
  const isAudioPlaying = useUIStore((s) => s.isAudioPlaying);
  const toggleAudio = useUIStore((s) => s.toggleAudio);
  const qualityPreset = useUIStore((s) => s.qualityPreset);
  const setQualityPreset = useUIStore((s) => s.setQualityPreset);

  const currentProject = projects[activeProjectIndex];
  const projectAnchors = useJourneyStore((s) => s.projectAnchors);
  const jumpToObservatory = useJourneyStore((s) => s.jumpToObservatory);
  const cameraMode = useJourneyStore((s) => s.cameraMode);
  const progressPercent = (targetProgress * 100).toFixed(1);
  const isIntroPhase = targetProgress < 0.08;
  const isTerminus = targetProgress >= 0.95;
  const isObservatoryPhase =
    cameraMode === 'observatory' || (targetProgress >= 0.86 && targetProgress < 0.95);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none font-mono">
      {/* 1. Viewfinder Framing Reticles (Corner Crosshairs) */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/20 pointer-events-none" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/20 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/20 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/20 pointer-events-none" />

      {/* 2. Top Header Navigation Bar */}
      <div className="flex items-center justify-between gap-4 w-full mt-12 sm:mt-0">
        {/* Minimalist Discipline Filter Tabs & Systems Observatory Link (Desktop) */}
        <div className="pointer-events-auto hidden sm:flex items-center border border-white/[0.08] bg-[#050508]/60 backdrop-blur-md px-1 py-0.5 rounded-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 text-[10px] tracking-wider transition-all rounded-sm ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <span className="text-white/20 px-1">|</span>

          <button
            onClick={jumpToObservatory}
            className={`px-3 py-1 text-[10px] tracking-wider transition-all rounded-sm ${
              isObservatoryPhase
                ? 'bg-primary text-black font-semibold shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
            }`}
          >
            SYSTEMS / ABOUT
          </button>
        </div>

        {/* Mobile Header Quick Actions */}
        <div className="pointer-events-auto flex sm:hidden items-center gap-1.5 border border-white/[0.08] bg-[#050508]/70 backdrop-blur-md px-2 py-1 rounded-sm text-[10px]">
          <button
            onClick={jumpToObservatory}
            className={`px-2 py-0.5 rounded-sm tracking-wider font-semibold uppercase ${
              isObservatoryPhase
                ? 'bg-primary text-black'
                : 'text-primary hover:bg-white/[0.06]'
            }`}
          >
            ABOUT / SYS
          </button>
        </div>

        {/* Telemetry & Quality Controls */}
        <div className="pointer-events-auto ml-auto flex items-center gap-2 border border-white/[0.08] bg-[#050508]/60 backdrop-blur-md px-2 py-1 rounded-sm text-[10px]">
          <span className="text-muted-foreground hidden md:inline">
            EXPEDITION // {progressPercent}%
          </span>

          <span className="text-white/20 hidden md:inline">|</span>

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioPlaying ? 'Mute Soundscape' : 'Play Soundscape'}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            {isAudioPlaying ? (
              <Volume2 className="h-3.5 w-3.5 text-foreground" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>

          <span className="text-white/20">|</span>

          {/* Quality Mode Switcher (cinematic -> balanced -> mobile -> reduced_3d) */}
          <button
            onClick={() => {
              const presets: QualityPreset[] = ['cinematic', 'balanced', 'mobile', 'reduced_3d'];
              const nextIdx = (presets.indexOf(qualityPreset) + 1) % presets.length;
              setQualityPreset(presets[nextIdx]);
            }}
            className="uppercase text-muted-foreground hover:text-foreground transition-colors tracking-wider px-1"
            title="Visual Quality Mode (Cinematic / Balanced / Mobile / Eco Reduced-3D)"
          >
            {qualityPreset === 'reduced_3d' ? '[ECO]' : `[${qualityPreset.slice(0, 3).toUpperCase()}]`}
          </button>
        </div>
      </div>

      {/* 3. Center Left: Technical Project Dossier Telemetry (Desktop / Tablet) */}
      {currentProject && !isIntroPhase && !isTerminus && !isObservatoryPhase && (
        <div
          onClick={() => selectProject(currentProject)}
          className="pointer-events-auto hidden md:flex flex-col gap-1.5 p-4 max-w-sm rounded-sm border border-white/[0.08] bg-[#050508]/70 backdrop-blur-xl self-start mt-auto mb-auto cursor-pointer group hover:border-white/30 transition-all shadow-2xl animate-fade-in"
        >
          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-white/[0.06] pb-2">
            <span className="tracking-widest">
              [ MILESTONE // 0{activeProjectIndex + 1} ]
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>

          <h3 className="font-sans font-bold text-sm text-foreground tracking-tight group-hover:text-white transition-colors">
            {currentProject.title}
          </h3>

          <p className="font-sans text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {currentProject.tagline}
          </p>

          <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
            {currentProject.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[9px] px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.08] text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-1 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-muted-foreground">
            <span>PRESS SPACE TO ENGAGE</span>
            <Crosshair className="h-3 w-3 text-muted-foreground group-hover:rotate-90 transition-transform" />
          </div>
        </div>
      )}

      {/* Mobile Bottom Exhibit Preview Strip (Above Scrubber) */}
      {currentProject && !isIntroPhase && !isTerminus && !isObservatoryPhase && (
        <div
          onClick={() => selectProject(currentProject)}
          className="pointer-events-auto flex md:hidden items-center justify-between gap-3 p-2.5 mx-auto max-w-2xl w-full rounded-sm border border-white/[0.12] bg-[#050508]/90 backdrop-blur-xl mb-1 cursor-pointer active:scale-[0.99] transition-all shadow-2xl"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase">
              EXHIBIT 0{activeProjectIndex + 1} // {currentProject.category.replace(/_/g, ' ')}
            </span>
            <h3 className="font-sans font-bold text-xs text-white truncate">
              {currentProject.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-primary font-semibold shrink-0 bg-white/[0.06] px-2 py-1 rounded-sm border border-white/[0.08]">
            <span>INSPECT</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      )}

      {/* Graceful Empty State (When no published exhibits exist) */}
      {!currentProject && !isIntroPhase && !isTerminus && !isObservatoryPhase && (
        <div className="pointer-events-auto hidden md:flex flex-col gap-2 p-5 max-w-sm rounded-sm border border-white/[0.08] bg-[#050508]/85 backdrop-blur-2xl self-start mt-auto mb-auto shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2 text-[10px] text-amber-400/90 border-b border-white/[0.06] pb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="tracking-widest">EXPEDITION CLEAR // STANDBY</span>
          </div>
          <h3 className="font-sans font-bold text-sm text-foreground tracking-tight">
            No Published Exhibits
          </h3>
          <p className="font-sans text-xs text-muted-foreground leading-relaxed">
            The continuous 3D trajectory is ready. No published projects are currently active along the spline.
          </p>
          <div className="mt-1 pt-2 border-t border-white/[0.06] text-[10px]">
            <Link to="/admin" className="text-primary hover:underline flex items-center gap-1.5">
              <span>Access Management Dashboard →</span>
            </Link>
          </div>
        </div>
      )}

      {/* 4. Bottom Viewfinder HUD: Precision Scrubber & Trajectory Telemetry */}
      <div className="pointer-events-auto flex flex-col gap-2 max-w-2xl w-full mx-auto p-3 sm:p-4 rounded-sm border border-white/[0.08] bg-[#050508]/80 backdrop-blur-2xl shadow-2xl">
        {/* Progress Timeline Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-wider text-muted-foreground w-12 text-left">
            T:{progressPercent}%
          </span>

          <div
            className="relative flex-1 h-7 cursor-pointer overflow-visible flex items-center touch-none py-2"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
              setTargetProgress(newProgress);
            }}
          >
            {/* Visual Hairline Progress Track */}
            <div className="relative w-full h-1.5 bg-white/[0.08] flex items-center overflow-visible">
              {/* Hairline Progress Fill */}
              <div
                className="h-full bg-white transition-all duration-75"
                style={{ width: `${targetProgress * 100}%` }}
              />

              {/* Precision Milestone Waypoint Markers */}
              {projects.map((p, i) => {
                const anchorT = projectAnchors[i] ?? (i + 1) / (projects.length + 1);
                const isActive = !isIntroPhase && !isTerminus && i === activeProjectIndex;

                // Prevent timeline crowding if project count exceeds 20
                if (projects.length > 20 && !isActive && !p.featured && i % 2 !== 0) {
                  return null;
                }

                return (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToIndex(i);
                    }}
                    title={`Waypoint 0${i + 1}: ${p.title}`}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all p-1 -m-1 ${
                      isActive
                        ? 'h-4 w-4 bg-white border border-black shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10'
                        : 'h-2.5 w-2.5 bg-white/40 hover:bg-white/80 border border-black/40'
                    }`}
                    style={{ left: `${anchorT * 100}%` }}
                  />
                );
              })}

              {/* Systems Observatory Waypoint Marker */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToObservatory();
                }}
                title="Systems Observatory (About & Skills)"
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all p-1 -m-1 ${
                  isObservatoryPhase
                    ? 'h-4 w-4 bg-sky-400 border border-black shadow-[0_0_10px_rgba(56,189,248,0.9)] z-10'
                    : 'h-2.5 w-2.5 bg-sky-400/60 hover:bg-sky-400 border border-black/40'
                }`}
                style={{ left: '88.5%' }}
              />
            </div>
          </div>

          {/* Stepping controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={prevProject}
              className="h-7 w-7 rounded-sm"
              title="Previous Waypoint (A / Left)"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextProject}
              className="h-7 w-7 rounded-sm"
              title="Next Waypoint (D / Right)"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Technical Sub-telemetry */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground tracking-wider border-t border-white/[0.04] pt-2">
          <span className="hidden sm:inline">
            TRAJECTORY: CATMULL-ROM 3D // INERTIA DAMPING ACTIVE
          </span>
          <span className="sm:hidden">
            NAVIGATION: SCROLL / SWIPE
          </span>

          <span className="text-foreground">
            {isIntroPhase
              ? 'STATUS: EXPEDITION READY'
              : isTerminus
              ? 'STATUS: EXPEDITION COMPLETE // TERMINUS REACHED'
              : isObservatoryPhase
              ? 'STATUS: SYSTEMS OBSERVATORY // ARCHITECTURAL CODEX'
              : currentProject
              ? `TARGET: ${currentProject.title.slice(0, 22).toUpperCase()}`
              : 'STATUS: 0 EXHIBITS (STANDBY)'}
          </span>
        </div>
      </div>
    </div>
  );
};
