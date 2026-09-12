import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';

export const AtmosphericLighting: React.FC = () => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

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

  useFrame(({ clock }) => {
    if (!containerRef.current) return;
    const time = clock.getElapsedTime();
    containerRef.current.position.y = Math.sin(time * 0.12) * 0.3;
    containerRef.current.position.x = Math.cos(time * 0.08) * 0.2;
  });

  return (
    <>
      {/* 1. Coordinated Cinematic Aerial Fog (Blends with AtmosphericSky horizon) */}
      <fogExp2 attach="fog" args={['#090d16', 0.0048]} />

      {/* 2. Balanced Ambient Atmosphere (cool slate fill so shadows retain architectural form) */}
      <ambientLight intensity={0.55} color="#0e1628" />

      {/* 3. Primary Key Directional Sun (low-angle grazing light casting dramatic highlights) */}
      <directionalLight
        position={[40, 36, 25]}
        intensity={2.5}
        color="#f8fafc"
        castShadow={qualityPreset === 'cinematic'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />

      {/* 4. Secondary Counter-Rim Light (deep atmospheric cyan edge fill) */}
      <directionalLight
        position={[-45, 16, -140]}
        intensity={0.8}
        color="#38bdf8"
      />

      {/* 5. Horizon Guiding Beacon at the expedition vanishing point */}
      <pointLight
        position={[0, 8, -340]}
        intensity={2.4}
        distance={320}
        decay={1.8}
        color="#93c5fd"
      />

      {/* 6. Microscopic Atmospheric Dust Motes (Single Instanced Draw Call) */}
      <group ref={containerRef}>
        <instancedMesh
          key={`dust-${particleCount}`}
          ref={meshRef}
          args={[undefined, undefined, particleCount]}
        >
          <tetrahedronGeometry args={[0.07, 0]} />
          <meshBasicMaterial
            color="#cbd5e1"
            transparent
            opacity={qualityPreset === 'mobile' ? 0.3 : 0.42}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      </group>
    </>
  );
};
