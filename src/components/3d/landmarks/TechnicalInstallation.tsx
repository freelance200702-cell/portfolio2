import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BaseLandmarkProps } from './LandmarkTypes';

/**
 * Technical Installation:
 * A high-precision optical collimator / sensor array installation.
 * Features an articulated optics gimbal, twin cryogenic coolant reservoirs,
 * vibration-isolated steel pedestal mounts, conduit manifolds, and a collimated alignment laser.
 */
export const TechnicalInstallation: React.FC<BaseLandmarkProps> = ({
  state,
  proximity,
  isFocused,
  isSelected,
  primaryColor,
  secondaryColor,
}) => {
  const gimbalRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Mesh>(null);
  const laserRef = useRef<THREE.Mesh>(null);
  const coilGlowRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((stateObj, delta) => {
    // Gimbal optical alignment reaction
    if (gimbalRef.current) {
      if (isFocused || isSelected) {
        // Locked inspection angle facing slightly forward
        gimbalRef.current.rotation.y = THREE.MathUtils.damp(
          gimbalRef.current.rotation.y,
          0.12,
          3.0,
          delta
        );
        gimbalRef.current.rotation.x = THREE.MathUtils.damp(
          gimbalRef.current.rotation.x,
          0.15,
          3.0,
          delta
        );
      } else if (state === 'approaching') {
        // Slew toward incoming traveler
        gimbalRef.current.rotation.y = THREE.MathUtils.damp(
          gimbalRef.current.rotation.y,
          -0.25,
          2.0,
          delta
        );
      } else {
        // Slow calibration sweep in idle
        gimbalRef.current.rotation.y = Math.sin(stateObj.clock.elapsedTime * 0.4) * 0.2;
        gimbalRef.current.rotation.x = Math.sin(stateObj.clock.elapsedTime * 0.3) * 0.08;
      }
    }

    // Laser focus beam intensity
    if (laserRef.current) {
      const mat = laserRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        const targetOpacity = isSelected ? 0.45 : isFocused ? 0.3 : state === 'approaching' ? 0.15 : 0.04;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 4.0, delta);
      }
    }

    // Cryogenic coil glow
    if (coilGlowRef.current) {
      const targetEmissive = isSelected ? 2.2 : isFocused ? 1.5 : 0.5;
      coilGlowRef.current.emissiveIntensity = THREE.MathUtils.damp(
        coilGlowRef.current.emissiveIntensity,
        targetEmissive,
        3.0,
        delta
      );
    }
  });

  const showDetail = state !== 'idle' || proximity > 0.2;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Cast-Iron Vibration Isolation Base */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.0, 2.3, 0.3, 16]} />
        <meshStandardMaterial color="#0c1018" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Vibration-Damping Neoprene Pad Ring */}
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[1.7, 0.03, 8, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* 2. Central Turret Pedestal & Ring Slew Bearing */}
      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.3, 0.6, 16]} />
        <meshStandardMaterial color="#111726" roughness={0.4} metalness={0.85} />
      </mesh>

      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.95} />
      </mesh>

      {/* 3. Articulated Optics & Sensor Gimbal Assembly */}
      <group ref={gimbalRef} position={[0, 1.4, 0]}>
        {/* Gimbal Dual Yoke Arms */}
        <mesh position={[-0.7, 0.4, 0]} castShadow>
          <boxGeometry args={[0.15, 1.1, 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0.7, 0.4, 0]} castShadow>
          <boxGeometry args={[0.15, 1.1, 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
        </mesh>

        {/* Central Optics Barrel */}
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.45, 1.2, 24]} />
          <meshStandardMaterial color="#090d16" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Primary Aperture Lens Ring */}
        <mesh position={[0, 0.4, 0.62]}>
          <torusGeometry args={[0.48, 0.03, 12, 32]} />
          <meshStandardMaterial color={primaryColor} roughness={0.1} metalness={0.95} />
        </mesh>

        {/* Deep Optical Objective Glass Element */}
        <mesh position={[0, 0.4, 0.58]}>
          <circleGeometry args={[0.45, 24]} />
          <meshStandardMaterial
            color="#050a14"
            roughness={0.05}
            metalness={0.95}
          />
        </mesh>

        {/* Secondary Parabolic Collector Dish (Rear) */}
        <mesh ref={dishRef} position={[0, 0.4, -0.65]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.85, 0.2, 0.25, 24, 1, true]} />
          <meshStandardMaterial
            color="#0f172a"
            side={THREE.DoubleSide}
            roughness={0.3}
            metalness={0.88}
          />
        </mesh>

        {/* 4. Collimated Alignment Laser Guide (Beams down and forward) */}
        <mesh ref={laserRef} position={[0, 0.4, 3.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 5.2, 8]} />
          <meshBasicMaterial
            color={primaryColor}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 5. Flanking Cryogenic Manifold Reservoirs */}
      <group position={[-1.2, 0.7, -0.4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Cryo Level Indicator Band */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.225, 0.225, 0.12, 16]} />
          <meshStandardMaterial
            ref={coilGlowRef}
            color={secondaryColor}
            emissive={secondaryColor}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      <group position={[1.2, 0.7, -0.4]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.225, 0.225, 0.12, 16]} />
          <meshStandardMaterial
            color={secondaryColor}
            emissive={secondaryColor}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* 6. Precision Conduit Piping & Cable Trunks */}
      {showDetail && (
        <group>
          {/* Left Flex Hose */}
          <mesh position={[-0.8, 0.4, -0.2]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.035, 0.035, 0.9, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
          </mesh>
          {/* Right Flex Hose */}
          <mesh position={[0.8, 0.4, -0.2]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.035, 0.035, 0.9, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
          </mesh>
        </group>
      )}

      {/* 7. Installation Spotlight */}
      <pointLight
        position={[0, 2.5, 0.8]}
        color={primaryColor}
        intensity={isSelected ? 3.0 : isFocused ? 2.2 : 0.9}
        distance={8}
        decay={2}
      />
    </group>
  );
};
