import React from 'react';
import { Text } from '@react-three/drei';
import { JETBRAINS_MONO_FONT } from '@/constants/assets';

export const DepartureThreshold: React.FC = () => {
  return (
    <group position={[0, 0, 22]}>
      {/* 1. Monumental Architectural Launch Terrace Deck (Warm Ivory Travertine Deck) */}
      <mesh position={[0, 1.52, 0]} receiveShadow>
        <boxGeometry args={[7.2, 0.22, 10.0]} />
        <meshStandardMaterial
          color="#ded8ce"
          roughness={0.65}
          metalness={0.03}
        />
      </mesh>

      {/* 2. Sub-Deck Structural Foundation Plinth (Layered Warm Limestone Plinth) */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[6.8, 1.9, 9.6]} />
        <meshStandardMaterial
          color="#8c8479"
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>

      {/* 3. Left Framing Architectural Pylon (Warm Ivory Precast Concrete Pillar) */}
      <mesh position={[-3.8, 4.2, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 5.8, 1.6]} />
        <meshStandardMaterial
          color="#eae5dc"
          roughness={0.6}
          metalness={0.04}
        />
      </mesh>
      {/* Left Pylon Accent Luminaire */}
      <mesh position={[-3.4, 4.2, -1.0]}>
        <boxGeometry args={[0.04, 5.4, 0.08]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* 4. Right Framing Architectural Pylon (Warm Ivory Precast Concrete Pillar) */}
      <mesh position={[3.8, 4.2, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 5.8, 1.6]} />
        <meshStandardMaterial
          color="#eae5dc"
          roughness={0.6}
          metalness={0.04}
        />
      </mesh>
      {/* Right Pylon Accent Luminaire */}
      <mesh position={[3.4, 4.2, -1.0]}>
        <boxGeometry args={[0.04, 5.4, 0.08]} />
        <meshBasicMaterial color="#fef3c7" />
      </mesh>

      {/* 5. Overhead Cantilevered Gateway Canopy (Letterbox framing the horizon vista) */}
      <mesh position={[0, 6.9, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[8.4, 0.5, 2.2]} />
        <meshStandardMaterial
          color="#e2ded6"
          roughness={0.6}
          metalness={0.04}
        />
      </mesh>

      {/* Soft Overhead Architectural Downlight */}
      <spotLight
        position={[0, 6.6, -1.0]}
        target-position={[0, 1.6, 0]}
        intensity={3.6}
        distance={11}
        angle={0.65}
        penumbra={0.7}
        color="#fffbeb"
      />

      {/* 6. Concentric Hairline Guidance Markings on Launchway Deck */}
      <mesh position={[0, 1.64, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.63, 64]} />
        <meshBasicMaterial color="#f5f5f4" transparent opacity={0.8} />
      </mesh>

      <mesh position={[0, 1.64, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.1, 2.12, 64]} />
        <meshBasicMaterial color="#d97706" transparent opacity={0.6} />
      </mesh>

      {/* 7. Departure Guidance Runway Curbs */}
      <mesh position={[-2.4, 1.65, 0]}>
        <boxGeometry args={[0.1, 0.04, 9.0]} />
        <meshBasicMaterial color="#3b3734" transparent opacity={0.6} />
      </mesh>
      <mesh position={[2.4, 1.65, 0]}>
        <boxGeometry args={[0.1, 0.04, 9.0]} />
        <meshBasicMaterial color="#3b3734" transparent opacity={0.6} />
      </mesh>

      {/* 8. Crisp Ground Telemetry Typography (Readable on Warm Deck) */}
      <Text
        position={[0, 1.65, 2.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="#262321"
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
        color="#57534e"
        anchorX="center"
        anchorY="middle"
        font={JETBRAINS_MONO_FONT}
      >
        SCROLL OR SWIPE TO EMBARK ALONG 3D ARCHITECTURAL TRAJECTORY
      </Text>
    </group>
  );
};
