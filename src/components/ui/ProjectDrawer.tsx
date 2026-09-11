import React from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { Heading, Paragraph, MonoLabel } from '../common/Typography';
import { Button } from '../common/Button';
import { X, ExternalLink, GitBranch, Terminal } from 'lucide-react';
import { openSafeExternalUrl } from '@/lib/validation';

export const ProjectDrawer: React.FC = () => {
  const selectedProject = useJourneyStore((s) => s.selectedProject);
  const closeInspection = useJourneyStore((s) => s.closeInspection);

  if (!selectedProject) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/75 backdrop-blur-md transition-all duration-300 pointer-events-auto">
      <div className="relative w-full max-w-xl h-full bg-[#050509] border-l border-white/[0.08] p-6 sm:p-8 overflow-y-auto flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.9)] font-sans">
        {/* Dossier Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-white/10 text-white">
              <Terminal className="h-3 w-3" />
            </div>
            <MonoLabel className="text-[10px] tracking-[0.2em] text-foreground">
              TECHNICAL DOSSIER // {selectedProject.category.replace('_', ' ').toUpperCase()}
            </MonoLabel>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeInspection}
            className="h-7 w-7 rounded-sm border border-white/[0.08] hover:bg-white/[0.06]"
            aria-label="Close Project Dossier"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Project Title & Tagline */}
        <div className="mt-6">
          <Heading level={1} className="text-xl sm:text-2xl font-bold mb-2 tracking-tight">
            {selectedProject.title}
          </Heading>
          <Paragraph className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {selectedProject.tagline}
          </Paragraph>
        </div>

        {/* Technical Specification Matrix */}
        <div className="mt-6 grid grid-cols-2 gap-px bg-white/[0.08] border border-white/[0.08] rounded-sm overflow-hidden font-mono text-[10px]">
          <div className="bg-[#090910] p-2.5">
            <span className="text-muted-foreground block mb-0.5">DISCIPLINE</span>
            <span className="text-foreground uppercase">{selectedProject.category.replace('_', ' ')}</span>
          </div>
          <div className="bg-[#090910] p-2.5">
            <span className="text-muted-foreground block mb-0.5">STATUS</span>
            <span className="text-emerald-400 uppercase">VERIFIED PRODUCTION</span>
          </div>
          <div className="bg-[#090910] p-2.5 col-span-2">
            <span className="text-muted-foreground block mb-1">CORE TECHNOLOGIES</span>
            <div className="flex flex-wrap gap-1">
              {selectedProject.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.08] text-foreground/90 text-[10px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Visual Preview */}
        {selectedProject.thumbnail_url && (
          <div className="mt-6 overflow-hidden rounded-sm border border-white/[0.08]">
            <img
              src={selectedProject.thumbnail_url}
              alt={selectedProject.title}
              className="w-full h-48 object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
            />
          </div>
        )}

        {/* In-depth Architecture Breakdown */}
        <div className="mt-6 text-xs text-foreground/90 whitespace-pre-line leading-relaxed bg-white/[0.02] p-4 rounded-sm border border-white/[0.06] font-mono">
          {selectedProject.description_markdown}
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap gap-3">
          {selectedProject.live_demo_url && (
            <Button
              variant="primary"
              className="flex-1 gap-2 text-xs"
              onClick={() => openSafeExternalUrl(selectedProject.live_demo_url)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Launch Live System</span>
            </Button>
          )}

          {selectedProject.github_repo_url && (
            <Button
              variant="outline"
              className="flex-1 gap-2 text-xs"
              onClick={() => openSafeExternalUrl(selectedProject.github_repo_url)}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Source Repository</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
