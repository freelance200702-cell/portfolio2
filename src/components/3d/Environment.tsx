import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';

export const Environment: React.FC = () => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  // Dynamically scale particle workloads: 80 on mobile, 250 on tablet/balanced, 600 on cinematic
  const particleCount = useMemo(() => {
    if (qualityPreset === 'mobile') return 80;
    if (qualityPreset === 'balanced') return 250;
    return 600;
  }, [qualityPreset]);

  // Scaled starfield count
  const starCount = useMemo(() => {
    if (qualityPreset === 'mobile') return 400;
    if (qualityPreset === 'balanced') return 1000;
    return 2400;
  }, [qualityPreset]);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const containerRef = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < particleCount; i++) {
      data.push({
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 24 + 2,
        z: Math.random() * -300 + 20,
        scale: Math.random() * 0.04 + 0.02,
      });
    }
    return data;
  }, [particleCount]);

  // Initialize instance matrices once into GPU memory (avoids 38,400-float re-uploads every frame)
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

  // Gentle low-cost GPU transform drift of the particle volume (0 CPU matrix multiplications)
  useFrame(({ clock }) => {
    if (!containerRef.current) return;
    const time = clock.getElapsedTime();
    containerRef.current.position.y = Math.sin(time * 0.15) * 0.4;
    containerRef.current.position.x = Math.cos(time * 0.1) * 0.25;
    containerRef.current.rotation.z = Math.sin(time * 0.05) * 0.015;
  });

  return (
    <>
      {/* Pure obsidian exponential fog */}
      <fogExp2 attach="fog" args={['#030305', 0.009]} />

      {/* 1. Subtle cold graphite ambient baseline */}
      <ambientLight intensity={0.3} color="#0b0d14" />

      {/* 2. Key directional sun (6500K sterile white) */}
      <directionalLight
        position={[20, 40, 15]}
        intensity={1.8}
        color="#f8fafc"
      />

      {/* 3. Subtle titanium rim fill light */}
      <directionalLight
        position={[-30, -5, -140]}
        intensity={0.65}
        color="#64748b"
      />

      {/* 4. Distant horizon beacon (cold optical white) */}
      <pointLight
        position={[0, 4, -280]}
        intensity={1.8}
        distance={200}
        color="#e2e8f0"
      />

      {/* Deep Space Starfield (dynamically scaled) */}
      <Stars
        key={starCount}
        radius={180}
        depth={60}
        count={starCount}
        factor={3.0}
        saturation={0.1}
        fade
        speed={0.4}
      />

      {/* Microscopic Silver Dust Motes (Low-Poly 4-Vertex Tetrahedron Billboard) */}
      <group ref={containerRef}>
        <instancedMesh
          key={particleCount}
          ref={meshRef}
          args={[undefined, undefined, particleCount]}
        >
          <tetrahedronGeometry args={[0.06, 0]} />
          <meshBasicMaterial
            color="#94a3b8"
            transparent
            opacity={qualityPreset === 'mobile' ? 0.35 : 0.45}
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      </group>
    </>
  );
};
