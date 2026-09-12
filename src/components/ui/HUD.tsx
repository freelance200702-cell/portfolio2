import React from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useUIStore, type QualityPreset } from '@/stores/useUIStore';
import { Button } from '../common/Button';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  ArrowUpRight,
} from 'lucide-react';
import type { ProjectCategory } from '@/types/project';

const CATEGORIES: { id: ProjectCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Works' },
  { id: 'three_d_graphics', label: 'Graphics' },
  { id: 'ai_ml', label: 'AI & Systems' },
  { id: 'systems_engine', label: 'Engines' },
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
  const isIntroPhase = targetProgress < 0.05;
  const isTerminus = targetProgress >= 0.96;
  const isObservatoryPhase =
    cameraMode === 'observatory' || (targetProgress >= 0.86 && targetProgress < 0.95);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-7 select-none font-sans">
      {/* 1. Top Filter Navigation Bar */}
      <div className="flex items-center justify-between gap-4 w-full mt-14 sm:mt-14">
        {/* Discipline Filter Tabs & About / Systems Pavilion Link */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-1 border border-white/[0.06] bg-[#070a12]/50 backdrop-blur-xl px-1.5 py-1 rounded-full shadow-lg">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 text-xs tracking-wide transition-all rounded-full ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="w-[1px] h-3 bg-white/10 mx-1" />

          <button
            onClick={jumpToObservatory}
            className={`px-3 py-1 text-xs tracking-wide transition-all rounded-full ${
              isObservatoryPhase
                ? 'bg-sky-400 text-black font-medium shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
            }`}
          >
            Observatory
          </button>
        </div>

        {/* Mobile Header Quick Actions */}
        <div className="pointer-events-auto flex sm:hidden items-center gap-1.5 border border-white/[0.08] bg-[#070a12]/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs">
          <button
            onClick={jumpToObservatory}
            className={`px-2.5 py-0.5 rounded-full tracking-wide text-xs ${
              isObservatoryPhase
                ? 'bg-sky-400 text-black font-medium'
                : 'text-sky-300 hover:bg-white/[0.06]'
            }`}
          >
            Observatory
          </button>
        </div>

        {/* Audio & Quality Controls */}
        <div className="pointer-events-auto ml-auto flex items-center gap-2 border border-white/[0.06] bg-[#070a12]/50 backdrop-blur-xl px-2.5 py-1 rounded-full text-xs shadow-lg">
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

          <div className="w-[1px] h-3 bg-white/10" />

          {/* Quality Mode Switcher */}
          <button
            onClick={() => {
              const presets: QualityPreset[] = ['cinematic', 'balanced', 'mobile', 'reduced_3d'];
              const nextIdx = (presets.indexOf(qualityPreset) + 1) % presets.length;
              setQualityPreset(presets[nextIdx]);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors text-[10px] tracking-wider px-1 uppercase"
            title="Visual Quality (Cinematic / Balanced / Mobile / Eco)"
          >
            {qualityPreset === 'reduced_3d' ? 'ECO' : qualityPreset.slice(0, 3)}
          </button>
        </div>
      </div>

      {/* 2. Bottom Unified Journey Timeline & Milestone Indicator */}
      <div className="pointer-events-auto flex flex-col gap-2 max-w-xl w-full mx-auto p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] bg-[#070a12]/60 backdrop-blur-2xl shadow-2xl transition-all">
        {/* Active Milestone Title / Status line */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2 text-foreground font-medium truncate">
            {isIntroPhase ? (
              <span className="text-muted-foreground">Journey Departure</span>
            ) : isTerminus ? (
              <span className="text-muted-foreground">Journey Horizon</span>
            ) : isObservatoryPhase ? (
              <span className="text-sky-300 font-medium">Systems Observatory</span>
            ) : currentProject ? (
              <button
                onClick={() => selectProject(currentProject)}
                className="flex items-center gap-1.5 hover:text-white transition-colors group cursor-pointer"
              >
                <span className="text-muted-foreground font-mono text-[11px]">
                  0{activeProjectIndex + 1}
                </span>
                <span className="text-white font-medium truncate">{currentProject.title}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            ) : (
              <span className="text-muted-foreground">Exhibition Path</span>
            )}
          </div>

          <span className="text-[11px] font-mono text-muted-foreground shrink-0 pl-2">
            {(targetProgress * 100).toFixed(0)}%
          </span>
        </div>

        {/* Hairline Timeline Scrubber */}
        <div className="flex items-center gap-3 pt-1">
          <div
            className="relative flex-1 h-6 cursor-pointer overflow-visible flex items-center touch-none py-2"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newProgress = Math.max(0, Math.min(1, clickX / rect.width));
              setTargetProgress(newProgress);
            }}
          >
            {/* Visual Hairline Progress Track */}
            <div className="relative w-full h-[2px] bg-white/10 rounded-full flex items-center overflow-visible">
              {/* Progress Fill */}
              <div
                className="h-full bg-white/70 rounded-full transition-all duration-75"
                style={{ width: `${targetProgress * 100}%` }}
              />

              {/* Waypoint Markers */}
              {projects.map((p, i) => {
                const anchorT = projectAnchors[i] ?? (i + 1) / (projects.length + 1);
                const isActive = !isIntroPhase && !isTerminus && i === activeProjectIndex;

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
                    title={`${p.title}`}
                    className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all rounded-full ${
                      isActive
                        ? 'h-3 w-3 bg-white ring-4 ring-white/20 z-10 shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                        : 'h-1.5 w-1.5 bg-white/40 hover:bg-white/90 hover:scale-150'
                    }`}
                    style={{ left: `${anchorT * 100}%` }}
                  />
                );
              })}

              {/* Observatory Marker */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToObservatory();
                }}
                title="Systems Observatory"
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all rounded-full ${
                  isObservatoryPhase
                    ? 'h-3 w-3 bg-sky-400 ring-4 ring-sky-400/30 z-10 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                    : 'h-1.5 w-1.5 bg-sky-400/50 hover:bg-sky-400 hover:scale-150'
                }`}
                style={{ left: '88.5%' }}
              />
            </div>
          </div>

          {/* Stepping controls */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={prevProject}
              className="h-7 w-7 rounded-full border-white/10 hover:bg-white/10 text-muted-foreground hover:text-white"
              title="Previous Project (A / Left)"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextProject}
              className="h-7 w-7 rounded-full border-white/10 hover:bg-white/10 text-muted-foreground hover:text-white"
              title="Next Project (D / Right)"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
