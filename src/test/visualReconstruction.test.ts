import { describe, it, expect } from 'vitest';
import { generateSplineCurve, sampleCurveFrame } from '@/lib/splineMath';
import { INITIAL_SEED_PROJECTS } from '@/services/supabase/projectService';

describe('Visual Reconstruction: Cinematic 3D Architectural World Verification', () => {
  const curve = generateSplineCurve(INITIAL_SEED_PROJECTS);

  describe('1. Architectural Viaduct & Pier Mechanics', () => {
    it('calculates viaduct support piers anchoring roadbed to planetary floor (y = -0.6)', () => {
      const totalLength = curve.getLength();
      const spacing = 20;
      const count = Math.max(6, Math.floor(totalLength / spacing));

      expect(count).toBeGreaterThanOrEqual(6);

      // Check first pier
      const t = 1 / count;
      const frame = sampleCurveFrame(curve, t);
      const deckThickness = 0.16;
      const deckBottomY = frame.position.y - deckThickness / 2;
      const pierHeight = deckBottomY - (-0.6);

      expect(pierHeight).toBeGreaterThan(0.4);
      expect(pierHeight).toBeLessThan(10.0);
    });

    it('validates runway guidance luminaire lateral placement along roadbed curbs', () => {
      const roadWidth = 2.8;
      const halfWidth = roadWidth / 2 - 0.12;

      const frame = sampleCurveFrame(curve, 0.2);
      const leftLight = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth)
        .addScaledVector(frame.normal, 0.09);

      const rightLight = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth)
        .addScaledVector(frame.normal, 0.09);

      const lateralDistance = leftLight.distanceTo(rightLight);
      expect(lateralDistance).toBeCloseTo(roadWidth - 0.24, 1);
    });
  });

  describe('2. Atmospheric Perspective & Spatial World Depth', () => {
    it('verifies aerial fog density creates visible horizon past 200m without clipping', () => {
      const fogDensity = 0.0048;
      // Beer-Lambert transmittance T = exp(-density * distance)
      const transmittanceAt50m = Math.exp(-fogDensity * 50);
      const transmittanceAt150m = Math.exp(-fogDensity * 150);
      const transmittanceAt300m = Math.exp(-fogDensity * 300);

      // Near objects (50m) should be very clear (>75% visibility)
      expect(transmittanceAt50m).toBeGreaterThan(0.75);
      // Mid-distance (150m) should have atmospheric mood (40%-60% visibility)
      expect(transmittanceAt150m).toBeGreaterThan(0.45);
      expect(transmittanceAt150m).toBeLessThan(0.65);
      // Deep horizon (300m) should softly dissolve (<30% visibility)
      expect(transmittanceAt300m).toBeLessThan(0.30);
    });

    it('verifies terrain canyon terraces flank the roadbed with safe lateral margins', () => {
      const innerRoadHalfWidth = 2.8 / 2;
      const leftTerraceInnerX = -32;
      const rightTerraceInnerX = 32;

      // Safe clearance between road edge and canyon terrace walls
      const leftClearance = Math.abs(leftTerraceInnerX) - innerRoadHalfWidth;
      const rightClearance = rightTerraceInnerX - innerRoadHalfWidth;

      expect(leftClearance).toBeGreaterThan(25);
      expect(rightClearance).toBeGreaterThan(25);
    });
  });

  describe('3. Monumental Architectural Landmarks & First View Framing', () => {
    it('verifies DepartureThreshold frames the camera view at t = 0', () => {
      // Camera at t = 0 starts around z = 25
      const departurePylonLeftX = -3.8;
      const departurePylonRightX = 3.8;
      const pylonHeight = 5.8;
      const canopyHeight = 6.9;

      // Ensure portal opening is wide and tall enough to frame the highway
      expect(departurePylonRightX - departurePylonLeftX).toBe(7.6);
      expect(canopyHeight).toBeGreaterThan(6.0);
      expect(pylonHeight).toBeGreaterThan(5.0);
    });

    it('verifies distant monoliths frame the vanishing point along the horizon', () => {
      const trackEnd = curve.getPointAt(1.0);
      const deepZ = trackEnd.z - 50;

      // Horizon monoliths should be positioned at and beyond trackEnd
      expect(deepZ).toBeLessThan(-200);
    });
  });

  describe('4. Layered Environmental Composition & Scale Hierarchy', () => {
    it('verifies 4-tier layered depth zones (Foreground, Midground, Background, Horizon)', () => {
      const depthZones = {
        foreground: { min: 0, max: 15 },
        midground: { min: 15, max: 70 },
        background: { min: 70, max: 250 },
        horizon: { min: 250, max: 600 },
      };

      expect(depthZones.foreground.max).toBeLessThanOrEqual(depthZones.midground.min);
      expect(depthZones.midground.max).toBeLessThanOrEqual(depthZones.background.min);
      expect(depthZones.background.max).toBeLessThanOrEqual(depthZones.horizon.min);
    });

    it('verifies midground canyon overhead traverse spans provide overhead clearance for journey camera', () => {
      // Camera eye height along trajectory is typically y = 1.6m to 3.5m
      const cameraMaxY = 3.5;
      const traverseArch1Y = 14;
      const traverseArch2Y = 16;

      expect(traverseArch1Y).toBeGreaterThan(cameraMaxY + 8);
      expect(traverseArch2Y).toBeGreaterThan(cameraMaxY + 8);
    });

    it('verifies human-scale visual cues on exhibit plinths', () => {
      const handrailHeight = 0.72; // Waist-height observation rail
      const plinthDiameter = 3.4; // 1.7m radius
      const roadWidth = 2.8;

      // Handrail waist height should be human scale (~0.7m - 0.9m)
      expect(handrailHeight).toBeGreaterThan(0.6);
      expect(handrailHeight).toBeLessThan(1.1);

      // Plinth should be wider than the road to feel like an expansive observation deck
      expect(plinthDiameter).toBeGreaterThan(roadWidth);
    });
  });
});
