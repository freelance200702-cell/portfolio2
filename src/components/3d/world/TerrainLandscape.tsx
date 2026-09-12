import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';
import { getCurveMetrics, sampleExtendedCurveFrame } from '@/lib/splineMath';

interface TerrainLandscapeProps {
  curve?: THREE.CatmullRomCurve3;
}

// Deterministic pseudo-random hash for varied, non-repeating geological strata
function hashFloat(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

export const TerrainLandscape: React.FC<TerrainLandscapeProps> = ({ curve }) => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  const bedrockRef = useRef<THREE.Mesh>(null);
  const leftTerraceRef = useRef<THREE.InstancedMesh>(null);
  const rightTerraceRef = useRef<THREE.InstancedMesh>(null);
  const outcroppingRef = useRef<THREE.InstancedMesh>(null);

  // Dynamic curve metrics (supports any project volume: 1, 5, 10, 25+)
  const metrics = useMemo(() => {
    if (!curve) {
      return {
        startPoint: new THREE.Vector3(0, 1.6, 25),
        endPoint: new THREE.Vector3(0, 2.8, -366),
        minZ: -366,
        maxZ: 25,
        totalLength: 420,
      };
    }
    return getCurveMetrics(curve);
  }, [curve]);

  // Extended journey bounds:
  // - Extends 120m behind the entrance threshold (t < 0)
  // - Extends 380m into the horizon beyond the terminal threshold (t > 1)
  const { extendedTStart, extendedTEnd, totalExtendedDistance } = useMemo(() => {
    const totalLength = Math.max(10, metrics.totalLength);
    const backwardBuffer = 120; // meters behind start
    const forwardBuffer = 380; // meters beyond terminal into horizon
    const extendedTStart = -backwardBuffer / totalLength;
    const extendedTEnd = 1.0 + forwardBuffer / totalLength;
    const totalExtendedDistance = totalLength + backwardBuffer + forwardBuffer;
    return { extendedTStart, extendedTEnd, totalExtendedDistance };
  }, [metrics]);

  // Density-governed terrace count scaled proportionally to journey length
  const terraceCount = useMemo(() => {
    const density = qualityPreset === 'mobile' ? 24 : 46;
    const count = Math.round((totalExtendedDistance / 500) * density);
    return Math.max(18, Math.min(count, 80));
  }, [totalExtendedDistance, qualityPreset]);

  // Density-governed roadside rock outcroppings count
  const outcroppingCount = useMemo(() => {
    const density = qualityPreset === 'mobile' ? 16 : 32;
    const count = Math.round((metrics.totalLength / 400) * density);
    return Math.max(12, Math.min(count, 50));
  }, [metrics.totalLength, qualityPreset]);

  // 1. Procedural curve-conforming canyon terraces
  const terraceData = useMemo(() => {
    if (!curve) return [];
    const items = [];

    for (let i = 0; i < terraceCount; i++) {
      const alpha = i / (terraceCount - 1);
      const t = extendedTStart + alpha * (extendedTEnd - extendedTStart);
      const frame = sampleExtendedCurveFrame(curve, t);

      // Multi-octave geological variation without obvious repetition
      const h1 = hashFloat(i * 3.17);
      const h2 = hashFloat(i * 7.43);
      const h3 = hashFloat(i * 13.29);

      // Tiered stepped cliffs (8m to 32m tall)
      const tier = (i % 4) + 1;
      const height = tier * 5.2 + h1 * 6.5 + 7.0;
      const width = 42 + h2 * 18;
      const length = (totalExtendedDistance / terraceCount) * 1.35;

      // Organic corridor breathing (widens slightly around plazas, tightens along straights)
      const corridorWidth = 29 + Math.sin(i * 0.42) * 5.0 + h3 * 3.0;

      // Tangent azimuth rotation to align terrace walls with curve trajectory
      const rotationY = Math.atan2(frame.tangent.x, frame.tangent.z);

      items.push({
        t,
        frame,
        height,
        width,
        length,
        corridorWidth,
        rotationY,
        h1,
        h2,
      });
    }

    return items;
  }, [curve, terraceCount, extendedTStart, extendedTEnd, totalExtendedDistance]);

  // 2. Procedural roadside rock outcroppings / stone plinths
  const outcroppingData = useMemo(() => {
    if (!curve) return [];
    const items = [];

    for (let i = 0; i < outcroppingCount; i++) {
      const alpha = i / (outcroppingCount - 1);
      // Span slightly past the start and terminal
      const t = -0.05 + alpha * 1.1;
      const frame = sampleExtendedCurveFrame(curve, t);

      const h = hashFloat(i * 19.81);
      const side = i % 2 === 0 ? 1 : -1;
      // Positioned in the midground shoulder between road edge (1.4m) and canyon wall (~29m)
      const offset = side * (12.0 + (i % 3) * 3.5 + h * 3.0);

      const width = 3.5 + (i % 3) * 1.8;
      const height = 1.2 + h * 2.6;
      const depth = 5.0 + ((i + 1) % 3) * 2.2;
      const rotY = Math.atan2(frame.tangent.x, frame.tangent.z) + (h - 0.5) * 0.6;

      const pos = frame.position
        .clone()
        .addScaledVector(frame.binormal, offset)
        .setY(-0.6 + height * 0.5);

      items.push({ pos, width, height, depth, rotY });
    }

    return items;
  }, [curve, outcroppingCount]);

  // Update InstancedMesh matrices
  useEffect(() => {
    const dummy = new THREE.Object3D();

    // Left Terraces
    if (leftTerraceRef.current && terraceData.length > 0) {
      terraceData.forEach((td, idx) => {
        const offset = -(td.corridorWidth + td.width * 0.5);
        const pos = td.frame.position
          .clone()
          .addScaledVector(td.frame.binormal, offset)
          .setY(-0.6 + td.height * 0.5);

        dummy.position.copy(pos);
        dummy.scale.set(td.width, td.height, td.length);
        dummy.rotation.set(0, td.rotationY, 0);
        dummy.updateMatrix();
        leftTerraceRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      leftTerraceRef.current.instanceMatrix.needsUpdate = true;
    }

    // Right Terraces
    if (rightTerraceRef.current && terraceData.length > 0) {
      terraceData.forEach((td, idx) => {
        const offset = td.corridorWidth + td.width * 0.5;
        const pos = td.frame.position
          .clone()
          .addScaledVector(td.frame.binormal, offset)
          .setY(-0.6 + (td.height * 0.94) * 0.5);

        dummy.position.copy(pos);
        dummy.scale.set(td.width, td.height * 0.94, td.length);
        dummy.rotation.set(0, td.rotationY, 0);
        dummy.updateMatrix();
        rightTerraceRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      rightTerraceRef.current.instanceMatrix.needsUpdate = true;
    }

    // Roadside Outcroppings
    if (outcroppingRef.current && outcroppingData.length > 0) {
      outcroppingData.forEach((od, idx) => {
        dummy.position.copy(od.pos);
        dummy.scale.set(od.width, od.height, od.depth);
        dummy.rotation.set(0, od.rotY, 0);
        dummy.updateMatrix();
        outcroppingRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      outcroppingRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [terraceData, outcroppingData]);

  // Camera-relative continuous bedrock floor
  // Keeps the bedrock floor centered on the traveler's Z position so the world
  // extends 1000m in every direction at all stages of the journey.
  useFrame(({ camera }) => {
    if (bedrockRef.current) {
      // Follow camera along Z and dampened X to ensure no horizon clipping
      bedrockRef.current.position.set(camera.position.x * 0.3, -0.6, camera.position.z);
    }
  });

  // Dynamic highway cutting bed dimensions based on curve bounds
  const cuttingBed = useMemo(() => {
    const centerZ = (metrics.minZ + metrics.maxZ) * 0.5;
    const lengthZ = Math.abs(metrics.maxZ - metrics.minZ) + 650;
    return { centerZ, lengthZ };
  }, [metrics]);

  return (
    <group>
      {/* 1. Camera-Tracking Foundational Bedrock Floor (Warm Geological Sandstone) */}
      <mesh
        ref={bedrockRef}
        position={[0, -0.6, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        {/* 2200m x 2200m plane provides infinite ground perception within 1000m camera frustum */}
        <planeGeometry args={[2200, 2200]} />
        <meshStandardMaterial
          color="#5a534a"
          roughness={0.88}
          metalness={0.04}
        />
      </mesh>

      {/* 2. Scalable Highway Cutting Bed (Spans the entire trajectory + buffers) */}
      <mesh
        position={[0, -0.58, cuttingBed.centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[44, cuttingBed.lengthZ]} />
        <meshStandardMaterial
          color="#6b645b"
          roughness={0.85}
          metalness={0.04}
        />
      </mesh>

      {/* 3. Curve-Conforming Left Architectural Stepped Canyon Terraces */}
      <instancedMesh
        ref={leftTerraceRef}
        args={[undefined, undefined, terraceCount]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#7c7468"
          roughness={0.82}
          metalness={0.04}
        />
      </instancedMesh>

      {/* 4. Curve-Conforming Right Architectural Stepped Canyon Terraces */}
      <instancedMesh
        ref={rightTerraceRef}
        args={[undefined, undefined, terraceCount]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#736c61"
          roughness={0.82}
          metalness={0.04}
        />
      </instancedMesh>

      {/* 5. Midground Roadside Geological Outcroppings & Stepped Stone Plinths */}
      <instancedMesh
        ref={outcroppingRef}
        args={[undefined, undefined, outcroppingCount]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#857c70"
          roughness={0.84}
          metalness={0.04}
        />
      </instancedMesh>

      {/* 6. Continuous Architectural Travertine Ground Seams */}
      <mesh
        position={[-26, -0.56, cuttingBed.centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.2, cuttingBed.lengthZ]} />
        <meshBasicMaterial color="#ded8ce" transparent opacity={0.35} />
      </mesh>
      <mesh
        position={[26, -0.56, cuttingBed.centerZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.2, cuttingBed.lengthZ]} />
        <meshBasicMaterial color="#ded8ce" transparent opacity={0.35} />
      </mesh>
    </group>
  );
};
