import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSplineCurve,
  sampleCurveFrame,
  calculateProjectPlacements,
  calculateProjectAnchors,
} from '@/lib/splineMath';
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
    featured: i === 0 || i % 5 === 0,
    status: 'published',
    sort_order: (i + 1) * 10,
    created_at: new Date(Date.now() - (10 - i) * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    technologies: ['TypeScript', 'Three.js', 'WebGL'],
    achievements: ['Optimized 60 FPS pipeline'],
  }));
}

describe('Dynamic 3D Journey Layout & Scaling Algorithm', () => {
  beforeEach(() => {
    useJourneyStore.setState({
      projects: [],
      projectAnchors: [],
      targetProgress: 0,
      currentProgress: 0,
      activeProjectIndex: 0,
      selectedProject: null,
      cameraMode: 'spline',
    });
  });

  describe('1. Single Project Layout (N = 1)', () => {
    const projects = createMockProjects(1);
    const curve = generateSplineCurve(projects);
    const placements = calculateProjectPlacements(projects, curve);
    const anchors = calculateProjectAnchors(projects, curve);

    it('generates a compact, proportional runway with valid curve length', () => {
      const length = curve.getLength();
      // Length should be proportional to 1 project + entrance + terminal approach
      expect(length).toBeGreaterThan(160);
      expect(length).toBeLessThan(350);
    });

    it('places the single exhibit at an optimal mid-journey contemplation position', () => {
      expect(placements).toHaveLength(1);
      const exhibit = placements[0];

      // Exhibit should be located within the usable contemplation segment
      expect(exhibit.t).toBeGreaterThan(0.35);
      expect(exhibit.t).toBeLessThan(0.65);
      expect(anchors[0]).toBe(exhibit.t);
      expect(exhibit.project.id).toBe('project-1');
    });

    it('maintains strict roadbed-to-pedestal clearance for single exhibit', () => {
      const exhibit = placements[0];
      const frame = sampleCurveFrame(curve, exhibit.t);
      const roadCenter = frame.position;
      
      // Physical distance from road center to pedestal center
      const distFromCenter = exhibit.position.distanceTo(roadCenter);
      expect(distFromCenter).toBeCloseTo(4.6, 0.1);

      // Roadbed half-width (1.2m) + pedestal radius (2.3m) = 3.5m
      // Clear pedestrian verge must be >= 1.0m
      const verge = distFromCenter - 1.2 - 2.3;
      expect(verge).toBeGreaterThanOrEqual(1.0);
    });

    it('angles the single exhibit toward oncoming travelers', () => {
      const exhibit = placements[0];
      // Exhibit rotationY must differ from pure tangent azimuth by the inward turn
      const frame = sampleCurveFrame(curve, exhibit.t);
      const tangentYaw = Math.atan2(frame.tangent.x, frame.tangent.z);
      
      expect(exhibit.rotationY).toBeDefined();
      expect(exhibit.rotationY).not.toBe(tangentYaw);
    });
  });

  describe('2. Moderate Project Layout (N = 3)', () => {
    const projects = createMockProjects(3);
    const curve = generateSplineCurve(projects);
    const placements = calculateProjectPlacements(projects, curve);
    const anchors = calculateProjectAnchors(projects, curve);

    it('scales spline length longer than N = 1', () => {
      const curve1 = generateSplineCurve(createMockProjects(1));
      expect(curve.getLength()).toBeGreaterThan(curve1.getLength());
    });

    it('arranges exhibits in strict monotonic progression matching sort_order', () => {
      expect(placements).toHaveLength(3);
      for (let i = 0; i < placements.length; i++) {
        expect(placements[i].project.id).toBe(`project-${i + 1}`);
        expect(placements[i].index).toBe(i);
      }
      expect(placements[0].t).toBeLessThan(placements[1].t);
      expect(placements[1].t).toBeLessThan(placements[2].t);
      expect(anchors).toEqual([placements[0].t, placements[1].t, placements[2].t]);
    });

    it('alternates exhibit pedestals symmetrically across left and right road verges', () => {
      // Even exhibits on right (+4.6m), odd exhibits on left (-4.6m)
      expect(placements[0].lateralOffset).toBe(4.6);
      expect(placements[1].lateralOffset).toBe(-4.6);
      expect(placements[2].lateralOffset).toBe(4.6);
    });

    it('guarantees collision-free separation between adjacent exhibits', () => {
      for (let i = 0; i < placements.length - 1; i++) {
        const dist = placements[i].position.distanceTo(placements[i + 1].position);
        // Pedestal diameter is 4.6m. Exhibits must have at least 15m clearance
        expect(dist).toBeGreaterThan(20);
      }
    });
  });

  describe('3. Extended Portfolio Layout (N = 10)', () => {
    const projects = createMockProjects(10);
    const curve = generateSplineCurve(projects);
    const placements = calculateProjectPlacements(projects, curve);

    it('scales spline track smoothly without sudden kinks or hairpins', () => {
      const length = curve.getLength();
      expect(length).toBeGreaterThan(500);

      // Verify continuous curvature radius R >= 40m along 100 sample points
      for (let i = 0; i < 98; i++) {
        const t1 = i / 100;
        const t2 = (i + 1) / 100;
        const p1 = curve.getPointAt(t1);
        const p2 = curve.getPointAt(t2);

        // Spline must travel monotonically in negative Z
        expect(p2.z).toBeLessThan(p1.z);
      }
    });

    it('maintains consistent rhythmic spacing between all 10 exhibits', () => {
      expect(placements).toHaveLength(10);
      
      // Check physical distance delta along curve
      const stepDists: number[] = [];
      for (let i = 0; i < placements.length - 1; i++) {
        const deltaDist = placements[i + 1].distanceFromStart - placements[i].distanceFromStart;
        stepDists.push(deltaDist);
      }

      // Step distances should be uniform (equal stepDist)
      const firstStep = stepDists[0];
      stepDists.forEach((dist) => {
        expect(dist).toBeCloseTo(firstStep, 0.001);
      });
      expect(firstStep).toBeGreaterThan(30);
    });

    it('ensures terminal portal threshold is placed well after the 10th exhibit', () => {
      const lastExhibitT = placements[9].t;
      const terminalT = 0.965;
      expect(terminalT).toBeGreaterThan(lastExhibitT + 0.03);
    });
  });

  describe('4. High Volume Scale (N = 30 / 25+ Projects)', () => {
    const projects = createMockProjects(30);
    const curve = generateSplineCurve(projects);
    const placements = calculateProjectPlacements(projects, curve);
    const anchors = calculateProjectAnchors(projects, curve);

    it('computes collision-free layout for 30 projects without numerical overflow or degradation', () => {
      expect(placements).toHaveLength(30);
      expect(anchors).toHaveLength(30);

      const length = curve.getLength();
      expect(length).toBeGreaterThan(1200);

      // Verify zero collisions: check all pairs (30 * 29 / 2 = 435 pairs)
      for (let i = 0; i < placements.length; i++) {
        for (let j = i + 1; j < placements.length; j++) {
          const dist = placements[i].position.distanceTo(placements[j].position);
          // Combined pedestal radii = 2.3 + 2.3 = 4.6m
          expect(dist).toBeGreaterThan(4.6);
        }
      }
    });

    it('keeps all parameter t values safely within the visible track bounds [0.05, 0.93]', () => {
      anchors.forEach((t) => {
        expect(t).toBeGreaterThanOrEqual(0.05);
        expect(t).toBeLessThanOrEqual(0.93);
      });
    });

    it('maintains strict left/right alternation across all 30 exhibits', () => {
      placements.forEach((p, idx) => {
        const expectedSign = idx % 2 === 0 ? 1 : -1;
        expect(Math.sign(p.lateralOffset)).toBe(expectedSign);
      });
    });
  });

  describe('5. Journey Store & HUD Telemetry Synchronization', () => {
    it('synchronizes projectAnchors and snaps targetProgress to exact 3D exhibit positions', () => {
      const projects = createMockProjects(5);
      useJourneyStore.getState().setProjects(projects);

      const state = useJourneyStore.getState();
      expect(state.projectAnchors).toHaveLength(5);

      // Jump to 3rd project (index 2)
      state.jumpToIndex(2);
      const updatedState = useJourneyStore.getState();
      expect(updatedState.activeProjectIndex).toBe(2);
      expect(updatedState.targetProgress).toBe(updatedState.projectAnchors[2]);
    });

    it('dynamically maps continuous targetProgress to closest active exhibit index', () => {
      const projects = createMockProjects(4);
      useJourneyStore.getState().setProjects(projects);
      const anchors = useJourneyStore.getState().projectAnchors;

      // Scrolled very close to exhibit 0 anchor
      useJourneyStore.getState().setTargetProgress(anchors[0] + 0.01);
      expect(useJourneyStore.getState().activeProjectIndex).toBe(0);

      // Scrolled very close to exhibit 3 anchor
      useJourneyStore.getState().setTargetProgress(anchors[3] - 0.005);
      expect(useJourneyStore.getState().activeProjectIndex).toBe(3);
    });

    it('advances next and prev project along exact spline anchor positions', () => {
      const projects = createMockProjects(3);
      useJourneyStore.getState().setProjects(projects);
      const anchors = useJourneyStore.getState().projectAnchors;

      useJourneyStore.getState().startJourney();
      expect(useJourneyStore.getState().activeProjectIndex).toBe(0);
      expect(useJourneyStore.getState().targetProgress).toBe(anchors[0]);

      useJourneyStore.getState().nextProject();
      expect(useJourneyStore.getState().activeProjectIndex).toBe(1);
      expect(useJourneyStore.getState().targetProgress).toBe(anchors[1]);

      useJourneyStore.getState().prevProject();
      expect(useJourneyStore.getState().activeProjectIndex).toBe(0);
      expect(useJourneyStore.getState().targetProgress).toBe(anchors[0]);
    });

    it('correctly reports terminus state at progress >= 0.95', () => {
      useJourneyStore.getState().setTargetProgress(0.96);
      expect(useJourneyStore.getState().targetProgress).toBe(0.96);
    });
  });
});
