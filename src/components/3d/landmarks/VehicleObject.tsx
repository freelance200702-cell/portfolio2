import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BaseLandmarkProps } from './LandmarkTypes';

/**
 * Vehicle / Object Landmark:
 * An aerodynamic exploration probe / autonomous aerospace research craft
 * supported on an elevated maintenance cradle.
 * Features titanium faceted fuselage, twin deployable telemetry solar fins,
 * an ion propulsion emitter bell, and navigation strobe beacons.
 */
export const VehicleObject: React.FC<BaseLandmarkProps> = ({
  state,
  proximity,
  isFocused,
  isSelected,
  primaryColor,
  secondaryColor,
}) => {
  const craftRef = useRef<THREE.Group>(null);
  const ionEngineRef = useRef<THREE.Mesh>(null);
  const strobeRef = useRef<THREE.Mesh>(null);

  useFrame((stateObj, _delta) => {
    // Subtle aerodynamic float / suspension compliance
    if (craftRef.current) {
      const floatAmp = state === 'idle' ? 0.02 : 0.04;
      craftRef.current.position.y = 1.35 + Math.sin(stateObj.clock.elapsedTime * 1.5) * floatAmp;
      craftRef.current.rotation.z = Math.sin(stateObj.clock.elapsedTime * 1.0) * (floatAmp * 0.5);
    }

    // Ion propulsion glow
    if (ionEngineRef.current) {
      const mat = ionEngineRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const base = isSelected ? 3.0 : isFocused ? 2.0 : state === 'approaching' ? 1.0 : 0.4;
        const jitter = (Math.sin(stateObj.clock.elapsedTime * 14) + 1) * 0.15;
        mat.emissiveIntensity = base + jitter;
      }
    }

    // Navigation strobe beacon (aviation style periodic flash)
    if (strobeRef.current) {
      const mat = strobeRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        const timeMod = stateObj.clock.elapsedTime % 1.4;
        const flash = timeMod < 0.08 || (timeMod > 0.18 && timeMod < 0.26);
        mat.color.set(flash ? '#ffffff' : primaryColor);
      }
    }
  });

  const showDetail = state !== 'idle' || proximity > 0.2;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Ground Maintenance & Servicing Cradle Platform */}
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.6, 0.3, 2.6]} />
        <meshStandardMaterial color="#0e131d" roughness={0.6} metalness={0.6} />
      </mesh>

      {/* Safety Hazard Perimeter Marking Edge */}
      <mesh position={[0, 0.31, 1.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 0.1]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* 2. Elevated Hydraulic Cradle Support Stanchions */}
      <group position={[0, 0.3, 0]}>
        {/* Forward Cradle Rest */}
        <mesh position={[0, 0.4, 0.8]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.15]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Rear Twin Cradle Struts */}
        <mesh position={[-0.9, 0.45, -0.6]} rotation={[0, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.9, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
        </mesh>
        <mesh position={[0.9, 0.45, -0.6]} rotation={[0, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.9, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* 3. The Autonomous Vehicle / Probe Craft */}
      <group ref={craftRef} position={[0, 1.35, 0]}>
        {/* Main Aerodynamic Fuselage Pod */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[0.65, 2.8, 6]} />
          <meshStandardMaterial
            color="#111827"
            roughness={0.2}
            metalness={0.88}
          />
        </mesh>

        {/* Nose Cone Radome Sensor Tip */}
        <mesh position={[0, 1.45, 0]}>
          <coneGeometry args={[0.2, 0.4, 12]} />
          <meshStandardMaterial
            color="#030712"
            roughness={0.1}
            metalness={0.95}
          />
        </mesh>

        {/* Cockpit / Sensor Glass Glazing Band */}
        <mesh position={[0, 0.7, 0.28]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.42, 0.45, 0.1]} />
          <meshStandardMaterial
            color="#050814"
            emissive={primaryColor}
            emissiveIntensity={state === 'idle' ? 0.3 : 0.8}
            roughness={0.05}
            metalness={0.95}
          />
        </mesh>

        {/* Port & Starboard Solar Telemetry Wings */}
        <group position={[-0.6, 0, 0]} rotation={[0, 0, 0.15]}>
          <mesh position={[-0.75, 0, 0]} castShadow>
            <boxGeometry args={[1.3, 0.03, 0.6]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.15}
              metalness={0.9}
            />
          </mesh>
          {/* Wingtip Navigation Strobe */}
          <mesh ref={strobeRef} position={[-1.4, 0, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={primaryColor} />
          </mesh>
        </group>

        <group position={[0.6, 0, 0]} rotation={[0, 0, -0.15]}>
          <mesh position={[0.75, 0, 0]} castShadow>
            <boxGeometry args={[1.3, 0.03, 0.6]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.15}
              metalness={0.9}
            />
          </mesh>
          {/* Wingtip Green Strobe */}
          <mesh position={[1.4, 0, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>

        {/* Rear Ion Propulsion Emitter Bell */}
        <mesh
          ref={ionEngineRef}
          position={[0, -1.45, 0]}
          rotation={[Math.PI, 0, 0]}
        >
          <cylinderGeometry args={[0.4, 0.22, 0.3, 16, 1, true]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive={secondaryColor}
            emissiveIntensity={1.0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 4. Ground Servicing Umbilical Cable Boom */}
      {showDetail && (
        <group position={[-1.2, 0.3, 0.5]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.9, 8]} />
            <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0.3, 0.8, -0.1]} rotation={[0, 0, -0.7]}>
            <cylinderGeometry args={[0.025, 0.025, 0.7, 8]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Illumination */}
      <pointLight
        position={[0, 2.6, 0.6]}
        color={primaryColor}
        intensity={isSelected ? 3.0 : isFocused ? 2.2 : 0.8}
        distance={8}
        decay={2}
      />
    </group>
  );
};
