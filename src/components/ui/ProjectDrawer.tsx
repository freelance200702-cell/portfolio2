import React from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { Heading, Paragraph } from '../common/Typography';
import { Button } from '../common/Button';
import { X, ExternalLink, GitBranch, ArrowLeft } from 'lucide-react';
import { openSafeExternalUrl } from '@/lib/validation';

export const ProjectDrawer: React.FC = () => {
  const selectedProject = useJourneyStore((s) => s.selectedProject);
  const closeInspection = useJourneyStore((s) => s.closeInspection);

  if (!selectedProject) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/60 backdrop-blur-md transition-all duration-300 pointer-events-auto">
      <div className="relative w-full max-w-xl h-full bg-[#0a0f1d] border-l border-white/[0.08] p-6 sm:p-8 overflow-y-auto flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] font-sans">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {selectedProject.category.replace('_', ' ')}
            </span>
            {selectedProject.year && (
              <span className="text-xs text-slate-400 font-mono">
                {selectedProject.year}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeInspection}
            className="h-8 w-8 rounded-full border border-white/[0.1] hover:bg-white/[0.08] text-slate-300"
            aria-label="Close Project View"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Project Title & Tagline */}
        <div className="mt-6">
          <Heading level={1} className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-2">
            {selectedProject.title}
          </Heading>
          <Paragraph className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {selectedProject.tagline}
          </Paragraph>
        </div>

        {/* Technologies List */}
        {selectedProject.technologies.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {selectedProject.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-200 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Visual Preview */}
        {selectedProject.thumbnail_url && (
          <div className="mt-6 overflow-hidden rounded-lg border border-white/[0.08] shadow-lg">
            <img
              src={selectedProject.thumbnail_url}
              alt={selectedProject.title}
              className="w-full h-52 object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}

        {/* In-depth Overview */}
        <div className="mt-6 text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-white/[0.02] p-5 rounded-lg border border-white/[0.06]">
          {selectedProject.description_markdown}
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap gap-3">
          {selectedProject.live_demo_url && (
            <Button
              variant="primary"
              className="flex-1 gap-2 text-xs py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-medium shadow-sm transition-all"
              onClick={() => openSafeExternalUrl(selectedProject.live_demo_url)}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Live Demonstration</span>
            </Button>
          )}

          {selectedProject.github_repo_url && (
            <Button
              variant="outline"
              className="flex-1 gap-2 text-xs py-2.5 rounded-lg border-white/[0.12] hover:bg-white/[0.06] text-slate-200 font-medium transition-all"
              onClick={() => openSafeExternalUrl(selectedProject.github_repo_url)}
            >
              <GitBranch className="h-4 w-4" />
              <span>Source Repository</span>
            </Button>
          )}

          <Button
            variant="ghost"
            className="w-full gap-2 text-xs py-2 text-slate-400 hover:text-white transition-colors"
            onClick={closeInspection}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Resume Journey</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
