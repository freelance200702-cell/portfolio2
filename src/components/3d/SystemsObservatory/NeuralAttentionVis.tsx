import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface NeuralAttentionVisProps {
  color?: string;
  isHovered?: boolean;
}

export const NeuralAttentionVis: React.FC<NeuralAttentionVisProps> = ({
  color = '#818cf8',
  isHovered = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const lineMatRef = useRef<THREE.LineBasicMaterial>(null);

  // Generate 8 key/query/value token nodes positioned on an orbital ellipsoid
  const { nodePositions, lineIndices } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    nodes.push(new THREE.Vector3(0, 0, 0)); // Center Query Node

    const tokenCount = 8;
    for (let i = 0; i < tokenCount; i++) {
      const theta = (i / tokenCount) * Math.PI * 2;
      const phi = (i % 2 === 0 ? 0.35 : -0.35) * Math.PI;
      const r = 1.35;
      const x = r * Math.cos(theta) * Math.cos(phi);
      const y = r * Math.sin(phi);
      const z = r * Math.sin(theta) * Math.cos(phi);
      nodes.push(new THREE.Vector3(x, y, z));
    }

    const indices: number[] = [];
    // Interconnect center node to all token nodes
    for (let i = 1; i <= tokenCount; i++) {
      indices.push(0, i);
    }
    // Interconnect adjacent peripheral token nodes
    for (let i = 1; i <= tokenCount; i++) {
      const next = i === tokenCount ? 1 : i + 1;
      indices.push(i, next);
    }

    return { nodePositions: nodes, lineIndices: indices };
  }, []);

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions: number[] = [];
    lineIndices.forEach((idx) => {
      const pt = nodePositions[idx];
      positions.push(pt.x, pt.y, pt.z);
    });
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geom;
  }, [nodePositions, lineIndices]);

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
    };
  }, [lineGeometry]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = isHovered ? 1.2 : 0.45;
    groupRef.current.rotation.y += delta * speed;
    groupRef.current.rotation.x += delta * speed * 0.35;

    if (lineMatRef.current) {
      const targetOpacity = isHovered ? 0.85 : 0.45;
      lineMatRef.current.opacity = THREE.MathUtils.damp(
        lineMatRef.current.opacity,
        targetOpacity,
        4,
        delta
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Synaptic Attention Interconnect Lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          ref={lineMatRef}
          color={color}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 2. Central Attention Hub Node */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={isHovered ? 2.0 : 1.2}
          roughness={0.2}
        />
      </mesh>

      {/* 3. Peripheral Token Activation Nodes */}
      {nodePositions.slice(1).map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHovered ? 1.8 : 0.8}
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};
