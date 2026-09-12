import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/types/project';
import type { LandmarkVisualState } from './LandmarkTypes';

interface LandmarkSubstructureProps {
  project: Project;
  index: number;
  state: LandmarkVisualState;
  proximity: number;
  isFocused: boolean;
  isSelected: boolean;
  hovered: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
  children: React.ReactNode;
}

/**
 * LandmarkSubstructure:
 * Anchors the landmark into the world terrain down to y = -0.6.
 * Provides the approach viewing plaza, collimated distant beacon,
 * architectural typography signs, perimeter balustrades, and interactive dossier viewfinder.
 */
export const LandmarkSubstructure: React.FC<LandmarkSubstructureProps> = ({
  project,
  index,
  state,
  proximity: _proximity,
  isFocused,
  isSelected,
  hovered,
  onSelect,
  onHover,
  children,
}) => {
  const plaqueRef = useRef<THREE.Group>(null);
  const plaqueOpacityRef = useRef(0);

  const primaryColor = project.node_color_primary || '#38bdf8';
  const indexStr = useMemo(() => `0${index + 1}`.slice(-2), [index]);

  useFrame((_, delta) => {
    // Plaque & Signage Smooth Proximity Fade
    const targetPlaqueOpacity = isFocused || isSelected ? 1.0 : state === 'approaching' ? 0.7 : 0.25;
    plaqueOpacityRef.current = THREE.MathUtils.damp(
      plaqueOpacityRef.current,
      targetPlaqueOpacity,
      4.0,
      delta
    );

    if (plaqueRef.current) {
      plaqueRef.current.position.y = THREE.MathUtils.damp(
        plaqueRef.current.position.y,
        hovered ? 0.42 : 0.38,
        5.0,
        delta
      );
    }
  });

  return (
    <group>
      {/* 1. Deep Sub-Terrain Footing (Massive architectural pylon anchored deep into bedrock) */}
      <mesh position={[0, -3.0, 0]} receiveShadow>
        <cylinderGeometry args={[2.7, 3.8, 6.0, 24]} />
        <meshStandardMaterial
          color="#0d1420"
          roughness={0.82}
          metalness={0.15}
        />
      </mesh>

      {/* 1b. Broad Stepped Bedrock Foundation Plinth (Visibly grounds pedestal to terrain) */}
      <mesh position={[0, -2.1, 0]} receiveShadow>
        <cylinderGeometry args={[3.8, 4.6, 0.6, 20]} />
        <meshStandardMaterial
          color="#111826"
          roughness={0.85}
          metalness={0.12}
        />
      </mesh>

      {/* 1c. Subtle Ground Footing Illumination Wash */}
      <pointLight
        position={[0, -0.5, 0]}
        color={primaryColor}
        intensity={state === 'idle' ? 0.4 : 0.9}
        distance={7.5}
        decay={2}
      />

      {/* 2. Terraced Architectural Exhibition Plaza Deck */}
      <group position={[0, -0.12, 0]}>
        {/* Foundation Deck Slabs */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.5, 2.7, 0.35, 32]} />
          <meshStandardMaterial
            color="#111724"
            roughness={0.8}
            metalness={0.15}
          />
        </mesh>

        {/* Recessed Circumferential Light Accent */}
        <mesh position={[0, 0.19, 0]}>
          <torusGeometry args={[2.3, 0.015, 16, 64]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={state === 'idle' ? 0.15 : 0.45}
            roughness={0.4}
          />
        </mesh>

        {/* Upper Finished Gallery Terrace Deck */}
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <cylinderGeometry args={[2.2, 2.3, 0.16, 32]} />
          <meshStandardMaterial
            color="#141c2c"
            roughness={0.75}
            metalness={0.15}
          />
        </mesh>

        {/* Observation Edge Chamfer Bead */}
        <mesh position={[0, 0.34, 0]}>
          <torusGeometry args={[2.22, 0.012, 8, 48, Math.PI * 1.5]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.5}
            metalness={0.4}
          />
        </mesh>
      </group>

      {/* 3. Interactive Landmark 3D Archetype Sculpture */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {children}
      </group>

      {/* 4. Elegant Architectural Exhibition Signage (Floating above installation with dignified typography) */}
      <group position={[0, 4.3, 0]}>
        <Text
          position={[0, 0.28, 0]}
          fontSize={0.12}
          color={primaryColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          {`${indexStr}  ·  EXHIBIT`}
        </Text>
        <Text
          position={[0, 0.02, 0]}
          fontSize={0.24}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          maxWidth={4.8}
          textAlign="center"
          letterSpacing={0.02}
        >
          {project.title}
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.11}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          {`${project.category.replace(/_/g, ' ')}  ·  ${project.year || '2026'}`}
        </Text>
      </group>

      {/* 5. Angled Exhibition Pedestal Plaque (Low-profile museum podium in front, preserving sightlines) */}
      <group
        ref={plaqueRef}
        position={[0, 0.38, 2.05]}
        rotation={[-Math.PI / 6, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          onHover(false);
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Plaque Base Pedestal */}
        <mesh position={[0, -0.15, -0.05]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.1]} />
          <meshStandardMaterial color="#0b1018" roughness={0.8} />
        </mesh>

        {/* Plaque Backplate */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.52, 0.03]} />
          <meshStandardMaterial
            color={hovered ? '#1a2336' : '#0e1422'}
            roughness={0.6}
            metalness={0.2}
          />
        </mesh>

        {/* Subtle Frame Highlight */}
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[1.66, 0.48]} />
          <meshBasicMaterial
            color={hovered ? primaryColor : '#1e293b'}
            wireframe
            transparent
            opacity={hovered ? 0.6 : 0.25}
          />
        </mesh>

        {/* Project Tagline on Plaque */}
        <Text
          position={[0, 0.08, 0.02]}
          fontSize={0.085}
          color="#f1f5f9"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.55}
          textAlign="center"
        >
          {project.tagline.length > 55 ? `${project.tagline.slice(0, 52)}...` : project.tagline}
        </Text>

        {/* Action Prompt */}
        <Text
          position={[0, -0.12, 0.02]}
          fontSize={0.075}
          color={hovered ? '#38bdf8' : '#64748b'}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {hovered ? 'View Project Details →' : 'Click to Inspect'}
        </Text>
      </group>
    </group>
  );
};
