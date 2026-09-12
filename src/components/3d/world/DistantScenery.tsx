import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';

interface DistantSceneryProps {
  curve?: THREE.CatmullRomCurve3;
}

export const DistantScenery: React.FC<DistantSceneryProps> = ({ curve }) => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  const monolithCount = qualityPreset === 'mobile' ? 12 : 24;
  const monolithRef = useRef<THREE.InstancedMesh>(null);
  const beaconRef = useRef<THREE.InstancedMesh>(null);

  // Distribute monoliths along the outer canyon ridges, scaling depth to track terminus
  const monolithData = useMemo(() => {
    const endZ = curve ? curve.getPointAt(1.0).z - 50 : -350;
    const seedPoints = [
      // Left Ridge Monoliths
      { x: -55, z: 10, h: 32, w: 4.5, d: 5.5, rot: 0.15 },
      { x: -70, z: -45, h: 58, w: 6.0, d: 7.0, rot: -0.2 },
      { x: -60, z: -110, h: 48, w: 5.0, d: 6.0, rot: 0.3 },
      { x: -85, z: -175, h: 88, w: 8.5, d: 9.0, rot: -0.1 },
      { x: -65, z: -240, h: 64, w: 6.5, d: 7.5, rot: 0.25 },
      { x: -95, z: -310, h: 105, w: 10.0, d: 11.0, rot: -0.35 },

      // Right Ridge Monoliths
      { x: 50, z: 0, h: 28, w: 4.0, d: 5.0, rot: -0.1 },
      { x: 68, z: -55, h: 52, w: 5.5, d: 6.5, rot: 0.25 },
      { x: 62, z: -125, h: 44, w: 4.8, d: 5.8, rot: -0.2 },
      { x: 80, z: -190, h: 76, w: 7.5, d: 8.5, rot: 0.15 },
      { x: 72, z: -260, h: 68, w: 6.8, d: 7.8, rot: -0.25 },
      { x: 92, z: -330, h: 115, w: 11.0, d: 12.0, rot: 0.3 },

      // Deep Horizon Monoliths (Framing vanishing point)
      { x: -35, z: endZ - 30, h: 95, w: 9.0, d: 10.0, rot: 0.1 },
      { x: 35, z: endZ - 35, h: 98, w: 9.2, d: 10.2, rot: -0.1 },
      { x: -110, z: -210, h: 120, w: 12.0, d: 13.0, rot: 0.4 },
      { x: 110, z: -215, h: 125, w: 12.5, d: 13.5, rot: -0.4 },
      { x: -75, z: -140, h: 62, w: 6.0, d: 7.0, rot: 0.2 },
      { x: 78, z: -150, h: 66, w: 6.2, d: 7.2, rot: -0.2 },
      { x: -50, z: -75, h: 42, w: 4.5, d: 5.5, rot: 0.3 },
      { x: 52, z: -85, h: 45, w: 4.6, d: 5.6, rot: -0.25 },
      { x: -80, z: -280, h: 84, w: 8.0, d: 9.0, rot: 0.15 },
      { x: 82, z: -290, h: 86, w: 8.2, d: 9.2, rot: -0.15 },
      { x: -45, z: endZ + 10, h: 78, w: 7.5, d: 8.5, rot: 0.2 },
      { x: 48, z: endZ, h: 80, w: 7.8, d: 8.8, rot: -0.2 },
    ];

    return seedPoints.slice(0, monolithCount);
  }, [monolithCount, curve]);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (monolithRef.current) {
      monolithData.forEach((m, idx) => {
        dummy.position.set(m.x, m.h * 0.5 - 0.6, m.z);
        dummy.scale.set(m.w, m.h, m.d);
        dummy.rotation.set(0, m.rot, 0);
        dummy.updateMatrix();
        monolithRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      monolithRef.current.instanceMatrix.needsUpdate = true;
    }

    if (beaconRef.current) {
      monolithData.forEach((m, idx) => {
        // Vertical light shafts sitting atop the tallest monoliths
        dummy.position.set(m.x, m.h + 12 - 0.6, m.z);
        dummy.scale.set(0.15, 24, 0.15);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        beaconRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      beaconRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [monolithData]);

  return (
    <group>
      {/* 1. Monumental Brutalist Architectural Monoliths (Single Instanced Draw Call) */}
      <instancedMesh
        ref={monolithRef}
        args={[undefined, undefined, monolithData.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0c101c"
          roughness={0.4}
          metalness={0.88}
        />
      </instancedMesh>

      {/* 2. Atmospheric Vertical Light Beacons (Single Instanced Draw Call) */}
      <instancedMesh
        ref={beaconRef}
        args={[undefined, undefined, monolithData.length]}
      >
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
};
