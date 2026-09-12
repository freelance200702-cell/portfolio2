import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BaseLandmarkProps } from './LandmarkTypes';

/**
 * Architectural Structure:
 * A modernist/brutalist architectural pavilion destination.
 * Features cantilevered precast roof slabs, structural steel mullions,
 * beveled viewing terraces, and a recessed ceiling luminaire that illuminates
 * an interior console table as the traveler approaches.
 */
export const ArchitecturalStructure: React.FC<BaseLandmarkProps> = ({
  state,
  proximity,
  isFocused,
  isSelected,
  hovered: _hovered,
  primaryColor,
  secondaryColor,
}) => {
  const roofRef = useRef<THREE.Mesh>(null);
  const interiorLightRef = useRef<THREE.PointLight>(null);
  const consoleDisplayRef = useRef<THREE.Mesh>(null);

  // Progressive light intensity & glow animation
  useFrame((_, delta) => {
    if (interiorLightRef.current) {
      const targetIntensity = isSelected ? 3.5 : isFocused ? 2.6 : state === 'approaching' ? 1.4 : 0.4;
      interiorLightRef.current.intensity = THREE.MathUtils.damp(
        interiorLightRef.current.intensity,
        targetIntensity,
        4.0,
        delta
      );
    }

    if (consoleDisplayRef.current) {
      const mat = consoleDisplayRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const targetEmissive = isSelected ? 2.0 : isFocused ? 1.4 : state === 'approaching' ? 0.7 : 0.2;
        mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, targetEmissive, 3.5, delta);
      }
    }
  });

  const showHighDetail = state !== 'idle' || proximity > 0.2;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Stepped Concrete Podium Platform (Warm Limestone & Travertine) */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.2, 0.2, 3.8]} />
        <meshStandardMaterial
          color="#ded8ce"
          roughness={0.7}
          metalness={0.04}
        />
      </mesh>

      <mesh position={[0, 0.26, 0.2]} receiveShadow>
        <boxGeometry args={[3.8, 0.12, 3.2]} />
        <meshStandardMaterial
          color="#ede8de"
          roughness={0.6}
          metalness={0.04}
        />
      </mesh>

      {/* Recessed Floor Optical Accent Border (Restrained Charcoal Inlay) */}
      <mesh position={[0, 0.33, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.7, 3.1]} />
        <meshStandardMaterial
          color="#3b3734"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* 2. Rear Structural Spine & Shear Wall (Warm Travertine) */}
      <mesh position={[0, 1.6, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 2.6, 0.25]} />
        <meshStandardMaterial
          color="#f5f0e8"
          roughness={0.65}
          metalness={0.03}
        />
      </mesh>

      {/* Vertical Accent Reveals on the Rear Wall */}
      <mesh position={[-1.2, 1.6, -1.36]}>
        <boxGeometry args={[0.06, 2.4, 0.04]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={state === 'idle' ? 0.3 : 1.2}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[1.2, 1.6, -1.36]}>
        <boxGeometry args={[0.06, 2.4, 0.04]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={state === 'idle' ? 0.3 : 1.2}
          roughness={0.2}
        />
      </mesh>

      {/* 3. Cantilevered Precast Roof Canopy (Warm Ivory Precast Concrete) */}
      <mesh ref={roofRef} position={[0, 3.0, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[4.4, 0.25, 3.4]} />
        <meshStandardMaterial
          color="#eae5dc"
          roughness={0.55}
          metalness={0.04}
        />
      </mesh>

      {/* Canopy Underside Recessed Luminaire Slot */}
      <mesh position={[0, 2.86, 0]}>
        <boxGeometry args={[3.2, 0.03, 0.25]} />
        <meshStandardMaterial
          color="#f8fafc"
          emissive={primaryColor}
          emissiveIntensity={state === 'idle' ? 0.5 : 2.0}
          roughness={0.1}
        />
      </mesh>

      {/* 4. Structural Steel Fins / Columns (Restrained Architectural Charcoal Bronze) */}
      <mesh position={[-1.9, 1.5, 0.8]} castShadow>
        <boxGeometry args={[0.15, 2.8, 0.4]} />
        <meshStandardMaterial color="#3b3734" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[1.9, 1.5, 0.8]} castShadow>
        <boxGeometry args={[0.15, 2.8, 0.4]} />
        <meshStandardMaterial color="#3b3734" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 5. Interior Architectural Exhibit Console */}
      <group position={[0, 0.35, -0.2]}>
        {/* Warm Basalt / Bronze Plinth Base */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.8, 0.9]} />
          <meshStandardMaterial
            color="#4a443e"
            roughness={0.6}
            metalness={0.15}
          />
        </mesh>

        {/* Angled Glass/Titanium Display Plaque */}
        <mesh
          ref={consoleDisplayRef}
          position={[0, 0.88, 0.05]}
          rotation={[-0.35, 0, 0]}
        >
          <boxGeometry args={[1.4, 0.04, 0.7]} />
          <meshStandardMaterial
            color="#23201d"
            emissive={secondaryColor}
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={0.7}
          />
        </mesh>
      </group>

      {/* 6. Front Balustrade / Guardrail (Waist-height scale cue at h = 0.8m) */}
      <group position={[0, 0.35, 1.5]}>
        {/* Top Handrail */}
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[3.6, 0.05, 0.08]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Tinted Balustrade Glass Plate */}
        <mesh position={[0, 0.38, 0]}>
          <boxGeometry args={[3.4, 0.7, 0.02]} />
          <meshStandardMaterial
            color="#0f172a"
            transparent
            opacity={0.65}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>

        {/* Balustrade Posts */}
        {showHighDetail && (
          <>
            <mesh position={[-1.7, 0.38, 0]}>
              <boxGeometry args={[0.05, 0.76, 0.05]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            <mesh position={[1.7, 0.38, 0]}>
              <boxGeometry args={[0.05, 0.76, 0.05]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
          </>
        )}
      </group>

      {/* 7. Interior Warm/Cool Downlight */}
      <pointLight
        ref={interiorLightRef}
        position={[0, 2.7, 0]}
        color={primaryColor}
        intensity={1.2}
        distance={8}
        decay={2}
      />
    </group>
  );
};
