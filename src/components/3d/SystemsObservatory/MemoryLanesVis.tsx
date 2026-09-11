import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MemoryLanesVisProps {
  color?: string;
  isHovered?: boolean;
}

export const MemoryLanesVis: React.FC<MemoryLanesVisProps> = ({
  color = '#ec4899',
  isHovered = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const packetsRef = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (isHovered ? 0.6 : 0.25);
    }

    const t = clock.getElapsedTime() * (isHovered ? 2.5 : 1.4);
    // Animate 8 discrete cache-line memory packets streaming across the lanes
    packetsRef.current.forEach((mesh, idx) => {
      if (!mesh) return;
      const lane = idx % 4;
      const laneOffset = (lane - 1.5) * 0.45;
      const speed = 0.8 + lane * 0.15;
      const z = (((t * speed + idx * 0.5) % 2.4) - 1.2);
      mesh.position.set(laneOffset, 0, z);
    });
  });

  return (
    <group ref={groupRef}>
      {/* 1. 4 Parallel Low-Latency Memory Bus Tracks */}
      {[-1.5, -0.5, 0.5, 1.5].map((lane, i) => (
        <group key={i} position={[lane * 0.45, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.04, 0.02, 2.6]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          {/* Subtle lane track glow */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.02, 0.005, 2.6]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* 2. Streaming Cache-Line Data Packets */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            packetsRef.current[i] = el;
          }}
        >
          <boxGeometry args={[0.18, 0.08, 0.25]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={color}
            emissiveIntensity={isHovered ? 2.2 : 1.3}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* 3. Concurrency Memory Barrier / Ring Buffer Boundary */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.95, 0.015, 8, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};
