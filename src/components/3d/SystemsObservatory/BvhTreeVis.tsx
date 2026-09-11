import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BvhTreeVisProps {
  color?: string;
  isHovered?: boolean;
}

export const BvhTreeVis: React.FC<BvhTreeVisProps> = ({
  color = '#38bdf8',
  isHovered = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const probeRef = useRef<THREE.Mesh>(null);
  const leftChildRef = useRef<THREE.LineSegments>(null);
  const rightChildRef = useRef<THREE.LineSegments>(null);

  // Memoize shared wireframe bounding box geometries once and dispose on unmount
  const { rootEdges, childEdges } = useMemo(() => {
    const rootBox = new THREE.BoxGeometry(2.4, 2.0, 2.4);
    const root = new THREE.EdgesGeometry(rootBox);
    rootBox.dispose();

    const childBox = new THREE.BoxGeometry(1.1, 1.6, 1.1);
    const child = new THREE.EdgesGeometry(childBox);
    childBox.dispose();

    return { rootEdges: root, childEdges: child };
  }, []);

  useEffect(() => {
    return () => {
      rootEdges.dispose();
      childEdges.dispose();
    };
  }, [rootEdges, childEdges]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const speed = isHovered ? 0.9 : 0.35;
    groupRef.current.rotation.y += delta * speed;

    const t = clock.getElapsedTime() * (isHovered ? 2.8 : 1.6);
    const probeZ = Math.sin(t) * 1.3;

    if (probeRef.current) {
      probeRef.current.position.z = probeZ;
    }

    // Dynamic collision flash when probe passes through children
    if (leftChildRef.current) {
      const mat = leftChildRef.current.material as THREE.LineBasicMaterial;
      if (mat) {
        const active = probeZ < 0;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, active ? 0.9 : 0.25, 6, delta);
      }
    }

    if (rightChildRef.current) {
      const mat = rightChildRef.current.material as THREE.LineBasicMaterial;
      if (mat) {
        const active = probeZ >= 0;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, active ? 0.9 : 0.25, 6, delta);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Root Level Bounding Box (AABB) */}
      <lineSegments geometry={rootEdges}>
        <lineBasicMaterial
          color="#94a3b8"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 2. Left Subtree Bounding Box */}
      <lineSegments ref={leftChildRef} position={[-0.55, 0, -0.55]} geometry={childEdges}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 3. Right Subtree Bounding Box */}
      <lineSegments ref={rightChildRef} position={[0.55, 0, 0.55]} geometry={childEdges}>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 4. Leaf Node Entities */}
      <mesh position={[-0.55, 0, -0.55]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 1.5 : 0.8}
          roughness={0.2}
          wireframe
        />
      </mesh>

      <mesh position={[0.55, 0, 0.55]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 1.5 : 0.8}
          roughness={0.2}
          wireframe
        />
      </mesh>

      {/* 5. Sweeping Raycast Collision Probe */}
      <mesh ref={probeRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};
