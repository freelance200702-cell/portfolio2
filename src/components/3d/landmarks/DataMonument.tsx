import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BaseLandmarkProps } from './LandmarkTypes';

/**
 * Data Monument:
 * A monumental obsidian server stele / high-density compute obelisk.
 * Features a 4.2m tall monolithic pillar with recessed vertical optical bus channels,
 * smoked acrylic server blade bays with status indicators, and floor-routed fiber conduit trunks.
 */
export const DataMonument: React.FC<BaseLandmarkProps> = ({
  state,
  proximity,
  isFocused,
  isSelected,
  primaryColor,
  secondaryColor,
}) => {
  const pylonRef = useRef<THREE.Mesh>(null);
  const busRevealRef = useRef<THREE.Mesh>(null);
  const serverBaysRef = useRef<THREE.Group>(null);

  useFrame((stateObj, _delta) => {
    // Monolithic bus channel sequential pulsing effect
    if (busRevealRef.current) {
      const mat = busRevealRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const pulseSpeed = isFocused ? 5.0 : state === 'approaching' ? 3.0 : 1.2;
        const wave = (Math.sin(stateObj.clock.elapsedTime * pulseSpeed) + 1) * 0.5;
        const base = isSelected ? 2.5 : isFocused ? 1.8 : state === 'approaching' ? 0.9 : 0.4;
        mat.emissiveIntensity = base + wave * 0.7;
      }
    }

    // Subtle server activity blinkers
    if (serverBaysRef.current) {
      const children = serverBaysRef.current.children;
      const t = stateObj.clock.elapsedTime;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as THREE.Mesh;
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat) {
          const blink = Math.sin(t * (4 + i * 2) + i) > 0.2;
          mat.emissiveIntensity = isFocused ? (blink ? 1.6 : 0.4) : (blink ? 0.8 : 0.2);
        }
      }
    }
  });

  const showDetail = state !== 'idle' || proximity > 0.2;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Stepped Basalt Monolith Foundation (Warm Limestone & Travertine) */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.2, 0.3, 3.2]} />
        <meshStandardMaterial color="#8c8479" roughness={0.7} metalness={0.04} />
      </mesh>

      <mesh position={[0, 0.38, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.16, 2.4]} />
        <meshStandardMaterial color="#ded8ce" roughness={0.6} metalness={0.04} />
      </mesh>

      {/* Recessed Floor Conduit Ring */}
      <mesh position={[0, 0.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.45, 32]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={state === 'idle' ? 0.4 : 1.2}
          roughness={0.2}
        />
      </mesh>

      {/* 2. Monumental Charcoal Basalt Compute Pillar (4.2m tall) */}
      <mesh ref={pylonRef} position={[0, 2.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 4.0, 1.2]} />
        <meshStandardMaterial
          color="#262320"
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>

      {/* 3. Central Spine Optical Bus Light Reveal (Running up full height) */}
      <mesh ref={busRevealRef} position={[0, 2.4, 0.61]}>
        <boxGeometry args={[0.12, 3.8, 0.04]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.6}
          roughness={0.1}
        />
      </mesh>

      {/* Lateral Corner Accent Chamfers */}
      <mesh position={[-0.6, 2.4, 0.6]}>
        <boxGeometry args={[0.04, 3.8, 0.04]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0.6, 2.4, 0.6]}>
        <boxGeometry args={[0.04, 3.8, 0.04]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* 4. Flanking Recessed Server Blade Bays */}
      <group ref={serverBaysRef}>
        {/* Left Side Blades */}
        <mesh position={[-0.61, 1.8, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.8]} />
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.61, 2.2, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.8]} />
          <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.61, 2.6, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.8]} />
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.8} />
        </mesh>

        {/* Right Side Blades */}
        <mesh position={[0.61, 1.8, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.8]} />
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.61, 2.2, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.8]} />
          <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.61, 2.6, 0]}>
          <boxGeometry args={[0.04, 0.12, 0.8]} />
          <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* 5. Floor-Routed Fiber Conduit Trunks */}
      {showDetail && (
        <group>
          {/* Front Left Conduit Trunk */}
          <mesh position={[-0.8, 0.5, 0.6]} rotation={[0, 0.6, 0]}>
            <boxGeometry args={[0.1, 0.08, 0.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Front Right Conduit Trunk */}
          <mesh position={[0.8, 0.5, 0.6]} rotation={[0, -0.6, 0]}>
            <boxGeometry args={[0.1, 0.08, 0.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* Monolith Summit Pylon Beacon */}
      <mesh position={[0, 4.45, 0]}>
        <coneGeometry args={[0.2, 0.35, 4]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={primaryColor}
          emissiveIntensity={isSelected ? 3.0 : isFocused ? 2.0 : 1.0}
        />
      </mesh>

      {/* Pylon Illumination */}
      <pointLight
        position={[0, 3.2, 1.2]}
        color={primaryColor}
        intensity={isSelected ? 3.2 : isFocused ? 2.4 : 0.9}
        distance={9}
        decay={2}
      />
    </group>
  );
};
