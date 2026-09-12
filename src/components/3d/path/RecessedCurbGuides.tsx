import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';
import { sampleCurveFrame } from '@/lib/splineMath';

interface RecessedCurbGuidesProps {
  curve: THREE.CatmullRomCurve3;
  roadWidth: number;
  deckThickness: number;
}

/**
 * Recessed Curb Guides (Subtle Edge Treatment):
 * Rather than a generic neon road or floating laser, this component provides
 * low-energy, down-facing recessed pathway fixtures embedded into the curb reveal.
 * They cast soft, low-intensity warm-white guidance onto the asphalt pavement,
 * establishing believable scale and night-time roadway illumination without
 * distracting from exhibits.
 */
export const RecessedCurbGuides: React.FC<RecessedCurbGuidesProps> = ({
  curve,
  roadWidth,
  deckThickness,
}) => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  const halfWidth = roadWidth / 2;

  // Placement of flush downward step luminaires
  const fixtureData = useMemo(() => {
    const totalLength = curve.getLength();
    // Spacing between pathway fixtures: 14m on desktop, 24m on mobile
    const spacing = qualityPreset === 'mobile' ? 24 : 14;
    const count = Math.max(10, Math.floor(totalLength / spacing));
    const items: { pos: THREE.Vector3; quat: THREE.Quaternion }[] = [];

    for (let i = 0; i < count; i++) {
      const t = (i + 0.15) / count;
      const frame = sampleCurveFrame(curve, t);

      const rotMatrix = new THREE.Matrix4().makeBasis(
        frame.binormal,
        frame.normal,
        frame.tangent.clone().negate()
      );
      const quat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

      // Left curb luminaire: placed in the inside curb bevel
      const leftPos = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth + 0.12)
        .addScaledVector(frame.normal, deckThickness / 2 + 0.04);
      items.push({ pos: leftPos, quat });

      // Right curb luminaire
      const rightPos = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth - 0.12)
        .addScaledVector(frame.normal, deckThickness / 2 + 0.04);
      items.push({ pos: rightPos, quat });
    }
    return items;
  }, [curve, qualityPreset, halfWidth, deckThickness]);

  const fixtureRef = useRef<THREE.InstancedMesh>(null);
  const lensRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (fixtureRef.current && fixtureData.length > 0) {
      const dummy = new THREE.Object3D();
      fixtureData.forEach((item, i) => {
        dummy.position.copy(item.pos);
        dummy.quaternion.copy(item.quat);
        dummy.scale.set(0.04, 0.02, 0.18); // Compact 4cm x 18cm luminaire housing
        dummy.updateMatrix();
        fixtureRef.current!.setMatrixAt(i, dummy.matrix);
      });
      fixtureRef.current.instanceMatrix.needsUpdate = true;
    }

    if (lensRef.current && fixtureData.length > 0) {
      const dummy = new THREE.Object3D();
      fixtureData.forEach((item, i) => {
        dummy.position.copy(item.pos);
        dummy.quaternion.copy(item.quat);
        dummy.scale.set(0.02, 0.015, 0.14);
        dummy.updateMatrix();
        lensRef.current!.setMatrixAt(i, dummy.matrix);
      });
      lensRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [fixtureData]);

  return (
    <group>
      {/* 1. Fixture Dark Cast Aluminum Housing */}
      {fixtureData.length > 0 && (
        <instancedMesh
          ref={fixtureRef}
          args={[undefined, undefined, fixtureData.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.5}
            metalness={0.8}
          />
        </instancedMesh>
      )}

      {/* 2. Frosted Linear Lens (Controlled, non-distracting subtle illumination) */}
      {fixtureData.length > 0 && (
        <instancedMesh
          ref={lensRef}
          args={[undefined, undefined, fixtureData.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#f1f5f9"
            emissive="#cbd5e1"
            emissiveIntensity={0.25}
            roughness={0.4}
          />
        </instancedMesh>
      )}
    </group>
  );
};
