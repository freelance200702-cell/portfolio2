import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';

interface ParticleSwarmVisProps {
  color?: string;
  isHovered?: boolean;
}

export const ParticleSwarmVis: React.FC<ParticleSwarmVisProps> = ({
  color = '#f59e0b',
  isHovered = false,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const qualityPreset = useUIStore((s) => s.qualityPreset);
  const count = qualityPreset === 'mobile' ? 60 : qualityPreset === 'balanced' ? 100 : 160;

  // Initialize particle orbital phases and radii
  const { initialPositions, speeds, radii, phases, yOffsets } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const rad = new Float32Array(count);
    const phs = new Float32Array(count);
    const yOff = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      rad[i] = 0.4 + Math.random() * 1.1;
      spd[i] = (0.8 + Math.random() * 1.4) * (Math.random() > 0.5 ? 1 : -1);
      phs[i] = Math.random() * Math.PI * 2;
      yOff[i] = (Math.random() - 0.5) * 1.6;

      pos[i * 3] = rad[i] * Math.cos(phs[i]);
      pos[i * 3 + 1] = yOff[i];
      pos[i * 3 + 2] = rad[i] * Math.sin(phs[i]);
    }

    return { initialPositions: pos, speeds: spd, radii: rad, phases: phs, yOffsets: yOff };
  }, [count]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(initialPositions), 3));
    return geom;
  }, [initialPositions]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime() * (isHovered ? 1.8 : 1.0);
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const angle = phases[i] + time * speeds[i];
      const r = radii[i] + Math.sin(time * 2 + phases[i]) * 0.15;
      array[i * 3] = r * Math.cos(angle);
      array[i * 3 + 1] = yOffsets[i] + Math.sin(angle * 2) * 0.25;
      array[i * 3 + 2] = r * Math.sin(angle);
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y += 0.003;
  });

  return (
    <group>
      {/* 1. Core Gravitational Singularity Node */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={isHovered ? 2.5 : 1.4}
        />
      </mesh>

      {/* 2. Swarm Attractor Particles */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={isHovered ? 0.07 : 0.05}
          color={color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
