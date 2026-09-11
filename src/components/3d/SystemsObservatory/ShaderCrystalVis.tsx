import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ShaderCrystalVisProps {
  color?: string;
  isHovered?: boolean;
}

export const ShaderCrystalVis: React.FC<ShaderCrystalVisProps> = ({
  color = '#34d399',
  isHovered = false,
}) => {
  const crystalRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const speed = isHovered ? 1.0 : 0.4;
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * speed;
      crystalRef.current.rotation.x += delta * speed * 0.45;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= delta * speed * 0.75;
      wireframeRef.current.rotation.z += delta * speed * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * speed * 0.8;
    }
  });

  return (
    <group>
      {/* 1. Core Refractive Multi-Faceted Crystal */}
      <mesh ref={crystalRef}>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.6 : 0.25}
          roughness={0.15}
          metalness={0.85}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>

      {/* 2. Counter-Rotating Geometric Wireframe Shell */}
      <lineSegments ref={wireframeRef}>
        <wireframeGeometry args={[new THREE.IcosahedronGeometry(1.2, 1)]} />
        <lineBasicMaterial
          color="#f8fafc"
          transparent
          opacity={isHovered ? 0.45 : 0.2}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 3. Equatorial Specular Light Ring */}
      <group ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.4, 0.015, 8, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  );
};
