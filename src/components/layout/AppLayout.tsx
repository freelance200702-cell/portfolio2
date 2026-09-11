import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { CanvasContainer } from '../3d/CanvasContainer';
import { Header } from './Header';
import { IntroOverlay } from '../ui/IntroOverlay';

const ProjectPresentationModal = React.lazy(() =>
  import('../ui/ProjectPresentation').then((m) => ({ default: m.ProjectPresentationModal }))
);
const ObservatoryOverlay = React.lazy(() =>
  import('../ui/ObservatoryOverlay').then((m) => ({ default: m.ObservatoryOverlay }))
);
import { useJourneyStore } from '@/stores/useJourneyStore';
import { useUIStore } from '@/stores/useUIStore';
import { projectService } from '@/services/supabase/projectService';
import { useJourneyInput } from '@/hooks/useJourneyInput';

export const AppLayout: React.FC = () => {
  const fetchProjects = useJourneyStore((s) => s.fetchProjects);
  const isLoadingProjects = useJourneyStore((s) => s.isLoadingProjects);
  const projectsError = useJourneyStore((s) => s.projectsError);

  // Initialize unified desktop & mobile input engine (wheel inertia, touch drag, keyboard)
  useJourneyInput();

  // Initial fetch of projects from Supabase service, deep-link restoration, and real-time subscription
  useEffect(() => {
    fetchProjects().then(() => {
      // Deep linking: If user entered directly via /project/:slug
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/project/')) {
          const directSlug = path.replace('/project/', '').replace(/\/$/, '');
          if (directSlug) {
            const found = useJourneyStore.getState().selectProjectBySlug(directSlug, true);
            if (!found && useJourneyStore.getState().projects.length > 0) {
              window.history.replaceState(null, '', '/404');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }
        }
      }
    });

    // Real-time synchronization: reacts immediately when projects are added/reordered/edited
    const unsubscribe = projectService.subscribeToProjects(() => {
      fetchProjects();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchProjects]);

  // Browser Navigation History listener (Back / Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/project/')) {
        const currentSlug = path.replace('/project/', '').replace(/\/$/, '');
        if (currentSlug) {
          useJourneyStore.getState().selectProjectBySlug(currentSlug);
        }
      } else {
        useJourneyStore.getState().closeInspection();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Adaptive Viewport & Device capability listener (orientation change / resize)
  useEffect(() => {
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        useUIStore.getState().refreshDeviceCapabilities();
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030305] select-none">
      {/* 3D WebGL Canvas Layer (Persistent) */}
      <CanvasContainer />

      {/* Header HUD */}
      <Header />

      {/* Realtime Synchronizing Status Indicator */}
      {isLoadingProjects && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-3 py-1 rounded-sm border border-primary/30 bg-black/60 backdrop-blur-md text-[10px] font-mono text-primary flex items-center gap-2 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>SYNCHRONIZING EXHIBITS WITH DATABASE...</span>
        </div>
      )}

      {/* Projects Fetch Error Banner */}
      {projectsError && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto px-4 py-2 rounded-sm border border-rose-500/40 bg-black/80 backdrop-blur-md text-xs font-mono text-rose-300 flex items-center gap-3 shadow-2xl">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{projectsError}</span>
          <button
            onClick={() => fetchProjects()}
            className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[10px]"
          >
            RETRY
          </button>
        </div>
      )}

      {/* Cinematic Introduction Overlay (Active at t < 0.08) */}
      <IntroOverlay />

      {/* 2D Overlay Route Views */}
      <main className="relative z-10 w-full h-full pointer-events-none">
        <Outlet />
      </main>

      {/* High-End Project Presentation Modal (URL & State Synchronized, Lazy-Loaded) */}
      <React.Suspense fallback={null}>
        <ProjectPresentationModal />
        <ObservatoryOverlay />
      </React.Suspense>
    </div>
  );
};
