import React from 'react';
import { Text } from '@react-three/drei';
import { JETBRAINS_MONO_FONT } from '@/constants/assets';

export const DepartureThreshold: React.FC = () => {
  return (
    <group position={[0, 0, 18]}>
      {/* 1. Milled Dark Titanium Threshold Pad */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.4, 0.08, 4.0]} />
        <meshStandardMaterial
          color="#06060a"
          roughness={0.25}
          metalness={0.92}
        />
      </mesh>

      {/* 2. Concentric Hairline Guide Rings on Floor */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.23, 64]} />
        <meshBasicMaterial color="#f8fafc" transparent opacity={0.65} />
      </mesh>

      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.52, 64]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.35} />
      </mesh>

      {/* 3. Hairline Edge Pylons (Left & Right) */}
      <mesh position={[-1.7, 0.5, 0]}>
        <boxGeometry args={[0.04, 1.0, 0.04]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#f8fafc"
          emissiveIntensity={0.8}
        />
      </mesh>

      <mesh position={[1.7, 0.5, 0]}>
        <boxGeometry args={[0.04, 1.0, 0.04]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive="#f8fafc"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* 4. 3D Spatial Origin Label on Deck */}
      <Text
        position={[0, 0.12, 1.2]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
        font={JETBRAINS_MONO_FONT}
      >
        [ EXPEDITION DEPARTURE // TRACK 01 // 60 FPS ]
      </Text>
    </group>
  );
};
