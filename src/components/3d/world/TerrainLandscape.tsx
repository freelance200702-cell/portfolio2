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
      // Procedural height and lateral width variations creating monumental canyon walls
      const tier = (i % 3) + 1;
      const height = tier * 4.8 + Math.sin(i * 0.7) * 2.0 + 6.0;
      const width = 45 + (i % 4) * 8;
      const length = zStep * 1.18;
      items.push({ z, height, width, length, i });
    }
    return items;
  }, [trackZEnd, terraceCount]);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    // 1. Configure Left Terraces
    if (leftTerraceRef.current) {
      terraceData.forEach((t, idx) => {
        const lateralX = -32 - t.width * 0.5 - Math.sin(t.i * 0.5) * 4;
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
        const lateralX = 32 + t.width * 0.5 + Math.cos(t.i * 0.5) * 4;
        dummy.position.set(lateralX, (t.height * 0.95) * 0.5 - 0.6, t.z);
        dummy.scale.set(t.width, t.height * 0.95, t.length);
        dummy.updateMatrix();
        rightTerraceRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      rightTerraceRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [terraceData]);

  return (
    <group>
      {/* 1. Expansive Foundational Bedrock Floor (Atmospheric Ground Plane at y = -0.6) */}
      <mesh position={[0, -0.6, -200]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1000, 1200]} />
        <meshStandardMaterial
          color="#141d2c"
          roughness={0.82}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Under-Viaduct Engineered Cutting / Highway Bed (Visibly grounds the road structure) */}
      <mesh position={[0, -0.58, -180]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[36, 750]} />
        <meshStandardMaterial
          color="#1a2538"
          roughness={0.78}
          metalness={0.12}
        />
      </mesh>

      {/* 3. Left Flanking Architectural Stepped Terraces (Single Instanced Draw Call) */}
      <instancedMesh
        ref={leftTerraceRef}
        args={[undefined, undefined, terraceCount]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#1e2a3e"
          roughness={0.74}
          metalness={0.16}
        />
      </instancedMesh>

      {/* 4. Right Flanking Architectural Stepped Terraces (Single Instanced Draw Call) */}
      <instancedMesh
        ref={rightTerraceRef}
        args={[undefined, undefined, terraceCount]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#1b263a"
          roughness={0.74}
          metalness={0.16}
        />
      </instancedMesh>

      {/* 5. Subtle Base Horizon Seam Lines (Gentle tonal separation without neon glare) */}
      <mesh position={[-30, -0.56, -220]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 700]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </mesh>

      <mesh position={[30, -0.56, -220]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 700]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
