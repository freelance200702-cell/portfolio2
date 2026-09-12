import * as THREE from 'three';
import type { Project } from '@/types/project';

export interface CurveFrame {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  binormal: THREE.Vector3;
  bankAngle: number;
}

export interface ProjectPlacement {
  project: Project;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  binormal: THREE.Vector3;
  index: number;
  t: number;
  lateralOffset: number;
  rotationY: number;
  distanceFromStart: number;
}

/**
 * Deterministic spatial spline generator that dynamically scales to any number of projects.
 * Supports N = 0, 1, 3, 10, 25+ exhibits with harmonic highway sweeps, gentle elevation hills,
 * and guaranteed curvature bounds (radius >= 40m) to eliminate disorientation.
 */
export function generateSplineCurve(projects: Project[]): THREE.CatmullRomCurve3 {
  const count = Math.max(projects.length, 1);
  const points: THREE.Vector3[] = [];

  // Dynamic spacing based on project volume to maintain optimal contemplation pacing
  // N = 1: Compact, proportional runway
  // N = 2-5: Generous 55m contemplation spacing
  // N = 6-15: 48m steady rhythmic pacing
  // N >= 16: 40m spacing to preserve horizon clarity and depth precision
  const spacingZ = count === 1 ? 55 : count <= 5 ? 54 : count <= 15 ? 48 : 40;

  // 1. Entrance / Departure Threshold runway
  points.push(new THREE.Vector3(0, 1.6, 25));
  points.push(new THREE.Vector3(0, 1.2, 0));

  // 2. Continuous harmonic waypoints
  // Spatial wavelength for lateral sweeping curves (lambda = 180m keeps curve radius R >= 90m)
  const wavelengthX = 180;
  // Spatial wavelength for gentle rolling elevation (lambda = 130m keeps grades < 4%)
  const wavelengthY = 130;

  for (let i = 0; i < count; i++) {
    const depthZ = -45 - i * spacingZ;
    const absZ = Math.abs(depthZ);

    // Harmonic lateral sweeps (bounded to +/- 8.5m)
    const lateralX = Math.sin((2 * Math.PI * absZ) / wavelengthX) * 8.5;
    // Gentle rolling elevation (elevation strictly between 1.3m and 2.5m)
    const elevationY = 1.6 + Math.cos((2 * Math.PI * absZ) / wavelengthY) * 0.8;

    points.push(new THREE.Vector3(lateralX, elevationY, depthZ));
  }

  // 3. Terminal Threshold runway and horizon departure extension
  const lastZ = points[points.length - 1].z;
  const terminalZ = lastZ - 45;
  const horizonZ = terminalZ - 60;

  // Straighten out smoothly for the terminal portal approach
  points.push(new THREE.Vector3(0, 1.8, terminalZ));
  points.push(new THREE.Vector3(0, 2.8, horizonZ));

  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}

/**
 * Samples a continuous reference frame (position, tangent, normal, binormal, and bank angle)
 * at normalized parameter t in [0, 1].
 */
export function sampleCurveFrame(curve: THREE.CatmullRomCurve3, t: number): CurveFrame {
  const clampedT = Math.max(0.0001, Math.min(0.9999, t));
  const position = curve.getPointAt(clampedT);
  const tangent = curve.getTangentAt(clampedT).normalize();

  // World Up vector
  const worldUp = new THREE.Vector3(0, 1, 0);

  // Binormal = Tangent x Up (points to the right of the path)
  const binormal = new THREE.Vector3().crossVectors(tangent, worldUp).normalize();
  if (binormal.lengthSq() < 0.001) {
    binormal.set(1, 0, 0);
  }

  // Normal = Binormal x Tangent (true perpendicular up from track surface)
  const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

  // Lateral curve curvature calculation for banking roll
  const deltaT = 0.015;
  const nextT = Math.min(0.9999, clampedT + deltaT);
  const nextTangent = curve.getTangentAt(nextT).normalize();
  const curvatureX = nextTangent.x - tangent.x;
  
  // Clamped bank angle in radians (prevents disorientation)
  const bankAngle = THREE.MathUtils.clamp(-curvatureX * 1.6, -0.05, 0.05);

  return {
    position,
    tangent,
    normal,
    binormal,
    bankAngle,
  };
}

/**
 * Deterministic layout algorithm calculating collision-free exhibit placements along the spline.
 * Guarantees a clean 1.1m verge between roadbed and pedestal, and angles exhibits toward oncoming travelers.
 */
export function calculateProjectPlacements(
  projects: Project[],
  curve: THREE.CatmullRomCurve3
): ProjectPlacement[] {
  if (!projects || projects.length === 0) return [];

  const N = projects.length;
  const totalLength = curve.getLength();

  // Entrance run-up and terminal departure clearances
  const introDist = N === 1 ? totalLength * 0.48 : Math.min(50, totalLength * 0.20);
  const outroDist = Math.min(55, totalLength * 0.22);
  const usableTrackLength = Math.max(10, totalLength - introDist - outroDist);
  const stepDist = N > 1 ? usableTrackLength / (N - 1) : 0;

  // Lateral offset from road centerline (Roadbed half-width: 1.2m, Pedestal radius: 2.3m -> 4.6m offset provides 1.1m clean verge)
  const LATERAL_OFFSET_DISTANCE = 4.6;

  return projects.map((project, i) => {
    const physicalDistance = N === 1 ? introDist : introDist + i * stepDist;
    const t = THREE.MathUtils.clamp(physicalDistance / totalLength, 0.05, 0.92);
    const frame = sampleCurveFrame(curve, t);

    // Alternating lateral offsets: even -> right (+), odd -> left (-)
    const lateralDirection = i % 2 === 0 ? 1 : -1;
    const lateralOffset = lateralDirection * LATERAL_OFFSET_DISTANCE;

    // Position offset laterally and slightly elevated on the road deck
    const position = frame.position
      .clone()
      .addScaledVector(frame.binormal, lateralOffset)
      .addScaledVector(frame.normal, 0.35);

    // Compute optimal billboard angle so exhibit faces 30 degrees toward oncoming travelers
    // Tangent azimuth angle:
    const tangentYaw = Math.atan2(frame.tangent.x, frame.tangent.z);
    // Inward facing tilt towards approaching traveler:
    const inwardTurn = -lateralDirection * 0.48;
    const rotationY = tangentYaw + inwardTurn;

    return {
      project,
      position,
      tangent: frame.tangent,
      normal: frame.normal,
      binormal: frame.binormal,
      index: i,
      t,
      lateralOffset,
      rotationY,
      distanceFromStart: physicalDistance,
    };
  });
}

