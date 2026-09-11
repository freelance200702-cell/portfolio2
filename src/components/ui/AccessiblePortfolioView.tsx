import React from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useUIStore } from '@/stores/useUIStore';
import { ABOUT_PROFILE, DISCIPLINES } from '@/data/aboutSkillsData';
import {
  ExternalLink,
  GitBranch,
  Compass,
  Layers,
  Cpu,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { sanitizeSafeUrl } from '@/lib/validation';

export const AccessiblePortfolioView: React.FC = () => {
  const projects = useJourneyStore((s) => s.projects);
  const selectProject = useJourneyStore((s) => s.selectProject);
  const setQualityPreset = useUIStore((s) => s.setQualityPreset);
  const isWebGLSupported = useUIStore((s) => s.isWebGLSupported);

  return (
    <div className="min-h-screen w-full bg-[#030305] text-foreground font-mono overflow-y-auto px-4 sm:px-8 py-12 select-text z-20 relative">
      <div className="max-w-4xl mx-auto flex flex-col gap-16">
        {/* 1. Header & Identity Section */}
        <header className="flex flex-col gap-4 border-b border-white/[0.08] pb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400 tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{ABOUT_PROFILE.status.toUpperCase()}</span>
            </div>

            {/* Re-enable 3D Button (if WebGL is supported) */}
            {isWebGLSupported ? (
              <button
                onClick={() => setQualityPreset('balanced')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]"
              >
                <Compass className="h-3.5 w-3.5 text-black" />
                <span>Switch to 3D Trajectory</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs text-amber-400/90 border border-amber-400/20 px-3 py-1.5 rounded-sm bg-amber-400/5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Reduced 3D Mode Active (Low Hardware / No WebGL)</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold font-sans tracking-tight text-white mt-2">
            {ABOUT_PROFILE.name}
          </h1>

          <p className="text-sm sm:text-base font-sans text-primary/90 max-w-2xl leading-relaxed">
            {ABOUT_PROFILE.coreStatement}
          </p>
        </header>

        {/* 2. Flagship Exhibits / Projects Section */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
              <Layers className="h-4 w-4 text-primary" />
              <span>Flagship Engineering Exhibits ({projects.length})</span>
            </div>
            <span className="text-[10px] text-muted-foreground tracking-widest">
              HARDWARE & ARCHITECTURAL SYSTEMS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project, idx) => (
              <div
                key={project.id}
                className="flex flex-col justify-between p-6 rounded-sm border border-white/[0.08] bg-[#07070d] hover:border-white/30 transition-all group shadow-xl"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-white/[0.06] pb-2">
                    <span className="tracking-widest">[ EXHIBIT // 0{idx + 1} ]</span>
                    <span className="uppercase text-foreground font-semibold">
                      {project.category.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="font-sans font-bold text-lg text-foreground group-hover:text-white transition-colors">
                    {project.title}
                  </h3>

                  <p className="font-sans text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {project.tagline}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-2 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.08] text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/[0.06]">
                  <button
                    onClick={() => selectProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-white font-semibold transition-colors"
                  >
                    <span>Inspect Specs</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-3">
                    {sanitizeSafeUrl(project.github_repo_url) && (
                      <a
                        href={sanitizeSafeUrl(project.github_repo_url)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="View Source Code"
                      >
                        <GitBranch className="h-4 w-4" />
                      </a>
                    )}
                    {sanitizeSafeUrl(project.live_demo_url) && (
                      <a
                        href={sanitizeSafeUrl(project.live_demo_url)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="Live Deployment"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Systems Observatory: 6 Engineering Disciplines */}
        <section className="flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Systems Observatory // Core Disciplines</span>
            </div>
            <span className="text-[10px] text-muted-foreground tracking-widest">
              DEMONSTRATED ARCHITECTURES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DISCIPLINES.map((disc) => (
              <div
                key={disc.id}
                className="p-6 rounded-sm border border-white/[0.08] bg-[#07070d] flex flex-col gap-4"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="tracking-widest font-bold text-foreground">
                    {disc.code} // {disc.category.toUpperCase()}
                  </span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: disc.color }}
                  />
                </div>

                <div>
                  <h4 className="font-sans font-bold text-base text-foreground">
                    {disc.title}
                  </h4>
                  <p className="text-xs text-primary/80 mt-0.5">{disc.tagline}</p>
                </div>

                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  {disc.thesis}
                </p>

                <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
                  <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                    // Key Architectural Patterns
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {disc.architecturalPatterns.map((pat) => (
                      <span
                        key={pat}
                        className="text-[9px] px-1.5 py-0.5 rounded-sm bg-white/[0.03] border border-white/[0.06] text-muted-foreground"
                      >
                        {pat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Engineering Convictions & What I Build */}
        <section className="flex flex-col gap-6 border-t border-white/[0.08] pt-10 mb-12">
          <div className="text-xs tracking-widest text-muted-foreground uppercase">
            // Core Engineering Philosophy & Production Convictions
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ABOUT_PROFILE.philosophy.map((phi, idx) => (
              <div
                key={idx}
                className="p-4 rounded-sm border border-white/[0.06] bg-[#050508] text-xs font-sans text-muted-foreground leading-relaxed"
              >
                {phi}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
