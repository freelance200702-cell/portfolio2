import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BaseLandmarkProps } from './LandmarkTypes';

/**
 * Miniature Environment:
 * A contoured geological diorama / micro-topography habitat.
 * Features stepped contour slabs, obsidian mineral crystal clusters,
 * a dark reflective water basin, and a delicate environmental telemetry mast.
 */
export const MiniatureEnvironment: React.FC<BaseLandmarkProps> = ({
  state,
  proximity,
  isFocused,
  isSelected,
  primaryColor,
  secondaryColor,
}) => {
  const crystalGroupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((stateObj, delta) => {
    // Subtle breathing rotation for the geological crystal cluster
    if (crystalGroupRef.current) {
      const speed = state === 'idle' ? 0.2 : isFocused ? 0.8 : 0.45;
      crystalGroupRef.current.rotation.y += delta * speed * 0.4;
    }

    // Survey beacon pulse
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const pulse = (Math.sin(stateObj.clock.elapsedTime * 3) + 1) * 0.5;
        const baseIntensity = isSelected ? 2.5 : isFocused ? 1.8 : 0.8;
        mat.emissiveIntensity = baseIntensity + pulse * 0.8;
      }
    }

    // Gentle ripple reflection effect on shallow water plane
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.roughness = 0.05 + Math.sin(stateObj.clock.elapsedTime * 0.8) * 0.02;
      }
    }
  });

  const showDetail = state !== 'idle' || proximity > 0.25;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Containment Basin (Exterior retaining wall) */}
      <mesh position={[0, 0.2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.2, 2.4, 0.4, 24]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* 2. Stepped Topographic Contour Layers */}
      {/* Tier 1: Lowland Plateau */}
      <mesh position={[0.2, 0.38, -0.1]} receiveShadow>
        <cylinderGeometry args={[1.9, 2.05, 0.16, 16]} />
        <meshStandardMaterial color="#121824" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Tier 2: Mid-Elevation Ridge */}
      <mesh position={[-0.25, 0.55, -0.2]} receiveShadow>
        <cylinderGeometry args={[1.4, 1.6, 0.2, 12]} />
        <meshStandardMaterial color="#172030" roughness={0.65} metalness={0.4} />
      </mesh>

      {/* Tier 3: High Peak Terrace */}
      <mesh position={[-0.45, 0.76, -0.35]} receiveShadow>
        <cylinderGeometry args={[0.85, 1.05, 0.22, 10]} />
        <meshStandardMaterial color="#1c2638" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* 3. Dark Mirror Reflecting Basin (Shallow pool) */}
      <mesh ref={waterRef} position={[0.55, 0.48, 0.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 24]} />
        <meshStandardMaterial
          color="#04060a"
          roughness={0.06}
          metalness={0.96}
        />
      </mesh>

      {/* Basin Perimeter Bevel Ring */}
      <mesh position={[0.55, 0.48, 0.35]}>
        <torusGeometry args={[0.76, 0.02, 8, 32]} />
        <meshStandardMaterial color={primaryColor} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* 4. Geological Crystal Formation (Outcrop) */}
      <group ref={crystalGroupRef} position={[-0.45, 0.88, -0.35]}>
        {/* Central Obelisk Spire */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <coneGeometry args={[0.3, 1.3, 6]} />
          <meshStandardMaterial
            color="#080c14"
            emissive={primaryColor}
            emissiveIntensity={state === 'idle' ? 0.3 : 1.1}
            roughness={0.12}
            metalness={0.85}
          />
        </mesh>

        {/* Flanking Secondary Prisms */}
        <mesh position={[0.22, 0.35, 0.12]} rotation={[0.15, 0.4, -0.2]} castShadow>
          <coneGeometry args={[0.18, 0.8, 5]} />
          <meshStandardMaterial
            color="#0d1424"
            emissive={secondaryColor}
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
        <mesh position={[-0.18, 0.4, 0.15]} rotation={[-0.2, -0.3, 0.25]} castShadow>
          <coneGeometry args={[0.16, 0.75, 5]} />
          <meshStandardMaterial
            color="#0d1424"
            emissive={primaryColor}
            emissiveIntensity={0.4}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* 5. Meteorological Survey Mast / Telemetry Station */}
      <group position={[1.1, 0.45, -0.8]}>
        {/* Concrete Anchor Footing */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.35, 0.2, 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Vertical Lattice Mast */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.02, 0.04, 2.6, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Survey Beacon Light */}
        <mesh ref={beaconRef} position={[0, 2.72, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={primaryColor}
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>

        {/* Mast Crossarms & Sensor Anemometer Blades */}
        {showDetail && (
          <group position={[0, 2.4, 0]}>
            <mesh>
              <boxGeometry args={[0.4, 0.02, 0.02]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[0.4, 0.02, 0.02]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} />
            </mesh>
          </group>
        )}
      </group>

      {/* 6. Landscape Specimen Boulders */}
      {showDetail && (
        <group>
          <mesh position={[0.2, 0.48, 1.1]} rotation={[0.4, 0.6, 0.2]}>
            <dodecahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[-0.8, 0.42, 0.8]} rotation={[-0.3, 0.8, 0.5]}>
            <dodecahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color="#1e293b" roughness={0.85} />
          </mesh>
        </group>
      )}

      {/* Atmosphere Point Light */}
      <pointLight
        position={[-0.4, 2.4, -0.2]}
        color={primaryColor}
        intensity={isSelected ? 2.8 : isFocused ? 2.0 : 0.8}
        distance={7}
        decay={2}
      />
    </group>
  );
};
