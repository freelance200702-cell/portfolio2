import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';

export const AtmosphericLighting: React.FC = () => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  // Dynamic Camera-Tracking Sun & Secondary Fill
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const sunTargetRef = useRef<THREE.Object3D>(null);
  const rimLightRef = useRef<THREE.DirectionalLight>(null);
  const rimTargetRef = useRef<THREE.Object3D>(null);
  const horizonLightRef = useRef<THREE.DirectionalLight>(null);
  const horizonTargetRef = useRef<THREE.Object3D>(null);
  const horizonBeaconRef = useRef<THREE.PointLight>(null);

  // Scaled particle counts
  const particleCount = useMemo(() => {
    if (qualityPreset === 'mobile') return 90;
    if (qualityPreset === 'balanced') return 220;
    return 420;
  }, [qualityPreset]);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const containerRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Camera-relative local dust motes field (spans 70m around the traveler)
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < particleCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * 64,
        y: Math.random() * 16 - 1.0,
        z: (Math.random() - 0.5) * 76,
        scale: Math.random() * 0.045 + 0.02,
      });
    }
    return data;
  }, [particleCount]);

  useEffect(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particles, dummy]);

  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime();

    // 1. Key Sun & Fill track the traveler throughout the entire journey
    if (sunRef.current && sunTargetRef.current) {
      sunRef.current.position.set(
        camera.position.x + 36,
        camera.position.y + 32,
        camera.position.z + 22
      );
      sunTargetRef.current.position.set(
        camera.position.x - 6,
        camera.position.y - 4,
        camera.position.z - 28
      );
      sunRef.current.target = sunTargetRef.current;
    }

    if (rimLightRef.current && rimTargetRef.current) {
      rimLightRef.current.position.set(
        camera.position.x - 38,
        camera.position.y + 20,
        camera.position.z - 45
      );
      rimTargetRef.current.position.set(
        camera.position.x,
        camera.position.y,
        camera.position.z - 15
      );
      rimLightRef.current.target = rimTargetRef.current;
    }

    // 2. Horizon grazing light tracks ahead of camera to maintain continuous photographic depth
    if (horizonLightRef.current && horizonTargetRef.current) {
      horizonLightRef.current.position.set(
        camera.position.x,
        camera.position.y + 5,
        camera.position.z - 140
      );
      horizonTargetRef.current.position.set(
        camera.position.x,
        camera.position.y - 2,
        camera.position.z - 260
      );
      horizonLightRef.current.target = horizonTargetRef.current;
    }

    // 3. Vanishing point warm beacon tracks ahead of camera
    if (horizonBeaconRef.current) {
      horizonBeaconRef.current.position.set(
        camera.position.x * 0.4,
        camera.position.y + 10,
        camera.position.z - 220
      );
    }

    // 4. Local dust motes envelope follows traveler smoothly
    if (containerRef.current) {
      containerRef.current.position.set(
        camera.position.x + Math.cos(time * 0.08) * 0.25,
        camera.position.y + Math.sin(time * 0.12) * 0.35,
        camera.position.z
      );
    }
  });

  return (
    <>
      {/* Target anchor nodes for camera-tracking directional lights */}
      <object3D ref={sunTargetRef} />
      <object3D ref={rimTargetRef} />
      <object3D ref={horizonTargetRef} />

      {/* 1. Coordinated Cinematic Aerial Fog (Blends distant geometry into pearlescent horizon) */}
      <fogExp2 attach="fog" args={['#8ca0b2', 0.0016]} />

      {/* 2. Rich Natural Hemisphere Light (Cool atmospheric skylight fill + warm sandstone terrestrial bounce) */}
      <hemisphereLight args={['#7a97b8', '#6b6154', 1.85]} />

      {/* 3. Primary Key Directional Sun (Traveling low-angle warm alabaster architectural sun) */}
      <directionalLight
        ref={sunRef}
        position={[35, 32, 20]}
        intensity={3.2}
        color="#fff6e5"
        castShadow={qualityPreset === 'cinematic'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />

      {/* 4. Secondary Counter-Rim Light (Subtle cool silver-slate architectural edge fill) */}
      <directionalLight
        ref={rimLightRef}
        position={[-38, 20, -45]}
        intensity={1.1}
        color="#b8c8d8"
      />

      {/* 5. Subtle Warm Horizon Grazing Light (Maintains forward warm photographic depth) */}
      <directionalLight
        ref={horizonLightRef}
        position={[0, 5, -140]}
        intensity={0.8}
        color="#fed7aa"
      />

      {/* 6. Horizon Guiding Warm Beacon (Always illuminates the road vanishing point) */}
      <pointLight
        ref={horizonBeaconRef}
        position={[0, 10, -220]}
        intensity={3.2}
        distance={350}
        decay={1.8}
        color="#fef3c7"
      />

      {/* 7. Microscopic Atmospheric Dust Motes (Continuously surrounds traveler) */}
      <group ref={containerRef}>
        <instancedMesh
          key={`dust-${particleCount}`}
          ref={meshRef}
          args={[undefined, undefined, particleCount]}
        >
          <tetrahedronGeometry args={[0.06, 0]} />
          <meshBasicMaterial
            color="#e2e8f0"
            transparent
            opacity={qualityPreset === 'mobile' ? 0.25 : 0.35}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      </group>
    </>
  );
};
