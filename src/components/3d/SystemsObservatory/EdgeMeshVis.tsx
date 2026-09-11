import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EdgeMeshVisProps {
  color?: string;
  isHovered?: boolean;
}

export const EdgeMeshVis: React.FC<EdgeMeshVisProps> = ({
  color = '#a855f7',
  isHovered = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const packetRef = useRef<THREE.Mesh>(null);

  // 6 Geodesic Distributed Edge Nodes
  const nodePositions = useMemo(() => {
    return [
      new THREE.Vector3(0, 1.1, 0),
      new THREE.Vector3(-0.95, 0.35, 0.6),
      new THREE.Vector3(0.95, 0.35, 0.6),
      new THREE.Vector3(-0.95, 0.35, -0.6),
      new THREE.Vector3(0.95, 0.35, -0.6),
      new THREE.Vector3(0, -0.9, 0),
    ];
  }, []);

  // Edge Mesh connections
  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const pairs = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [2, 4], [4, 3], [3, 1],
      [5, 1], [5, 2], [5, 3], [5, 4],
    ];
    pairs.forEach(([a, b]) => {
      const p1 = nodePositions[a];
      const p2 = nodePositions[b];
      positions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    });
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, [nodePositions]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const speed = isHovered ? 1.1 : 0.45;
    groupRef.current.rotation.y += delta * speed;
    groupRef.current.rotation.z += delta * speed * 0.25;

    // Animate a travelling packet through the mesh
    if (packetRef.current) {
      const t = (clock.getElapsedTime() * (isHovered ? 3.0 : 1.5)) % 4;
      const step = Math.floor(t);
      const frac = t - step;
      const path = [0, 1, 5, 2, 0];
      const from = nodePositions[path[step % path.length]];
      const to = nodePositions[path[(step + 1) % path.length]];
      packetRef.current.position.lerpVectors(from, to, frac);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Low-Latency Edge Interconnect Channels */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.75 : 0.4}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 2. Edge Computing Nodes */}
      {nodePositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <octahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={color}
            emissiveIntensity={isHovered ? 2.0 : 1.1}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* 3. Travelling Network Stream Packet */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};
