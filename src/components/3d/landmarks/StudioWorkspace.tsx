import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BaseLandmarkProps } from './LandmarkTypes';

/**
 * Studio / Workspace Landmark:
 * A precision digital laboratory workstation / architectural drafting bay.
 * Features heavy steel trestle bench legs, a planar drafting light-table,
 * an articulating overhead task lamp arm casting downlight, and modular telemetry rack equipment.
 */
export const StudioWorkspace: React.FC<BaseLandmarkProps> = ({
  state,
  proximity,
  isFocused,
  isSelected,
  primaryColor,
  secondaryColor,
}) => {
  const taskLightRef = useRef<THREE.PointLight>(null);
  const draftingSurfaceRef = useRef<THREE.Mesh>(null);
  const vuMeterRef = useRef<THREE.Group>(null);

  useFrame((stateObj, delta) => {
    // Task lamp intensity reacts to traveler focus
    if (taskLightRef.current) {
      const targetIntensity = isSelected ? 3.4 : isFocused ? 2.6 : state === 'approaching' ? 1.4 : 0.4;
      taskLightRef.current.intensity = THREE.MathUtils.damp(
        taskLightRef.current.intensity,
        targetIntensity,
        4.0,
        delta
      );
    }

    // Drafting table surface glow
    if (draftingSurfaceRef.current) {
      const mat = draftingSurfaceRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        const targetEmissive = isSelected ? 1.8 : isFocused ? 1.3 : state === 'approaching' ? 0.6 : 0.2;
        mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, targetEmissive, 3.5, delta);
      }
    }

    // VU meter level fluctuations
    if (vuMeterRef.current) {
      const bars = vuMeterRef.current.children;
      const t = stateObj.clock.elapsedTime;
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i] as THREE.Mesh;
        const scaleY = 0.3 + Math.abs(Math.sin(t * 3.5 + i * 1.2)) * 0.7;
        bar.scale.set(1, scaleY, 1);
      }
    }
  });

  const showDetail = state !== 'idle' || proximity > 0.2;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Heavy Warm Stone Floor Foundation */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.8, 0.24, 3.2]} />
        <meshStandardMaterial color="#8c8479" roughness={0.7} metalness={0.04} />
      </mesh>

      {/* 2. Steel Drafting Worktable (Heavy trestle frame) */}
      <group position={[0, 0.24, 0]}>
        {/* Table Top Slab (Warm composite slate) */}
        <mesh ref={draftingSurfaceRef} position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.08, 1.4]} />
          <meshStandardMaterial
            color="#2e2a26"
            emissive={primaryColor}
            emissiveIntensity={0.2}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>

        {/* Framing Bevel Trim */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[2.44, 0.06, 1.44]} />
          <meshStandardMaterial color="#3b3734" roughness={0.4} metalness={0.6} />
        </mesh>

        {/* Trestle Legs (Architectural charcoal bronze channels) */}
        {/* Left Leg A-Frame */}
        <mesh position={[-1.0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.1, 0.9, 1.2]} />
          <meshStandardMaterial color="#3b3734" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Right Leg A-Frame */}
        <mesh position={[1.0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.1, 0.9, 1.2]} />
          <meshStandardMaterial color="#3b3734" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Center Cross Stretcher */}
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 2.0, 8]} />
          <meshStandardMaterial color="#57534e" metalness={0.8} />
        </mesh>
      </group>

      {/* 3. Overhead Articulating Task Lamp Gantry */}
      <group position={[-1.0, 1.15, -0.6]}>
        {/* Mounting Base */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>

        {/* Lower Arm */}
        <mesh position={[0.2, 0.5, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>

        {/* Upper Arm Extending Over Table */}
        <mesh position={[0.6, 1.0, 0.2]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.9} />
        </mesh>

        {/* Lamp Hood Fixture */}
        <mesh position={[0.9, 1.1, 0.4]} rotation={[0, 0, 0.8]}>
          <coneGeometry args={[0.18, 0.22, 12, 1, true]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} side={THREE.DoubleSide} />
        </mesh>

        {/* Task Spotlight Casting Down on the Table */}
        <pointLight
          ref={taskLightRef}
          position={[0.9, 1.05, 0.4]}
          color={primaryColor}
          intensity={1.2}
          distance={6}
          decay={2}
        />
      </group>

      {/* 4. Modular Telemetry & Oscilloscope Rack Modules (Right side of bench) */}
      <group position={[0.75, 1.25, -0.2]}>
        {/* Module 1: Oscilloscope Display Box */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.35, 0.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.85} />
        </mesh>

        {/* Oscilloscope Screen Bezel */}
        <mesh position={[0, 0, 0.21]}>
          <planeGeometry args={[0.38, 0.24]} />
          <meshStandardMaterial
            color="#030712"
            emissive={secondaryColor}
            emissiveIntensity={state === 'idle' ? 0.4 : 1.2}
            roughness={0.1}
          />
        </mesh>

        {/* Module 2: VU Meter Stack */}
        <group ref={vuMeterRef} position={[0, -0.22, 0.18]}>
          <mesh position={[-0.12, 0, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.02]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[-0.04, 0, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.02]} />
            <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.04, 0, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.02]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
          </mesh>
          <mesh position={[0.12, 0, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.02]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </group>

      {/* 5. Precision Cable Bundles */}
      {showDetail && (
        <group>
          <mesh position={[0.9, 0.6, 0.2]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* Ambient Area Light */}
      <pointLight
        position={[0, 2.8, 0.4]}
        color={primaryColor}
        intensity={isSelected ? 3.0 : isFocused ? 2.2 : 0.8}
        distance={8}
        decay={2}
      />
    </group>
  );
};
