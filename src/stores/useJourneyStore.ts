import { create } from 'zustand';
import type { Project } from '@/types/project';
import { projectService } from '@/services/supabase/projectService';
import { calculateProjectAnchors } from '@/lib/splineMath';

interface JourneyState {
  // Navigation progress along the spline (0.0 to 1.0)
  targetProgress: number;
  currentProgress: number;
  
  // Projects loaded on the path and their exact spline parameter coordinates
  projects: Project[];
  projectAnchors: number[];
  activeProjectIndex: number;
  selectedProject: Project | null;
  selectedDiscipline: string | null;
  cameraMode: 'spline' | 'inspecting' | 'observatory';
  
  // Asynchronous Loading & Error Tracking
  isLoadingProjects: boolean;
  projectsError: string | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  fetchProjects: () => Promise<void>;
  setTargetProgress: (progress: number) => void;
  setCurrentProgress: (progress: number) => void;
  selectProject: (project: Project | null) => void;
  selectProjectBySlug: (slug: string, instantAlign?: boolean) => Project | null;
  selectDiscipline: (id: string | null) => void;
  jumpToObservatory: () => void;
  closeInspection: () => void;
  jumpToIndex: (index: number) => void;
  nextProject: () => Project | null;
  prevProject: () => Project | null;
  startJourney: () => void;
}

