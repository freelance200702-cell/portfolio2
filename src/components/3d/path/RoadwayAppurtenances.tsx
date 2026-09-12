import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';
import { sampleCurveFrame } from '@/lib/splineMath';

interface RoadwayAppurtenancesProps {
  curve: THREE.CatmullRomCurve3;
  roadWidth: number;
  deckThickness: number;
}

/**
 * Roadway Appurtenances:
 * - Low-profile safety guardrail stanchions & steel box beams along edges (human scale)
 * - Matte road surface lane markings (dashed center lines, solid shoulder lines)
 * - Recessed flush pavement road studs / cat's eyes (subtle directional retroreflectors)
 * - Heavy concrete viaduct support piers anchoring down to the bedrock floor
 */
export const RoadwayAppurtenances: React.FC<RoadwayAppurtenancesProps> = ({
  curve,
  roadWidth,
  deckThickness,
}) => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  const halfWidth = roadWidth / 2;

  // 1. Viaduct Support Piers (Anchored into planetary bedrock at y = -0.6)
  const pierData = useMemo(() => {
    const totalLength = curve.getLength();
    const spacing = qualityPreset === 'mobile' ? 30 : 20;
    const count = Math.max(6, Math.floor(totalLength / spacing));
    const piers: { matrix: THREE.Matrix4 }[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 1; i < count; i++) {
      const t = i / count;
      const frame = sampleCurveFrame(curve, t);
      const deckBottomY = frame.position.y - deckThickness / 2 - 0.35; // Account for keel depth
      const pierBottomY = -1.2; // Anchors deep into planetary bedrock below y = -0.6
      const pierHeight = Math.max(0.8, deckBottomY - pierBottomY);
      const pierCenterY = pierBottomY + pierHeight / 2;

      dummy.position.set(frame.position.x, pierCenterY, frame.position.z);
      dummy.scale.set(1.6, pierHeight, 1.4);
      dummy.rotation.set(0, Math.atan2(frame.tangent.x, frame.tangent.z), 0);
      dummy.updateMatrix();

      piers.push({ matrix: dummy.matrix.clone() });
    }
    return piers;
  }, [curve, qualityPreset, deckThickness]);

  // 2. Centerline Road Markings (Matte road paint dashes, non-emissive)
  const centerDashes = useMemo(() => {
    const totalLength = curve.getLength();
    const spacing = qualityPreset === 'mobile' ? 6.0 : 3.5;
    const count = Math.max(20, Math.floor(totalLength / spacing));
    const dashes: { pos: THREE.Vector3; quat: THREE.Quaternion }[] = [];

    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const frame = sampleCurveFrame(curve, t);
      const pos = frame.position
        .clone()
        .addScaledVector(frame.normal, deckThickness / 2 + 0.005); // Barely above asphalt to prevent z-fighting

      // Align rotation to road surface and tangent
      const rotMatrix = new THREE.Matrix4().makeBasis(
        frame.binormal,
        frame.normal,
        frame.tangent.clone().negate()
      );
      const quat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

      dashes.push({ pos, quat });
    }
    return dashes;
  }, [curve, qualityPreset, deckThickness]);

  // 4. Low-Profile Shoulder Edge Markers / Retroreflectors (Flush road studs)
  const roadStuds = useMemo(() => {
    const totalLength = curve.getLength();
    const spacing = qualityPreset === 'mobile' ? 10.0 : 5.0;
    const count = Math.max(12, Math.floor(totalLength / spacing));
    const studs: { pos: THREE.Vector3; quat: THREE.Quaternion; isLeft: boolean }[] = [];

    for (let i = 0; i < count; i++) {
      const t = (i + 0.2) / count;
      const frame = sampleCurveFrame(curve, t);
      const rotMatrix = new THREE.Matrix4().makeBasis(
        frame.binormal,
        frame.normal,
        frame.tangent.clone().negate()
      );
      const quat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

      const leftPos = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth + 0.24)
        .addScaledVector(frame.normal, deckThickness / 2 + 0.015);

      const rightPos = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth - 0.24)
        .addScaledVector(frame.normal, deckThickness / 2 + 0.015);

      studs.push({ pos: leftPos, quat, isLeft: true });
      studs.push({ pos: rightPos, quat, isLeft: false });
    }
    return studs;
  }, [curve, qualityPreset, halfWidth, deckThickness]);

  // Instanced mesh references
  const pierRef = useRef<THREE.InstancedMesh>(null);
  const dashRef = useRef<THREE.InstancedMesh>(null);
  const studRef = useRef<THREE.InstancedMesh>(null);

  // Update instanced matrix buffers
  useEffect(() => {
    if (pierRef.current && pierData.length > 0) {
      pierData.forEach((pier, i) => {
        pierRef.current!.setMatrixAt(i, pier.matrix);
      });
      pierRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [pierData]);

  useEffect(() => {
    if (dashRef.current && centerDashes.length > 0) {
      const dummy = new THREE.Object3D();
      centerDashes.forEach((item, i) => {
        dummy.position.copy(item.pos);
        dummy.quaternion.copy(item.quat);
        dummy.scale.set(0.12, 0.002, 1.4); // 12cm wide, 1.4m long road stripe
        dummy.updateMatrix();
        dashRef.current!.setMatrixAt(i, dummy.matrix);
      });
      dashRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [centerDashes]);

  useEffect(() => {
    if (studRef.current && roadStuds.length > 0) {
      const dummy = new THREE.Object3D();
      roadStuds.forEach((item, i) => {
        dummy.position.copy(item.pos);
        dummy.quaternion.copy(item.quat);
        dummy.scale.set(0.08, 0.02, 0.12);
        dummy.updateMatrix();
        studRef.current!.setMatrixAt(i, dummy.matrix);
      });
      studRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [roadStuds]);

  return (
    <group>
      {/* 1. Heavy Reinforced Concrete Viaduct Piers (Instanced: 1 Draw Call) */}
      {pierData.length > 0 && (
        <instancedMesh
          ref={pierRef}
          args={[undefined, undefined, pierData.length]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#1c2738"
            roughness={0.75}
            metalness={0.18}
          />
        </instancedMesh>
      )}

      {/* 2. Matte Roadway Centerline Dashes (Non-emissive physical traffic paint) */}
      {centerDashes.length > 0 && (
        <instancedMesh
          ref={dashRef}
          args={[undefined, undefined, centerDashes.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#94a3b8"
            roughness={0.8}
            metalness={0.1}
          />
        </instancedMesh>
      )}

      {/* 4. Shoulder Road Studs / Cat's Eyes (Subtle reflective pavement markers) */}
      {roadStuds.length > 0 && (
        <instancedMesh
          ref={studRef}
          args={[undefined, undefined, roadStuds.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#cbd5e1"
            roughness={0.2}
            metalness={0.9}
          />
        </instancedMesh>
      )}
    </group>
  );
};
