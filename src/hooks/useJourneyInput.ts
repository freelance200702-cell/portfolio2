import { useEffect, useRef } from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';

interface JourneyInputOptions {
  wheelSensitivity?: number;
  touchSensitivity?: number;
  keyboardStep?: number;
}

export function useJourneyInput(options: JourneyInputOptions = {}) {
  const {
    wheelSensitivity = 0.00045,
    touchSensitivity = 0.0018,
    keyboardStep = 0.04,
  } = options;

  const targetProgress = useJourneyStore((s) => s.targetProgress);
  const setTargetProgress = useJourneyStore((s) => s.setTargetProgress);
  const selectedProject = useJourneyStore((s) => s.selectedProject);
  const selectProject = useJourneyStore((s) => s.selectProject);
  const closeInspection = useJourneyStore((s) => s.closeInspection);
  const activeProjectIndex = useJourneyStore((s) => s.activeProjectIndex);
  const projects = useJourneyStore((s) => s.projects);
  const nextProject = useJourneyStore((s) => s.nextProject);
  const prevProject = useJourneyStore((s) => s.prevProject);

  const cameraMode = useJourneyStore((s) => s.cameraMode);
  const selectedDiscipline = useJourneyStore((s) => s.selectedDiscipline);
  const selectDiscipline = useJourneyStore((s) => s.selectDiscipline);

  // Inertia momentum buffer for silky smooth trackpad and mouse wheel deceleration
  const wheelVelocity = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchLastY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const touchVelocityY = useRef<number>(0);

  // 1. Mouse Wheel Listener with Momentum
  useEffect(() => {
    let animationFrameId: number;

    const handleWheel = (e: WheelEvent) => {
      // If modal drawer or observatory overlay is open, don't move camera with wheel
      if (selectedProject || cameraMode === 'observatory') return;

      e.preventDefault();
      // Normalize wheel delta across trackpads and mouse wheels
      const delta = Math.max(-100, Math.min(100, e.deltaY));
      wheelVelocity.current += delta * wheelSensitivity;
    };

    const updateMomentum = () => {
      if (Math.abs(wheelVelocity.current) > 0.00001 && !selectedProject && cameraMode !== 'observatory') {
        const currentTarget = useJourneyStore.getState().targetProgress;
        setTargetProgress(currentTarget + wheelVelocity.current);
        // Exponential friction decay
        wheelVelocity.current *= 0.88;
      } else {
        wheelVelocity.current = 0;
      }
      animationFrameId = requestAnimationFrame(updateMomentum);
    };

    animationFrameId = requestAnimationFrame(updateMomentum);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [selectedProject, cameraMode, wheelSensitivity, setTargetProgress]);

  // 2. Touch Drag & Horizontal Swipe Gestures for Mobile Viewports
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (selectedProject || cameraMode === 'observatory') return;
      if (e.touches[0]) {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        touchLastY.current = e.touches[0].clientY;
        touchStartTime.current = performance.now();
        touchVelocityY.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (selectedProject || cameraMode === 'observatory' || touchLastY.current === null || !e.touches[0]) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchLastY.current - currentY;
      touchVelocityY.current = deltaY * touchSensitivity;
      touchLastY.current = currentY;

      const currentTarget = useJourneyStore.getState().targetProgress;
      setTargetProgress(currentTarget + touchVelocityY.current);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current !== null && touchStartY.current !== null && e.changedTouches[0]) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - touchStartX.current;
        const deltaY = endY - touchStartY.current;
        const duration = performance.now() - touchStartTime.current;

        // Horizontal flick gesture: fast swipe switches waypoint
        if (duration < 350 && Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
          if (deltaX < 0) {
            nextProject();
          } else {
            prevProject();
          }
          touchVelocityY.current = 0;
        }
      }

      // Transfer touch flick momentum into the continuous decay buffer
      if (Math.abs(touchVelocityY.current) > 0.0003) {
        wheelVelocity.current += touchVelocityY.current * 1.8;
      }

      touchStartX.current = null;
      touchStartY.current = null;
      touchLastY.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    selectedProject,
    cameraMode,
    touchSensitivity,
    setTargetProgress,
    nextProject,
    prevProject,
  ]);

  // 3. Comprehensive Keyboard Controls (WASD, Arrows, Space, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes inspect or observatory mode
      if (e.key === 'Escape' && (selectedProject || cameraMode === 'observatory')) {
        closeInspection();
        return;
      }

      // Space key opens/inspects currently active project
      if ((e.code === 'Space' || e.key === ' ') && !selectedProject && cameraMode !== 'observatory') {
        e.preventDefault();
        const activeProj = projects[activeProjectIndex];
        if (activeProj) {
          selectProject(activeProj);
        }
        return;
      }

      if (selectedProject) return;

      if (cameraMode === 'observatory') {
        const DISC_IDS = ['game_dev', 'ai_ml', 'three_d_graphics', 'simulation', 'systems_engine', 'web_edge'];
        const currentIdx = Math.max(0, DISC_IDS.indexOf(selectedDiscipline || 'game_dev'));
        if (e.key === 'ArrowRight' || e.key === 'KeyD' || e.code === 'KeyD') {
          e.preventDefault();
          selectDiscipline(DISC_IDS[(currentIdx + 1) % DISC_IDS.length]);
        } else if (e.key === 'ArrowLeft' || e.key === 'KeyA' || e.code === 'KeyA') {
          e.preventDefault();
          selectDiscipline(DISC_IDS[(currentIdx - 1 + DISC_IDS.length) % DISC_IDS.length]);
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'KeyS' || e.code === 'KeyS') {
        e.preventDefault();
        setTargetProgress(targetProgress + keyboardStep);
      } else if (e.key === 'ArrowUp' || e.key === 'KeyW' || e.code === 'KeyW') {
        e.preventDefault();
        setTargetProgress(targetProgress - keyboardStep);
      } else if (e.key === 'ArrowRight' || e.key === 'KeyD' || e.code === 'KeyD') {
        e.preventDefault();
        nextProject();
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA' || e.code === 'KeyA') {
        e.preventDefault();
        prevProject();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setTargetProgress(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setTargetProgress(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    targetProgress,
    keyboardStep,
    selectedProject,
    cameraMode,
    selectedDiscipline,
    selectDiscipline,
    closeInspection,
    selectProject,
    projects,
    activeProjectIndex,
    setTargetProgress,
    nextProject,
    prevProject,
  ]);
}
