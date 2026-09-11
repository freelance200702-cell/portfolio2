import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { Project } from '@/types/project';
import { useUIStore } from '@/stores/useUIStore';
import {
  generateSplineCurve,
  createRibbonRoadGeometry,
  createRailCurve,
  sampleCurveFrame,
} from '@/lib/splineMath';

interface SplineRoadProps {
  projects: Project[];
}

export const SplineRoad: React.FC<SplineRoadProps> = ({ projects }) => {
  const curve = useMemo(() => generateSplineCurve(projects), [projects]);
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  // Adaptive geometry density scaled by device tier and qualityPreset
  const sampleCount = useMemo(() => {
    const totalLength = curve.getLength();
    const density = qualityPreset === 'mobile' ? 0.75 : qualityPreset === 'balanced' ? 1.1 : 1.5;
    const minSamples = qualityPreset === 'mobile' ? 120 : 240;
    const maxSamples = qualityPreset === 'mobile' ? 500 : 1200;
    return Math.max(minSamples, Math.min(maxSamples, Math.round(totalLength * density)));
  }, [curve, qualityPreset]);

  // 1. Extruded 3D Roadbed Deck (Brushed dark carbon / titanium)
  const deckGeometry = useMemo(() => {
    return createRibbonRoadGeometry(curve, sampleCount, 2.4, 0.12);
  }, [curve, sampleCount]);

  // 2. Razor-thin Optical Fiber Boundary Rails
  const leftRailCurve = useMemo(() => {
    return createRailCurve(curve, -1, 2.4, Math.round(sampleCount / 2));
  }, [curve, sampleCount]);

  const rightRailCurve = useMemo(() => {
    return createRailCurve(curve, 1, 2.4, Math.round(sampleCount / 2));
  }, [curve, sampleCount]);

  const leftRailGeometry = useMemo(() => {
    const radialSegments = qualityPreset === 'mobile' ? 4 : 6;
    return new THREE.TubeGeometry(leftRailCurve, Math.round(sampleCount / 2), 0.025, radialSegments, false);
  }, [leftRailCurve, sampleCount, qualityPreset]);

  const rightRailGeometry = useMemo(() => {
    const radialSegments = qualityPreset === 'mobile' ? 4 : 6;
    return new THREE.TubeGeometry(rightRailCurve, Math.round(sampleCount / 2), 0.025, radialSegments, false);
  }, [rightRailCurve, sampleCount, qualityPreset]);

  // 3. Precision Waypoint Arches along the path (proportional to physical track length)
  const portalRings = useMemo(() => {
    const totalLength = curve.getLength();
    const spacing = qualityPreset === 'mobile' ? 65 : 40;
    const maxRings = qualityPreset === 'mobile' ? 24 : 48;
    const ringCount = Math.max(4, Math.min(maxRings, Math.round(totalLength / spacing)));
    const items = [];
    for (let i = 1; i <= ringCount; i++) {
      const t = i / (ringCount + 1);
      const frame = sampleCurveFrame(curve, t);
      const matrix = new THREE.Matrix4();
      
      const rotMatrix = new THREE.Matrix4().makeBasis(
        frame.binormal,
        frame.normal,
        frame.tangent.clone().negate()
      );
      matrix.multiply(rotMatrix);
      matrix.setPosition(frame.position);

      items.push({ matrix, t });
    }
    return items;
  }, [curve, qualityPreset]);

  // 4. Centerline Laser-Engraved Cross Ties (scaled to reduce draw calls on mobile)
  const centerDashes = useMemo(() => {
    const totalLength = curve.getLength();
    const spacing = qualityPreset === 'mobile' ? 8.0 : 4.5;
    const maxCount = qualityPreset === 'mobile' ? 90 : 220;
    const count = Math.max(25, Math.min(maxCount, Math.round(totalLength / spacing)));
    const dashes = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const frame = sampleCurveFrame(curve, t);
      const pos = frame.position.clone().addScaledVector(frame.normal, 0.07);
      dashes.push({ pos, frame, id: i });
    }
    return dashes;
  }, [curve, qualityPreset]);

  // Clean up GPU buffer geometries on recreation or unmount
  useEffect(() => {
    return () => {
      deckGeometry.dispose();
      leftRailGeometry.dispose();
      rightRailGeometry.dispose();
    };
  }, [deckGeometry, leftRailGeometry, rightRailGeometry]);

  const dashInstancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const ringInstancedMeshRef = useRef<THREE.InstancedMesh>(null);

  // Update instanced matrix buffer for centerline cross ties (single draw call)
  useEffect(() => {
    if (dashInstancedMeshRef.current && centerDashes.length > 0) {
      const dummy = new THREE.Object3D();
      const up = new THREE.Vector3(0, 1, 0);
      centerDashes.forEach((dash, i) => {
        dummy.position.copy(dash.pos);
        dummy.quaternion.setFromUnitVectors(up, dash.frame.normal);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        dashInstancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dashInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [centerDashes]);

  // Update instanced matrix buffer for spatial portal rings (single draw call)
  useEffect(() => {
    if (ringInstancedMeshRef.current && portalRings.length > 0) {
      const m = new THREE.Matrix4();
      const s = new THREE.Vector3();
      portalRings.forEach((ring, i) => {
        const isMajor = i % 3 === 0;
        const scale = isMajor ? 1.15 : 0.9;
        s.set(scale, scale, scale);
        m.copy(ring.matrix).scale(s);
        ringInstancedMeshRef.current!.setMatrixAt(i, m);
      });
      ringInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [portalRings]);

  return (
    <group>
      {/* Primary Roadbed Deck */}
      <mesh geometry={deckGeometry}>
        <meshStandardMaterial
          color="#08080d"
          roughness={0.25}
          metalness={0.92}
        />
      </mesh>

      {/* Left Optical Fiber Rail (Cold Laboratory White) */}
      <mesh geometry={leftRailGeometry}>
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#f8fafc"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Right Optical Fiber Rail (Refined Silver) */}
      <mesh geometry={rightRailGeometry}>
        <meshStandardMaterial
          color="#cbd5e1"
          emissive="#cbd5e1"
          emissiveIntensity={1.0}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Centerline Precision Dashes (Consolidated to 1 Draw Call via InstancedMesh) */}
      {centerDashes.length > 0 && (
        <instancedMesh
          key={`dashes-${centerDashes.length}`}
          ref={dashInstancedMeshRef}
          args={[undefined, undefined, centerDashes.length]}
        >
          <boxGeometry args={[0.06, 0.015, 0.5]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.65} />
        </instancedMesh>
      )}

      {/* Minimalist Depth-Framing Spatial Rings (Consolidated to 1 Draw Call via InstancedMesh) */}
      {portalRings.length > 0 && (
        <instancedMesh
          key={`rings-${portalRings.length}`}
          ref={ringInstancedMeshRef}
          args={[undefined, undefined, portalRings.length]}
        >
          <torusGeometry args={[3.5, 0.02, 6, 24]} />
          <meshBasicMaterial
            color="#475569"
            transparent
            opacity={0.3}
          />
        </instancedMesh>
      )}
    </group>
  );
};
