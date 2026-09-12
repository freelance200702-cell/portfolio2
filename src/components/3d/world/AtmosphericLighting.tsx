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

  // Scaled particle counts
  const particleCount = useMemo(() => {
    if (qualityPreset === 'mobile') return 90;
    if (qualityPreset === 'balanced') return 220;
    return 450;
  }, [qualityPreset]);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const containerRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < particleCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * 80,
        y: Math.random() * 20 - 1,
        z: Math.random() * -350 + 30,
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
    // 1. Keep Key Sun & Fill Tracking the Traveler along the 300m Spline Journey
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

    // 2. Microscopic atmospheric dust drift
    if (!containerRef.current) return;
    const time = clock.getElapsedTime();
    containerRef.current.position.y = Math.sin(time * 0.12) * 0.3;
    containerRef.current.position.x = Math.cos(time * 0.08) * 0.2;
  });

  return (
    <>
      {/* Target anchor nodes for camera-tracking directional lights */}
      <object3D ref={sunTargetRef} />
      <object3D ref={rimTargetRef} />

      {/* 1. Coordinated Cinematic Aerial Fog (Atmospheric depth blending with horizon glow) */}
      <fogExp2 attach="fog" args={['#0e1628', 0.0022]} />

      {/* 2. Rich Natural Hemisphere Light (Twilight celestial sky fill + warm terrestrial slate bounce) */}
      <hemisphereLight
        args={['#2a3c58', '#111826', 1.35]}
      />

      {/* 3. Primary Key Directional Sun (Traveling low-angle warm alabaster grazing light) */}
      <directionalLight
        ref={sunRef}
        position={[35, 32, 20]}
        intensity={2.8}
        color="#fffbeb"
        castShadow={qualityPreset === 'cinematic'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />

      {/* 4. Secondary Counter-Rim Light (Traveling deep atmospheric twilight edge fill) */}
      <directionalLight
        ref={rimLightRef}
        position={[-38, 20, -45]}
        intensity={0.8}
        color="#38bdf8"
      />

      {/* 5. Subtle Warm Horizon Grazing Light (adds photographic depth to distant silhouettes) */}
      <directionalLight
        position={[0, 4, -200]}
        intensity={0.4}
        color="#fed7aa"
      />

      {/* 6. Horizon Guiding Glow at the distant vanishing point */}
      <pointLight
        position={[0, 10, -320]}
        intensity={2.0}
        distance={300}
        decay={1.8}
        color="#e0e7ff"
      />

      {/* 7. Microscopic Atmospheric Dust Motes (Single Instanced Draw Call) */}
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
