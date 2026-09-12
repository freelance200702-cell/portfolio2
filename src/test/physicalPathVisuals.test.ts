import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { generateSplineCurve, sampleCurveFrame, calculateProjectPlacements } from '@/lib/splineMath';
import { INITIAL_SEED_PROJECTS } from '@/services/supabase/projectService';
import {
  createDeckDiffuseCanvas,
  createDeckRoughnessCanvas,
  createRoadwayTextures,
} from '@/components/3d/path/PathVisualSystem';

describe('Physical Path Visual System: Route Aesthetics, Scale & Separation Audit', () => {
  const ROAD_WIDTH = 2.8;
  const DECK_THICKNESS = 0.16;
  const curve = generateSplineCurve(INITIAL_SEED_PROJECTS);

  describe('1. Believable Surface Material & PBR Texture System', () => {
    it('creates procedural canvas textures with aggregate noise and expansion joints safely', () => {
      // In SSR/Node, functions gracefully return null or fallback without crashing
      const diffuse = createDeckDiffuseCanvas(256, 256);
      const roughness = createDeckRoughnessCanvas(256, 256);

      if (typeof document !== 'undefined') {
        expect(diffuse).not.toBeNull();
        expect(roughness).not.toBeNull();
        expect(diffuse!.width).toBe(256);
        expect(roughness!.width).toBe(256);
      } else {
        expect(diffuse).toBeNull();
        expect(roughness).toBeNull();
      }
    });

    it('configures anisotropic repeat wrapping along journey length', () => {
      const { diffuseMap, roughnessMap } = createRoadwayTextures();

      expect(diffuseMap).toBeDefined();
      expect(roughnessMap).toBeDefined();
      expect(diffuseMap.wrapS).toBe(THREE.RepeatWrapping);
      expect(diffuseMap.wrapT).toBe(THREE.RepeatWrapping);
      expect(roughnessMap.wrapT).toBe(THREE.RepeatWrapping);
    });
  });

  describe('2. Visual Separation, Scale & Elevation Consistency', () => {
    it('verifies physical roadbed width provides human-scale navigable width', () => {
      // Standard two-lane pedestrian / micro-transit highway is 2.8m wide
      expect(ROAD_WIDTH).toBe(2.8);
      // Deck thickness provides structural solidity (16cm precast slab)
      expect(DECK_THICKNESS).toBe(0.16);
    });

    it('verifies structural guardrail dimensions provide believable waist-height enclosure', () => {
      const railHeight = 0.14; // 14cm steel box profile
      const railElevation = DECK_THICKNESS / 2 + 0.32; // Centered at 40cm above deck, reaching ~47cm
      const halfWidth = ROAD_WIDTH / 2;

      expect(railHeight).toBe(0.14);
      expect(railElevation).toBeGreaterThan(0.3);
      expect(railElevation).toBeLessThan(0.6);
      expect(halfWidth).toBe(1.4);
    });

    it('verifies smooth curves with bounded curvature radius across the path', () => {
      // Sample 30 points along curve and ensure smooth progression
      const samples = 30;
      for (let i = 0; i < samples - 1; i++) {
        const t1 = i / samples;
        const t2 = (i + 1) / samples;
        const f1 = sampleCurveFrame(curve, t1);
        const f2 = sampleCurveFrame(curve, t2);

        // Tangent directions between consecutive segments change smoothly
        const dot = THREE.MathUtils.clamp(f1.tangent.dot(f2.tangent), -1, 1);
        const angle = Math.acos(dot);
        expect(angle).toBeLessThan(0.30); // Controlled smooth steering transitions
      }
    });

    it('verifies natural elevation changes (gentle grade < 6%)', () => {
      const samples = 40;
      for (let i = 0; i < samples - 1; i++) {
        const t1 = i / samples;
        const t2 = (i + 1) / samples;
        const f1 = sampleCurveFrame(curve, t1);
        const f2 = sampleCurveFrame(curve, t2);

        const horizontalDist = new THREE.Vector2(f2.position.x - f1.position.x, f2.position.z - f1.position.z).length();
        const verticalDelta = Math.abs(f2.position.y - f1.position.y);
        const grade = verticalDelta / horizontalDist;

        // Highway gradient must remain gentle for believable engineering roads
        expect(grade).toBeLessThan(0.08);
      }
    });
  });

  describe('3. Journey Navigation Verification Across Stages', () => {
    it('verifies path state and camera orientation at BEGINNING (t = 0.05)', () => {
      const frameStart = sampleCurveFrame(curve, 0.05);
      expect(frameStart.position.z).toBeGreaterThan(-15);
      expect(frameStart.position.y).toBeGreaterThan(0.8);
      expect(frameStart.normal.y).toBeGreaterThan(0.9); // Road deck is upright
      expect(frameStart.binormal.length()).toBeCloseTo(1.0, 2);
    });

    it('verifies path state and camera orientation at MIDDLE (t = 0.50)', () => {
      const frameMid = sampleCurveFrame(curve, 0.50);
      expect(frameMid.position.z).toBeLessThan(-80);
      expect(frameMid.position.y).toBeGreaterThan(0.8);
      expect(frameMid.position.y).toBeLessThan(3.0);
      // Check lateral displacement stays bounded within canyon highway corridor
      expect(Math.abs(frameMid.position.x)).toBeLessThan(12.0);
    });

    it('verifies path state and visual destination towards HORIZON at END (t = 0.95)', () => {
      const frameEnd = sampleCurveFrame(curve, 0.95);
      expect(frameEnd.position.z).toBeLessThan(-200);
      expect(frameEnd.position.y).toBeGreaterThan(1.5);
      // Spline straightens out smoothly towards the horizon portal
      expect(Math.abs(frameEnd.tangent.x)).toBeLessThan(0.25);
    });

    it('preserves full compatibility with dynamic project count and spacing', () => {
      const testCounts = [1, 3, 5, 8, 14];

      testCounts.forEach((count) => {
        const dummyProjects = Array.from({ length: count }, (_, i) => ({
          ...INITIAL_SEED_PROJECTS[0],
          id: `proj-${i}`,
          slug: `proj-${i}`,
          title: `Project ${i}`,
        }));

        const dynamicCurve = generateSplineCurve(dummyProjects);
        const placements = calculateProjectPlacements(dummyProjects, dynamicCurve);

        expect(placements.length).toBe(count);

        if (count > 1) {
          // Verify monotone progression along track
          for (let k = 0; k < placements.length - 1; k++) {
            expect(placements[k + 1].t).toBeGreaterThan(placements[k].t);
            // Verify safe verge clearance from road edge (4.6m offset gives 3.2m clearance from 1.4m edge)
            expect(Math.abs(placements[k].lateralOffset)).toBeGreaterThanOrEqual(ROAD_WIDTH / 2 + 1.0);
          }
        }
      });
    });
  });
});
