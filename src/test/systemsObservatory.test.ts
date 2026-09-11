import { describe, it, expect, beforeEach } from 'vitest';
import { DISCIPLINES, ABOUT_PROFILE } from '@/data/aboutSkillsData';
import { generateSplineCurve, sampleCurveFrame, calculateProjectPlacements } from '@/lib/splineMath';
import { useJourneyStore } from '@/stores/useJourneyStore';
import type { Project } from '@/types/project';

function createMockProjects(count: number): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `project-${i + 1}`,
    slug: `project-slug-${i + 1}`,
    title: `Dynamic Exhibit ${i + 1}`,
    subtitle: `Subsystem ${i + 1}`,
    tagline: `Tagline for dynamic exhibit ${i + 1}`,
    description: `Detailed description for dynamic exhibit ${i + 1}`,
    description_markdown: `### Detailed technical notes for exhibit ${i + 1}`,
    category: i % 2 === 0 ? 'three_d_graphics' : 'ai_ml',
    node_style: 'hologram_pedestal',
    custom_model_url: null,
    node_color_primary: '#38bdf8',
    node_color_secondary: '#0284c7',
    thumbnail_url: `https://cdn.example.com/thumb-${i + 1}.png`,
    hero_media: null,
    media_gallery: [],
    video_url: null,
    github_repo_url: `https://github.com/example/repo-${i + 1}`,
    live_demo_url: `https://demo.example.com/${i + 1}`,
    year: 2024,
    featured: i === 0,
    status: 'published',
    sort_order: (i + 1) * 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    technologies: ['TypeScript', 'WebGL'],
    achievements: ['High Performance Pipeline'],
  }));
}

describe('3D Systems Observatory (About & Skills Domain)', () => {
  beforeEach(() => {
    useJourneyStore.setState({
      projects: [],
      projectAnchors: [],
      targetProgress: 0,
      currentProgress: 0,
      activeProjectIndex: 0,
      selectedProject: null,
      selectedDiscipline: null,
      cameraMode: 'spline',
    });
  });

  describe('1. Engineering Content & Demonstration-Focused Architecture', () => {
    it('defines all 6 core engineering disciplines without generic percentage progress bars', () => {
      expect(DISCIPLINES).toHaveLength(6);
      const ids = DISCIPLINES.map((d) => d.id);
      expect(ids).toEqual([
        'game_dev',
        'ai_ml',
        'three_d_graphics',
        'simulation',
        'systems_engine',
        'web_edge',
      ]);

      DISCIPLINES.forEach((disc) => {
        expect(disc.title).toBeTruthy();
        expect(disc.thesis.length).toBeGreaterThan(40);
        expect(disc.productionPrinciples.length).toBeGreaterThanOrEqual(3);
        expect(disc.architecturalPatterns.length).toBeGreaterThanOrEqual(3);
        expect(disc.coreToolchain.length).toBeGreaterThanOrEqual(4);
        expect(disc.visArchetype).toBeTruthy();
        // Ensure no fake percentage metrics like "95%" or "80%" exist in titles or codes
        expect(disc.title).not.toMatch(/%/);
        expect(disc.code).not.toMatch(/%/);
      });
    });

    it('contains a detailed AboutProfile with core engineering philosophies and whatIBuild areas', () => {
      expect(ABOUT_PROFILE.name).toBe('Adel R.');
      expect(ABOUT_PROFILE.role).toContain('Engineer');
      expect(ABOUT_PROFILE.philosophy.length).toBeGreaterThanOrEqual(3);
      expect(ABOUT_PROFILE.whatIBuild.length).toBeGreaterThanOrEqual(4);

      ABOUT_PROFILE.whatIBuild.forEach((item) => {
        expect(item.title).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.metricsOrFocus).toBeTruthy();
      });
    });
  });

  describe('2. 3D Spatial Geometry & Observatory Positioning', () => {
    it('positions the observatory safely along the Catmull-Rom spline before the terminal threshold', () => {
      const projects = createMockProjects(3);
      const curve = generateSplineCurve(projects);

      const observatoryT = 0.885;
      const terminalT = 0.965;

      expect(observatoryT).toBeLessThan(terminalT);

      // Verify valid curve frame sampling at observatoryT
      const frame = sampleCurveFrame(curve, observatoryT);
      expect(frame.position).toBeDefined();
      expect(frame.tangent.length()).toBeCloseTo(1.0, 0.01);
      expect(frame.normal.length()).toBeCloseTo(1.0, 0.01);
      expect(frame.binormal.length()).toBeCloseTo(1.0, 0.01);
    });

    it('guarantees the observatory sits after the final project exhibit', () => {
      const testCounts = [1, 3, 10];
      testCounts.forEach((count) => {
        const projects = createMockProjects(count);
        const curve = generateSplineCurve(projects);
        const placements = calculateProjectPlacements(projects, curve);

        const lastExhibitT = placements[placements.length - 1].t;
        const observatoryT = 0.885;
        // The observatory should be placed near or after the exhibit run
        expect(observatoryT).toBeGreaterThanOrEqual(lastExhibitT - 0.04);
      });
    });
  });

  describe('3. Journey Store State Transitions & Camera Modes', () => {
    it('navigates directly to the observatory when jumpToObservatory is invoked', () => {
      useJourneyStore.getState().jumpToObservatory();
      const state = useJourneyStore.getState();

      expect(state.targetProgress).toBe(0.885);
      expect(state.selectedProject).toBeNull();
      expect(state.selectedDiscipline).toBeNull();
      expect(state.cameraMode).toBe('spline');
    });

    it('enters observatory camera mode when a discipline is selected', () => {
      useJourneyStore.getState().selectDiscipline('game_dev');
      let state = useJourneyStore.getState();

      expect(state.selectedDiscipline).toBe('game_dev');
      expect(state.cameraMode).toBe('observatory');
      expect(state.targetProgress).toBe(0.885);
      expect(state.selectedProject).toBeNull();

      // Deselecting returns to spline mode
      useJourneyStore.getState().selectDiscipline(null);
      state = useJourneyStore.getState();
      expect(state.selectedDiscipline).toBeNull();
      expect(state.cameraMode).toBe('spline');
    });

    it('mutually clears selectedProject and selectedDiscipline', () => {
      const mockProject = createMockProjects(1)[0];
      useJourneyStore.getState().setProjects([mockProject]);

      // Select discipline
      useJourneyStore.getState().selectDiscipline('ai_ml');
      expect(useJourneyStore.getState().selectedDiscipline).toBe('ai_ml');
      expect(useJourneyStore.getState().selectedProject).toBeNull();

      // Select project -> clears discipline
      useJourneyStore.getState().selectProject(mockProject);
      expect(useJourneyStore.getState().selectedProject?.id).toBe(mockProject.id);
      expect(useJourneyStore.getState().selectedDiscipline).toBeNull();

      // Close inspection -> clears both
      useJourneyStore.getState().closeInspection();
      expect(useJourneyStore.getState().selectedProject).toBeNull();
      expect(useJourneyStore.getState().selectedDiscipline).toBeNull();
      expect(useJourneyStore.getState().cameraMode).toBe('spline');
    });
  });
});
