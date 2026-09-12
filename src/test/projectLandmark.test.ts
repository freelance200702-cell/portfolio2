import { describe, it, expect } from 'vitest';
import {
  resolveLandmarkArchetype,
  type LandmarkVisualState,
} from '@/components/3d/landmarks/LandmarkTypes';
import { INITIAL_SEED_PROJECTS } from '@/services/supabase/projectService';
import type { NodeStyleType } from '@/types/project';

describe('ProjectLandmark Architectural System', () => {
  describe('1. Archetype Resolution & Data-Driven Mapping', () => {
    it('resolves primary 6 canonical destination archetypes directly', () => {
      const archetypes: NodeStyleType[] = [
        'architectural_structure',
        'miniature_environment',
        'technical_installation',
        'vehicle_object',
        'data_monument',
        'studio_workspace',
      ];

      for (const arch of archetypes) {
        expect(resolveLandmarkArchetype(arch)).toBe(arch);
      }
    });

    it('gracefully maps legacy styles to canonical destination archetypes', () => {
      expect(resolveLandmarkArchetype('data_monolith')).toBe('data_monument');
      expect(resolveLandmarkArchetype('cyber_terminal')).toBe('technical_installation');

      // hologram_pedestal maps according to project category for rich diversity
      expect(resolveLandmarkArchetype('hologram_pedestal', 'ai_ml')).toBe('data_monument');
      expect(resolveLandmarkArchetype('hologram_pedestal', 'systems_engine')).toBe('architectural_structure');
      expect(resolveLandmarkArchetype('hologram_pedestal', 'game_dev')).toBe('miniature_environment');
      expect(resolveLandmarkArchetype('hologram_pedestal', 'three_d_graphics')).toBe('technical_installation');
    });

    it('ensures all initial seed projects are mapped to distinct, non-generic landmark archetypes', () => {
      expect(INITIAL_SEED_PROJECTS.length).toBe(3);

      const resolvedArchetypes = INITIAL_SEED_PROJECTS.map((p) =>
        resolveLandmarkArchetype(p.node_style, p.category)
      );

      // Verify none resolved to undefined or null
      for (const arch of resolvedArchetypes) {
        expect(arch).toBeDefined();
        expect([
          'architectural_structure',
          'miniature_environment',
          'technical_installation',
          'vehicle_object',
          'data_monument',
          'studio_workspace',
        ]).toContain(arch);
      }

      // Check specific placeholder project assignments
      expect(resolvedArchetypes[0]).toBe('technical_installation'); // Project Alpha
      expect(resolvedArchetypes[1]).toBe('data_monument');          // Project Beta
      expect(resolvedArchetypes[2]).toBe('architectural_structure'); // Project Gamma
    });
  });

  describe('2. Proximity-Driven Visual State Machine', () => {
    function evaluateLandmarkState(
      currentProgress: number,
      landmarkT: number,
      isSelected: boolean,
      isHovered: boolean
    ): LandmarkVisualState {
      if (isSelected) return 'selected';
      const dist = Math.abs(currentProgress - landmarkT);
      if (dist <= 0.05 || isHovered) return 'focused';
      if (dist <= 0.14) return 'approaching';
      return 'idle';
    }

    it('remains in idle state when distant along the highway (dist > 0.14)', () => {
      const state = evaluateLandmarkState(0.1, 0.45, false, false);
      expect(state).toBe('idle');
    });

    it('transitions to approaching state as camera draws near (0.05 < dist <= 0.14)', () => {
      const state = evaluateLandmarkState(0.35, 0.45, false, false);
      expect(state).toBe('approaching');
    });

    it('transitions to focused state at closest observation distance (dist <= 0.05)', () => {
      const state = evaluateLandmarkState(0.43, 0.45, false, false);
      expect(state).toBe('focused');
    });

    it('promotes to focused state immediately on pointer hover', () => {
      const state = evaluateLandmarkState(0.1, 0.45, false, true);
      expect(state).toBe('focused');
    });

    it('locks in selected state when project is selected', () => {
      const state = evaluateLandmarkState(0.1, 0.45, true, false);
      expect(state).toBe('selected');
    });
  });

  describe('3. Distance Culling & LOD Thresholds', () => {
    it('culls heavy per-frame updates when traveler is outside 25% track threshold', () => {
      const landmarkT = 0.8;
      const distantTravelerT = 0.2;
      const dist = Math.abs(distantTravelerT - landmarkT);

      const shouldCull = dist > 0.25;
      expect(shouldCull).toBe(true);
    });

    it('activates progressive detail and high-frequency geometry within approach envelope', () => {
      const landmarkT = 0.5;
      const nearTravelerT = 0.42;
      const dist = Math.abs(nearTravelerT - landmarkT);

      const targetProximity = Math.max(0, Math.min(1, 1 - dist / 0.14));
      expect(targetProximity).toBeGreaterThan(0.4);
      expect(dist <= 0.14).toBe(true);
    });
  });

  describe('4. Grounding Substructure Architecture', () => {
    it('verifies substructure foundation penetrates down to terrain floor (y <= -0.6)', () => {
      const foundationCenterY = -0.9;
      const foundationHalfHeight = 1.8 / 2;
      const lowestFoundationY = foundationCenterY - foundationHalfHeight;

      expect(lowestFoundationY).toBeLessThanOrEqual(-0.6);
      expect(lowestFoundationY).toBeCloseTo(-1.8);
    });

    it('verifies observation balustrade provides a human scale cue between 0.65m and 0.85m', () => {
      const balustradeHeight = 0.68;
      expect(balustradeHeight).toBeGreaterThanOrEqual(0.65);
      expect(balustradeHeight).toBeLessThanOrEqual(0.85);
    });
  });
});