export const useJourneyStore = create<JourneyState>((set, get) => ({
  targetProgress: 0,
  currentProgress: 0,
  projects: [],
  projectAnchors: [],
  activeProjectIndex: 0,
  selectedProject: null,
  selectedDiscipline: null,
  cameraMode: 'spline',
  isLoadingProjects: false,
  projectsError: null,

  fetchProjects: async () => {
    set({ isLoadingProjects: true, projectsError: null });
    try {
      const data = await projectService.getPublishedProjects();
      const currentSelected = get().selectedProject;
      let newSelected = currentSelected;
      if (currentSelected) {
        newSelected = data.find((p) => p.id === currentSelected.id) || null;
      }
      const anchors = calculateProjectAnchors(data);
      set({
        projects: data,
        projectAnchors: anchors,
        isLoadingProjects: false,
        projectsError: null,
        selectedProject: newSelected,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to synchronize projects with Supabase.';
      set({
        isLoadingProjects: false,
        projectsError: msg,
      });
    }
  },

  setProjects: (projects) => {
    const currentSelected = get().selectedProject;
    let newSelected = currentSelected;
    if (currentSelected) {
      newSelected = projects.find((p) => p.id === currentSelected.id) || null;
    }
    const currentIdx = get().activeProjectIndex;
    const clampedIdx = projects.length > 0 ? Math.min(projects.length - 1, currentIdx) : 0;
    const anchors = calculateProjectAnchors(projects);
    set({
      projects,
      projectAnchors: anchors,
      selectedProject: newSelected,
      activeProjectIndex: clampedIdx,
    });
  },

  setTargetProgress: (progress) => {
    const clamped = Math.max(0, Math.min(1, progress));
    const { projectAnchors, projects } = get();
    
    // Determine closest project index based on actual spline parameter coordinates
    let closestIndex = 0;
    if (projectAnchors.length > 0) {
      let minDiff = Infinity;
      for (let i = 0; i < projectAnchors.length; i++) {
        const diff = Math.abs(clamped - projectAnchors[i]);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = i;
        }
      }
    } else if (projects.length > 0) {
      const step = 1 / (projects.length + 1);
      const approxIndex = Math.round(clamped / step) - 1;
      closestIndex = Math.max(0, Math.min(projects.length - 1, approxIndex));
    }

    set({
      targetProgress: clamped,
      activeProjectIndex: closestIndex,
    });
  },

  setCurrentProgress: (progress) => {
    set({ currentProgress: progress });
  },

  selectProject: (project) => {
    if (!project) {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/project/')) {
        window.history.pushState(null, '', '/');
      }
      set({
        selectedProject: null,
        selectedDiscipline: null,
        cameraMode: 'spline',
      });
      return;
    }

    if (typeof window !== 'undefined' && window.location.pathname !== `/project/${project.slug}`) {
      window.history.pushState(null, '', `/project/${project.slug}`);
    }

    const { projects, projectAnchors } = get();
    const index = projects.findIndex((p) => p.id === project.id);
    if (index !== -1) {
      const targetT = projectAnchors[index] ?? (index + 1) / (projects.length + 1);
      set({
        selectedProject: project,
        selectedDiscipline: null,
        activeProjectIndex: index,
        targetProgress: targetT,
        cameraMode: 'inspecting',
      });
    } else {
      set({
        selectedProject: project,
        selectedDiscipline: null,
        cameraMode: 'inspecting',
      });
    }
  },

  selectProjectBySlug: (slug, instantAlign = false) => {
    const { projects, projectAnchors } = get();
    const index = projects.findIndex((p) => p.slug === slug);
    if (index === -1) return null;

    const project = projects[index];
    const targetT = projectAnchors[index] ?? (index + 1) / (projects.length + 1);

    if (typeof window !== 'undefined' && window.location.pathname !== `/project/${project.slug}`) {
      window.history.pushState(null, '', `/project/${project.slug}`);
    }

    set({
      selectedProject: project,
      selectedDiscipline: null,
      activeProjectIndex: index,
      targetProgress: targetT,
      ...(instantAlign ? { currentProgress: targetT } : {}),
      cameraMode: 'inspecting',
    });

    return project;
  },

  selectDiscipline: (id) => {
    if (!id) {
      set({
        selectedDiscipline: null,
        cameraMode: 'spline',
      });
      return;
    }

    set({
      selectedDiscipline: id,
      selectedProject: null,
      targetProgress: 0.885,
      cameraMode: 'observatory',
    });
  },

  jumpToObservatory: () => {
    set({
      targetProgress: 0.885,
      selectedProject: null,
      selectedDiscipline: null,
      cameraMode: 'spline',
    });
  },

  closeInspection: () => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/project/')) {
      window.history.pushState(null, '', '/');
    }
    set({
      selectedProject: null,
      selectedDiscipline: null,
      cameraMode: 'spline',
    });
  },

  jumpToIndex: (index) => {
    const { projects, projectAnchors } = get();
    if (projects.length === 0) return;
    const clampedIndex = Math.max(0, Math.min(projects.length - 1, index));
    const targetT = projectAnchors[clampedIndex] ?? (clampedIndex + 1) / (projects.length + 1);
    set({
      targetProgress: targetT,
      activeProjectIndex: clampedIndex,
    });
  },

  nextProject: () => {
    const { activeProjectIndex, projects, projectAnchors, cameraMode } = get();
    if (projects.length === 0) return null;
    const nextIdx = (activeProjectIndex + 1) % projects.length;
    const targetT = projectAnchors[nextIdx] ?? (nextIdx + 1) / (projects.length + 1);
    const nextProj = projects[nextIdx];

    if (cameraMode === 'inspecting') {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/project/${nextProj.slug}`);
      }
      set({
        activeProjectIndex: nextIdx,
        targetProgress: targetT,
        selectedProject: nextProj,
      });
    } else {
      set({
        activeProjectIndex: nextIdx,
        targetProgress: targetT,
      });
    }
    return nextProj;
  },

  prevProject: () => {
    const { activeProjectIndex, projects, projectAnchors, cameraMode } = get();
    if (projects.length === 0) return null;
    const prevIdx = (activeProjectIndex - 1 + projects.length) % projects.length;
    const targetT = projectAnchors[prevIdx] ?? (prevIdx + 1) / (projects.length + 1);
    const prevProj = projects[prevIdx];

    if (cameraMode === 'inspecting') {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/project/${prevProj.slug}`);
      }
      set({
        activeProjectIndex: prevIdx,
        targetProgress: targetT,
        selectedProject: prevProj,
      });
    } else {
      set({
        activeProjectIndex: prevIdx,
        targetProgress: targetT,
      });
    }
    return prevProj;
  },

  startJourney: () => {
    const { projectAnchors } = get();
    const firstProjectT = projectAnchors.length > 0 ? projectAnchors[0] : 0.25;

    // Accessibility check: prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      set({
        targetProgress: firstProjectT,
        currentProgress: firstProjectT,
        activeProjectIndex: 0,
      });
    } else {
      set({
        targetProgress: firstProjectT,
        activeProjectIndex: 0,
      });
    }
  },
}));
