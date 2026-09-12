import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';

interface TerrainLandscapeProps {
  curve?: THREE.CatmullRomCurve3;
}

export const TerrainLandscape: React.FC<TerrainLandscapeProps> = ({ curve }) => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  // Compute total track extent from curve or fallback
  const trackZEnd = useMemo(() => {
    if (!curve) return -350;
    const endPoint = curve.getPointAt(1.0);
    return endPoint.z - 80;
  }, [curve]);

  // Stepped architectural canyon terraces flanking the highway corridor
  const terraceCount = qualityPreset === 'mobile' ? 18 : 34;
  const leftTerraceRef = useRef<THREE.InstancedMesh>(null);
  const rightTerraceRef = useRef<THREE.InstancedMesh>(null);

  const terraceData = useMemo(() => {
    const items = [];
    const zStart = 40;
    const zSpan = Math.abs(trackZEnd - zStart);
    const zStep = zSpan / terraceCount;

    for (let i = 0; i < terraceCount; i++) {
      const z = zStart - i * zStep;
      // Procedural height and lateral width variations
      const tier = (i % 3) + 1;
      const height = tier * 2.2 + Math.sin(i * 0.7) * 1.2;
      const width = 35 + (i % 4) * 8;
      const length = zStep * 1.15;
      items.push({ z, height, width, length, i });
    }
    return items;
  }, [trackZEnd, terraceCount]);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    // 1. Configure Left Terraces
    if (leftTerraceRef.current) {
      terraceData.forEach((t, idx) => {
        const lateralX = -32 - t.width * 0.5 - Math.sin(t.i * 0.5) * 6;
        dummy.position.set(lateralX, t.height * 0.5 - 0.6, t.z);
        dummy.scale.set(t.width, t.height, t.length);
        dummy.updateMatrix();
        leftTerraceRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      leftTerraceRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Configure Right Terraces
    if (rightTerraceRef.current) {
      terraceData.forEach((t, idx) => {
        const lateralX = 32 + t.width * 0.5 + Math.cos(t.i * 0.5) * 6;
        dummy.position.set(lateralX, (t.height * 0.9) * 0.5 - 0.6, t.z);
        dummy.scale.set(t.width, t.height * 0.9, t.length);
        dummy.updateMatrix();
        rightTerraceRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      rightTerraceRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [terraceData]);

  return (
    <group>
      {/* 1. Expansive Foundational Bedrock Floor (Ground Plane at y = -0.6) */}
      <mesh position={[0, -0.6, -240]} receiveShadow>
        <planeGeometry args={[500, 700]} />
        <meshStandardMaterial
          color="#06080e"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* 2. Subterranean Geometric Perspective Grid Lines */}
      <gridHelper
        args={[600, 60, '#1e293b', '#0f172a']}
        position={[0, -0.58, -240]}
      />

      {/* 3. Left Flanking Architectural Canyon Terraces (Single Instanced Draw Call) */}
      <instancedMesh
        ref={leftTerraceRef}
        args={[undefined, undefined, terraceCount]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0a0e17"
          roughness={0.65}
          metalness={0.85}
        />
      </instancedMesh>

      {/* 4. Right Flanking Architectural Canyon Terraces (Single Instanced Draw Call) */}
      <instancedMesh
        ref={rightTerraceRef}
        args={[undefined, undefined, terraceCount]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#0b101b"
          roughness={0.65}
          metalness={0.85}
        />
      </instancedMesh>

      {/* 5. Glowing Sub-Terrace Horizon Accents (Subtle hairline edge luminescence) */}
      <mesh position={[-28, -0.52, -220]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 650]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </mesh>

      <mesh position={[28, -0.52, -220]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 650]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