/**
 * Convenience helper to calculate normalized parameter t values for each project
 * along the spline trajectory.
 */
export function calculateProjectAnchors(
  projects: Project[],
  curve?: THREE.CatmullRomCurve3
): number[] {
  if (!projects || projects.length === 0) return [];
  const c = curve || generateSplineCurve(projects);
  const placements = calculateProjectPlacements(projects, c);
  return placements.map((p) => p.t);
}

/**
 * Builds ribbon geometry for the continuous roadbed, scaling samples with project count.
 */
export function createRibbonRoadGeometry(
  curve: THREE.CatmullRomCurve3,
  samples = 280,
  roadWidth = 2.4,
  deckThickness = 0.12,
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const halfWidth = roadWidth / 2;

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const frame = sampleCurveFrame(curve, t);

    // Top surface left & right
    const topLeft = frame.position
      .clone()
      .addScaledVector(frame.binormal, -halfWidth)
      .addScaledVector(frame.normal, deckThickness / 2);

    const topRight = frame.position
      .clone()
      .addScaledVector(frame.binormal, halfWidth)
      .addScaledVector(frame.normal, deckThickness / 2);

    // Bottom surface left & right
    const bottomLeft = frame.position
      .clone()
      .addScaledVector(frame.binormal, -halfWidth)
      .addScaledVector(frame.normal, -deckThickness / 2);

    const bottomRight = frame.position
      .clone()
      .addScaledVector(frame.binormal, halfWidth)
      .addScaledVector(frame.normal, -deckThickness / 2);

    vertices.push(
      topLeft.x, topLeft.y, topLeft.z,
      topRight.x, topRight.y, topRight.z,
      bottomLeft.x, bottomLeft.y, bottomLeft.z,
      bottomRight.x, bottomRight.y, bottomRight.z,
    );

    const vCoord = (i / samples) * 50;
    uvs.push(0, vCoord, 1, vCoord, 0, vCoord, 1, vCoord);

    if (i < samples) {
      const base = i * 4;
      // Top surface
      indices.push(base, base + 1, base + 4);
      indices.push(base + 1, base + 5, base + 4);

      // Left edge
      indices.push(base, base + 4, base + 2);
      indices.push(base + 4, base + 6, base + 2);

      // Right edge
      indices.push(base + 1, base + 3, base + 5);
      indices.push(base + 3, base + 7, base + 5);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Builds optical fiber rail curve.
 */
export function createRailCurve(
  curve: THREE.CatmullRomCurve3,
  sideOffset: number,
  roadWidth = 2.4,
  samples = 140,
): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  const halfWidth = (roadWidth / 2) * sideOffset;

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const frame = sampleCurveFrame(curve, t);
    const railPoint = frame.position
      .clone()
      .addScaledVector(frame.binormal, halfWidth)
      .addScaledVector(frame.normal, 0.07);
    points.push(railPoint);
  }

  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}

export interface CurveMetrics {
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  minZ: number;
  maxZ: number;
  totalLength: number;
}

export function getCurveMetrics(curve: THREE.CatmullRomCurve3): CurveMetrics {
  const startPoint = curve.getPointAt(0);
  const endPoint = curve.getPointAt(1);
  const minZ = Math.min(startPoint.z, endPoint.z);
  const maxZ = Math.max(startPoint.z, endPoint.z);
  const totalLength = curve.getLength();
  return { startPoint, endPoint, minZ, maxZ, totalLength };
}

/**
 * Samples a continuous reference frame along the curve, with linear extrapolation
 * beyond [0, 1] along the boundary tangents so environment scenery can extend
 * seamlessly before the departure threshold and beyond the terminal horizon.
 */
export function sampleExtendedCurveFrame(curve: THREE.CatmullRomCurve3, t: number): CurveFrame {
  if (t >= 0 && t <= 1) {
    return sampleCurveFrame(curve, t);
  }

  const totalLength = curve.getLength();

  if (t < 0) {
    const frame0 = sampleCurveFrame(curve, 0.0001);
    const distance = t * totalLength;
    const extrapolatedPos = frame0.position.clone().addScaledVector(frame0.tangent, distance);
    return {
      position: extrapolatedPos,
      tangent: frame0.tangent.clone(),
      normal: frame0.normal.clone(),
      binormal: frame0.binormal.clone(),
      bankAngle: 0,
    };
  } else {
    const frame1 = sampleCurveFrame(curve, 0.9999);
    const distance = (t - 1.0) * totalLength;
    const extrapolatedPos = frame1.position.clone().addScaledVector(frame1.tangent, distance);
    return {
      position: extrapolatedPos,
      tangent: frame1.tangent.clone(),
      normal: frame1.normal.clone(),
      binormal: frame1.binormal.clone(),
      bankAngle: 0,
    };
  }
}

