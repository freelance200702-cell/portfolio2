import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Project } from '@/types/project';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { Heading, Paragraph, MonoLabel } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { MediaGalleryLightbox } from './MediaGalleryLightbox';
import { openSafeExternalUrl } from '@/lib/validation';
import {
  X,
  ExternalLink,
  GitBranch,
  Terminal,
  Calendar,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface ProjectPresentationModalProps {
  project?: Project | null;
  onClose?: () => void;
}

export const ProjectPresentationModal: React.FC<ProjectPresentationModalProps> = ({
  project: propProject,
  onClose: propOnClose,
}) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const projects = useJourneyStore((s) => s.projects);
  const storeSelectedProject = useJourneyStore((s) => s.selectedProject);
  const selectProjectBySlug = useJourneyStore((s) => s.selectProjectBySlug);
  const nextProject = useJourneyStore((s) => s.nextProject);
  const prevProject = useJourneyStore((s) => s.prevProject);
  const closeInspection = useJourneyStore((s) => s.closeInspection);

  // Active project resolution: prop -> slug -> store
  const activeProject: Project | null =
    propProject ||
    (slug ? projects.find((p) => p.slug === slug) || null : null) ||
    storeSelectedProject;

  // Media Gallery Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Deep Link Copy Feedback
  const [copiedLink, setCopiedLink] = useState(false);

  // Video Player Controls State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Sync route param with store selection on initial mount or parameter changes
  useEffect(() => {
    if (slug && projects.length > 0) {
      const match = selectProjectBySlug(slug);
      if (!match) {
        // Fallback if slug is invalid
        navigate('/', { replace: true });
      }
    }
  }, [slug, projects, selectProjectBySlug, navigate]);

  // Handle closing and returning cleanly to the 3D track
  const handleClose = useCallback(() => {
    closeInspection();
    if (propOnClose) {
      propOnClose();
    } else {
      navigate('/', { replace: true });
    }
  }, [closeInspection, propOnClose, navigate]);

  // Project sequence indexing
  const currentIndex = activeProject
    ? projects.findIndex((p) => p.id === activeProject.id)
    : -1;
  const projectSequenceText =
    currentIndex !== -1
      ? `PROJECT ${String(currentIndex + 1).padStart(2, '0')} OF ${String(projects.length).padStart(2, '0')}`
      : 'TECHNICAL DOSSIER';

  // Navigation handlers
  const handleNavigateNext = useCallback(() => {
    const next = nextProject();
    if (next) {
      navigate(`/project/${next.slug}`, { replace: true });
    }
  }, [nextProject, navigate]);

  const handleNavigatePrev = useCallback(() => {
    const prev = prevProject();
    if (prev) {
      navigate(`/project/${prev.slug}`, { replace: true });
    }
  }, [prevProject, navigate]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if lightbox is open (it has its own listener)
      if (lightboxOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowRight' && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
        handleNavigateNext();
      } else if (e.key === 'ArrowLeft' && (e.metaKey || e.ctrlKey || e.altKey)) {
        e.preventDefault();
        handleNavigatePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handleClose, handleNavigateNext, handleNavigatePrev]);

  // Copy share link
  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2400);
    });
  };

  // Video toggle handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  if (!activeProject) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Project dossier for ${activeProject.title}`}
      className="fixed inset-0 z-40 flex flex-col bg-black/85 backdrop-blur-2xl text-foreground font-sans overflow-hidden pointer-events-auto transition-all duration-300 animate-in fade-in"
    >
      {/* 1. TOP PRECISION TELEMETRY HEADER */}
      <header className="flex-shrink-0 h-16 border-b border-white/[0.08] bg-[#05050a]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="gap-2 text-xs text-muted-foreground hover:text-white border border-white/[0.08] hover:bg-white/[0.06] rounded-sm px-3"
            aria-label="Return to 3D Expedition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">RETURN TO EXPEDITION</span>
          </Button>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeProject.node_color_primary || '#38bdf8' }}
            />
            <MonoLabel className="text-[11px] tracking-[0.2em] text-foreground font-medium">
              {projectSequenceText} // {activeProject.category.replace('_', ' ').toUpperCase()}
            </MonoLabel>
            {activeProject.featured && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-400/10 border border-amber-400/30 text-amber-400 font-mono text-[9px] tracking-widest uppercase">
                ★ FEATURED
              </span>
            )}
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Project Navigators */}
          <div className="flex items-center border border-white/[0.08] rounded-sm overflow-hidden bg-black/40">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigatePrev}
              className="h-8 w-8 rounded-none border-r border-white/[0.08] text-muted-foreground hover:text-white hover:bg-white/[0.06]"
              title="Previous Project (Alt + Left)"
              aria-label="Previous Project"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigateNext}
              className="h-8 w-8 rounded-none text-muted-foreground hover:text-white hover:bg-white/[0.06]"
              title="Next Project (Alt + Right)"
              aria-label="Next Project"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Deep Link Share */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="gap-1.5 text-xs text-muted-foreground hover:text-white border border-white/[0.08] hover:bg-white/[0.06] rounded-sm px-2.5 h-8"
            title="Copy deep link to clipboard"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-[10px] hidden sm:inline font-mono">COPIED!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span className="text-[10px] hidden sm:inline font-mono">SHARE</span>
              </>
            )}
          </Button>

          {/* Close Modal */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-sm border border-white/[0.08] bg-white/[0.03] text-foreground hover:bg-white/10 hover:text-white"
            aria-label="Close Project Dossier"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 2. SCROLLABLE PRESENTATION BODY */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-16 py-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* SECTION A: HERO SHOWCASE (Media + Primary Headlines) */}
          <section className="space-y-6">
            {/* Category & Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-sm text-[10px] font-mono tracking-widest uppercase border font-semibold"
                style={{
                  borderColor: `${activeProject.node_color_primary}55`,
                  backgroundColor: `${activeProject.node_color_primary}15`,
                  color: activeProject.node_color_primary,
                }}
              >
                {activeProject.category.replace('_', ' ')}
              </span>

              {activeProject.year && (
                <span className="px-2 py-0.5 rounded-sm bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {activeProject.year}
                </span>
              )}

              {activeProject.featured && (
                <span className="px-2 py-0.5 rounded-sm bg-amber-400/10 border border-amber-400/30 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                  ★ FEATURED SYSTEM
                </span>
              )}
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-2">
              <Heading level={1} className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                {activeProject.title}
              </Heading>
              {activeProject.subtitle && (
                <p className="text-base sm:text-xl text-primary font-mono font-normal">
                  {activeProject.subtitle}
                </p>
              )}
              <Paragraph className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed pt-1">
                {activeProject.tagline}
              </Paragraph>
            </div>

            {/* Hero Deliverable Action Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {activeProject.live_demo_url && (
                <Button
                  variant="primary"
                  className="gap-2 text-xs px-5 py-2.5 h-auto shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
                  onClick={() => openSafeExternalUrl(activeProject.live_demo_url)}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>LAUNCH LIVE SYSTEM</span>
                </Button>
              )}

              {activeProject.github_repo_url && (
                <Button
                  variant="outline"
                  className="gap-2 text-xs px-5 py-2.5 h-auto border-white/[0.15] bg-black/40 hover:bg-white/[0.08] hover:border-white/30 text-white"
                  onClick={() => openSafeExternalUrl(activeProject.github_repo_url)}
                >
                  <GitBranch className="h-4 w-4" />
                  <span>SOURCE CODE & REPO</span>
                </Button>
              )}
            </div>

            {/* Hero Visual Stage: Video Player or High-Res Viewport */}
            <div className="relative rounded-sm overflow-hidden border border-white/[0.12] bg-[#07070e] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              {activeProject.video_url ? (
                <div className="relative aspect-video w-full bg-black group">
                  <video
                    ref={videoRef}
                    src={activeProject.video_url}
                    poster={activeProject.thumbnail_url}
                    loop
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-cover"
                    onClick={togglePlay}
                  />

                  {/* Cinematic Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-sm bg-black/70 border border-white/20 font-mono text-[10px] text-white/80">
                        VIDEO PREVIEW
                      </span>
                    </div>

                    <div className="flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                        </button>
                        <button
                          onClick={toggleMute}
                          className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (document.fullscreenElement) {
                              document.exitFullscreen();
                            } else {
                              videoRef.current.requestFullscreen();
                            }
                          }
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-sm bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                        aria-label="Fullscreen"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeProject.thumbnail_url ? (
                <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden">
                  <img
                    src={activeProject.thumbnail_url}
                    alt={activeProject.title}
                    className="w-full h-full object-cover filter contrast-[1.1]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>EXHIBIT PREVIEW</span>
                    <span>3D LANDMARK LINKED</span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video sm:aspect-[21/9] w-full flex flex-col items-center justify-center bg-[#080814] p-6 text-center border border-white/[0.06]">
                  <div className="h-12 w-12 rounded-sm border border-white/10 bg-white/[0.02] flex items-center justify-center mb-3 text-muted-foreground">
                    <Terminal className="h-6 w-6 text-primary/70" />
                  </div>
                  <span className="font-mono text-xs text-foreground/80 tracking-wider mb-1 uppercase">
                    {activeProject.title} // 3D LANDMARK EXHIBIT
                  </span>
                  <p className="font-mono text-[11px] text-muted-foreground max-w-md">
                    Custom media asset slot. Upload project screenshots, schematics, or video walk-throughs in the admin dashboard.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* SECTION B: TECHNICAL SPECIFICATIONS & SYSTEM INVARIANTS */}
          {activeProject.technical_specs && activeProject.technical_specs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <Cpu className="h-4 w-4 text-primary" />
                <MonoLabel className="text-xs tracking-[0.18em] text-foreground font-semibold">
                  TECHNICAL SPECIFICATIONS & ARCHITECTURE MATRIX
                </MonoLabel>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeProject.technical_specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-sm bg-[#080811] border border-white/[0.07] flex flex-col justify-between hover:border-white/20 transition-colors"
                  >
                    <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
                      {spec.label}
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-white font-medium">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION C: KEY HIGHLIGHTS / ACHIEVEMENTS */}
          {activeProject.achievements && activeProject.achievements.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <MonoLabel className="text-xs tracking-[0.18em] text-foreground font-semibold">
                  KEY HIGHLIGHTS & ARCHITECTURAL ACHIEVEMENTS
                </MonoLabel>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeProject.achievements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-sm bg-gradient-to-br from-emerald-950/20 to-[#080811] border border-emerald-500/20 flex items-start gap-3"
                  >
                    <span className="flex-shrink-0 flex h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center text-[10px] font-mono mt-0.5">
                      ✓
                    </span>
                    <span className="text-xs sm:text-sm text-foreground/90 font-mono leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION D: CORE TECHNOLOGIES */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Layers className="h-4 w-4 text-primary" />
              <MonoLabel className="text-xs tracking-[0.18em] text-foreground font-semibold">
                SYSTEM STACK & TOOLCHAIN
              </MonoLabel>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeProject.technologies.map((tech) => (
                <div
                  key={tech}
                  className="px-3 py-1.5 rounded-sm bg-[#090913] border border-white/[0.1] text-xs font-mono text-white/90 hover:border-primary/50 hover:bg-primary/10 transition-colors"
                >
                  {tech}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION E: INTERACTIVE VISUAL MEDIA GALLERY */}
          {activeProject.media_gallery && activeProject.media_gallery.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary" />
                  <MonoLabel className="text-xs tracking-[0.18em] text-foreground font-semibold">
                    VISUAL MEDIA & ARCHITECTURE SCHEMATICS
                  </MonoLabel>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  CLICK ITEM TO EXPAND
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeProject.media_gallery.map((media, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                    className="group relative rounded-sm overflow-hidden border border-white/[0.08] bg-[#080811] text-left hover:border-white/30 transition-all focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      {media.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/60">
                          <Play className="h-8 w-8 text-white/80 group-hover:scale-110 transition-transform" />
                        </div>
                      ) : (
                        <img
                          src={media.url}
                          alt={media.caption || 'Project visual preview'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                    </div>

                    {media.caption && (
                      <div className="p-2.5 bg-[#080812] border-t border-white/[0.06]">
                        <p className="font-mono text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                          {media.caption}
                        </p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* SECTION F: IN-DEPTH TECHNICAL DOSSIER (Markdown) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Terminal className="h-4 w-4 text-primary" />
              <MonoLabel className="text-xs tracking-[0.18em] text-foreground font-semibold">
                IN-DEPTH TECHNICAL DOSSIER & ARCHITECTURAL HIGHLIGHTS
              </MonoLabel>
            </div>

            <div className="p-6 sm:p-8 rounded-sm bg-[#06060c] border border-white/[0.08] text-foreground/90 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
              {activeProject.description_markdown}
            </div>
          </section>

          {/* SECTION G: BOTTOM NAVIGATION & TRAVERSAL RETURN */}
          <section className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 pb-12">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto gap-2 border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>RETURN TO 3D EXPEDITION</span>
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={handleNavigatePrev}
                className="flex-1 sm:flex-initial gap-2 text-xs border border-white/10 hover:bg-white/[0.06]"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>PREVIOUS</span>
              </Button>

              <Button
                variant="primary"
                onClick={handleNavigateNext}
                className="flex-1 sm:flex-initial gap-2 text-xs"
              >
                <span>NEXT PROJECT</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>
      </div>

      {/* 3. LIGHTBOX ASSET VIEWER */}
      {activeProject.media_gallery && activeProject.media_gallery.length > 0 && (
        <MediaGalleryLightbox
          items={activeProject.media_gallery}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onSelectIndex={setLightboxIndex}
        />
      )}
    </div>
  );
};
