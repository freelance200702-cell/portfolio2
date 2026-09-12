import React from 'react';
import { Text } from '@react-three/drei';
import { JETBRAINS_MONO_FONT } from '@/constants/assets';

export const DepartureThreshold: React.FC = () => {
  return (
    <group position={[0, 0, 22]}>
      {/* 1. Monumental Architectural Launch Terrace Deck */}
      <mesh position={[0, 1.52, 0]} receiveShadow>
        <boxGeometry args={[7.2, 0.22, 10.0]} />
        <meshStandardMaterial
          color="#080a10"
          roughness={0.25}
          metalness={0.92}
        />
      </mesh>

      {/* 2. Sub-Deck Structural Foundation Plinth (anchoring to planetary bedrock) */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[6.8, 1.9, 9.6]} />
        <meshStandardMaterial
          color="#05070c"
          roughness={0.6}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Left Framing Architectural Pylon (Angled Brutalist Pillar) */}
      <mesh position={[-3.8, 4.2, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 5.8, 1.6]} />
        <meshStandardMaterial
          color="#0d111a"
          roughness={0.3}
          metalness={0.88}
        />
      </mesh>
      {/* Left Pylon Accent Luminaire */}
      <mesh position={[-3.4, 4.2, -1.0]}>
        <boxGeometry args={[0.04, 5.4, 0.08]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* 4. Right Framing Architectural Pylon */}
      <mesh position={[3.8, 4.2, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 5.8, 1.6]} />
        <meshStandardMaterial
          color="#0d111a"
          roughness={0.3}
          metalness={0.88}
        />
      </mesh>
      {/* Right Pylon Accent Luminaire */}
      <mesh position={[3.4, 4.2, -1.0]}>
        <boxGeometry args={[0.04, 5.4, 0.08]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* 5. Overhead Cantilevered Gateway Canopy (Letterbox framing the horizon vista) */}
      <mesh position={[0, 6.9, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[8.4, 0.5, 2.2]} />
        <meshStandardMaterial
          color="#0a0e16"
          roughness={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* Soft Overhead Architectural Downlight */}
      <spotLight
        position={[0, 6.6, -1.0]}
        target-position={[0, 1.6, 0]}
        intensity={2.8}
        distance={9}
        angle={0.65}
        penumbra={0.7}
        color="#e0f2fe"
      />

      {/* 6. Concentric Hairline Guidance Markings on Launchway Deck */}
      <mesh position={[0, 1.64, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.63, 64]} />
        <meshBasicMaterial color="#f8fafc" transparent opacity={0.6} />
      </mesh>

      <mesh position={[0, 1.64, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.12, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
      </mesh>

      {/* 7. Departure Guidance Runway Curbs */}
      <mesh position={[-2.4, 1.65, 0]}>
        <boxGeometry args={[0.1, 0.04, 9.0]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.5} />
      </mesh>
      <mesh position={[2.4, 1.65, 0]}>
        <boxGeometry args={[0.1, 0.04, 9.0]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.5} />
      </mesh>

      {/* 8. Crisp Ground Telemetry Typography */}
      <Text
        position={[0, 1.65, 2.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        font={JETBRAINS_MONO_FONT}
      >
        [ EXPEDITION PORTAL // 01 DEPARTURE ]
      </Text>

      <Text
        position={[0, 1.65, 3.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
        font={JETBRAINS_MONO_FONT}
      >
        SCROLL OR SWIPE TO EMBARK ALONG 3D ARCHITECTURAL TRAJECTORY
      </Text>
    </group>
  );
};
