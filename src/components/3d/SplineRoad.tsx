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

  const ROAD_WIDTH = 2.8;
  const DECK_THICKNESS = 0.16;

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
    return createRibbonRoadGeometry(curve, sampleCount, ROAD_WIDTH, DECK_THICKNESS);
  }, [curve, sampleCount]);

  // 2. Razor-thin Optical Fiber Boundary Rails
  const leftRailCurve = useMemo(() => {
    return createRailCurve(curve, -1, ROAD_WIDTH, Math.round(sampleCount / 2));
  }, [curve, sampleCount]);

  const rightRailCurve = useMemo(() => {
    return createRailCurve(curve, 1, ROAD_WIDTH, Math.round(sampleCount / 2));
  }, [curve, sampleCount]);

  const leftRailGeometry = useMemo(() => {
    const radialSegments = qualityPreset === 'mobile' ? 4 : 6;
    return new THREE.TubeGeometry(leftRailCurve, Math.round(sampleCount / 2), 0.028, radialSegments, false);
  }, [leftRailCurve, sampleCount, qualityPreset]);

  const rightRailGeometry = useMemo(() => {
    const radialSegments = qualityPreset === 'mobile' ? 4 : 6;
    return new THREE.TubeGeometry(rightRailCurve, Math.round(sampleCount / 2), 0.028, radialSegments, false);
  }, [rightRailCurve, sampleCount, qualityPreset]);

  // 3. Structural Viaduct Piers (Anchoring the roadbed to the planetary floor at y = -0.6)
  const pierData = useMemo(() => {
    const totalLength = curve.getLength();
    const spacing = qualityPreset === 'mobile' ? 28 : 20;
    const count = Math.max(6, Math.floor(totalLength / spacing));
    const piers = [];
    const dummy = new THREE.Object3D();

    for (let i = 1; i < count; i++) {
      const t = i / count;
      const frame = sampleCurveFrame(curve, t);
      // Floor is at y = -0.6; deck bottom is at frame.position.y - DECK_THICKNESS/2
      const deckBottomY = frame.position.y - DECK_THICKNESS / 2;
      const pierHeight = Math.max(0.4, deckBottomY - (-0.6));
      const pierCenterY = -0.6 + pierHeight / 2;

      dummy.position.set(frame.position.x, pierCenterY, frame.position.z);
      dummy.scale.set(1.4, pierHeight, 1.2);
      dummy.rotation.set(0, Math.atan2(frame.tangent.x, frame.tangent.z), 0);
      dummy.updateMatrix();

      piers.push({ matrix: dummy.matrix.clone() });
    }
    return piers;
  }, [curve, qualityPreset]);

  // 4. Precision Waypoint Arches along the path (proportional to physical track length)
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

  // 5. Centerline Laser-Engraved Cross Ties
  const centerDashes = useMemo(() => {
    const totalLength = curve.getLength();
    const spacing = qualityPreset === 'mobile' ? 8.0 : 4.5;
    const maxCount = qualityPreset === 'mobile' ? 90 : 220;
    const count = Math.max(25, Math.min(maxCount, Math.round(totalLength / spacing)));
    const dashes = [];
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const frame = sampleCurveFrame(curve, t);
      const pos = frame.position.clone().addScaledVector(frame.normal, 0.08);
      dashes.push({ pos, frame, id: i });
    }
    return dashes;
  }, [curve, qualityPreset]);

  // 6. Runway Edge Guidance Lights (Single instanced draw call)
  const runwayLights = useMemo(() => {
    const totalLength = curve.getLength();
    const spacing = qualityPreset === 'mobile' ? 12 : 7;
    const count = Math.max(16, Math.floor(totalLength / spacing));
    const items = [];
    const halfWidth = ROAD_WIDTH / 2 - 0.12;

    for (let i = 0; i < count; i++) {
      const t = (i + 0.2) / count;
      const frame = sampleCurveFrame(curve, t);
      const leftPos = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth)
        .addScaledVector(frame.normal, 0.09);
      const rightPos = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth)
        .addScaledVector(frame.normal, 0.09);

      items.push({ pos: leftPos, frame });
      items.push({ pos: rightPos, frame });
    }
    return items;
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
  const pierInstancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const runwayInstancedMeshRef = useRef<THREE.InstancedMesh>(null);

  // Update instanced matrix buffer for viaduct support piers
  useEffect(() => {
    if (pierInstancedMeshRef.current && pierData.length > 0) {
      pierData.forEach((pier, i) => {
        pierInstancedMeshRef.current!.setMatrixAt(i, pier.matrix);
      });
      pierInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [pierData]);

  // Update instanced matrix buffer for centerline cross ties
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

  // Update instanced matrix buffer for spatial portal rings
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

  // Update instanced matrix buffer for runway edge lights
  useEffect(() => {
    if (runwayInstancedMeshRef.current && runwayLights.length > 0) {
      const dummy = new THREE.Object3D();
      runwayLights.forEach((light, i) => {
        dummy.position.copy(light.pos);
        dummy.scale.set(0.06, 0.03, 0.16);
        dummy.updateMatrix();
        runwayInstancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      runwayInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [runwayLights]);

  return (
    <group>
      {/* 1. Primary Roadbed Deck (High-end brushed dark carbon/titanium) */}
      <mesh geometry={deckGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#0a0c14"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Left Optical Fiber Rail (Cold Luminescent White) */}
      <mesh geometry={leftRailGeometry}>
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#f8fafc"
          emissiveIntensity={1.4}
          roughness={0.1}
          metalness={0.92}
        />
      </mesh>

      {/* 3. Right Optical Fiber Rail (Luminescent Refined Cyan/Silver) */}
      <mesh geometry={rightRailGeometry}>
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.92}
        />
      </mesh>

      {/* 4. Structural Viaduct Support Piers (Instanced: 1 Draw Call) */}
      {pierData.length > 0 && (
        <instancedMesh
          ref={pierInstancedMeshRef}
          args={[undefined, undefined, pierData.length]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#080a11"
            roughness={0.5}
            metalness={0.8}
          />
        </instancedMesh>
      )}

      {/* 5. Centerline Laser-Engraved Cross Ties (Instanced: 1 Draw Call) */}
      {centerDashes.length > 0 && (
        <instancedMesh
          key={`dashes-${centerDashes.length}`}
          ref={dashInstancedMeshRef}
          args={[undefined, undefined, centerDashes.length]}
        >
          <boxGeometry args={[0.08, 0.015, 0.55]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.7} />
        </instancedMesh>
      )}

      {/* 6. Runway Edge Guidance Luminaires (Instanced: 1 Draw Call) */}
      {runwayLights.length > 0 && (
        <instancedMesh
          ref={runwayInstancedMeshRef}
          args={[undefined, undefined, runwayLights.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#f8fafc" />
        </instancedMesh>
      )}

      {/* 7. Minimalist Depth-Framing Spatial Rings (Instanced: 1 Draw Call) */}
      {portalRings.length > 0 && (
        <instancedMesh
          key={`rings-${portalRings.length}`}
          ref={ringInstancedMeshRef}
          args={[undefined, undefined, portalRings.length]}
        >
          <torusGeometry args={[3.8, 0.025, 6, 24]} />
          <meshBasicMaterial
            color="#475569"
            transparent
            opacity={0.35}
          />
        </instancedMesh>
      )}
    </group>
  );
};
