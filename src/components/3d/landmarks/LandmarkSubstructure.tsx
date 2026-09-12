import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Image } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/types/project';
import type { LandmarkVisualState } from './LandmarkTypes';
import { JETBRAINS_MONO_FONT } from '@/constants/assets';

/**
 * Resilient error boundary to safeguard R3F from broken image assets
 */
class ThumbnailErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override render() {
    if (this.state.hasError) {
      return (
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[3.0, 1.6]} />
          <meshBasicMaterial color="#0c101c" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

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
  const beaconRef = useRef<THREE.Mesh>(null);
  const dossierRef = useRef<THREE.Group>(null);
  const dossierOpacityRef = useRef(0);

  const primaryColor = project.node_color_primary || '#38bdf8';
  const secondaryColor = project.node_color_secondary || '#0284c7';
  const indexStr = useMemo(() => `0${index + 1}`.slice(-2), [index]);

  useFrame((_, delta) => {
    // 1. Collimated Skyward Beacon (Visible from meaningful distance)
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        // Beacon is visible at distance (idle: 0.06), brightens on approach/focus/selected
        const targetOpacity = isSelected ? 0.28 : isFocused ? 0.20 : state === 'approaching' ? 0.12 : 0.05;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 3.5, delta);
      }
      const targetScale = isFocused ? 1.3 : 1.0;
      beaconRef.current.scale.set(targetScale, 1, targetScale);
    }

    // 2. Dossier Viewport Fade Transition
    const targetDossierOpacity = isFocused || isSelected ? 1.0 : state === 'approaching' ? 0.4 : 0.0;
    dossierOpacityRef.current = THREE.MathUtils.damp(
      dossierOpacityRef.current,
      targetDossierOpacity,
      4.0,
      delta
    );

    if (dossierRef.current) {
      dossierRef.current.visible = dossierOpacityRef.current > 0.02;
      const scale = 0.85 + dossierOpacityRef.current * 0.15;
      dossierRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* 1. Deep Sub-Terrain Footing (Extending down to planetary bedrock at y = -0.6) */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <cylinderGeometry args={[2.7, 3.2, 1.8, 24]} />
        <meshStandardMaterial
          color="#050810"
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>

      {/* 2. Terraced Cantilevered Approach Plaza (Multi-tier heavy slab) */}
      <group position={[0, -0.12, 0]}>
        {/* Foundation Deck Slabs */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.5, 2.7, 0.35, 32]} />
          <meshStandardMaterial
            color="#080b14"
            roughness={0.35}
            metalness={0.88}
          />
        </mesh>

        {/* Recessed Circumferential Light Seam */}
        <mesh position={[0, 0.19, 0]}>
          <torusGeometry args={[2.3, 0.02, 16, 64]} />
          <meshStandardMaterial
            color={primaryColor}
            emissive={primaryColor}
            emissiveIntensity={state === 'idle' ? 0.3 : 1.2}
            roughness={0.2}
          />
        </mesh>

        {/* Upper Finished Plaza Deck */}
        <mesh position={[0, 0.25, 0]} receiveShadow>
          <cylinderGeometry args={[2.2, 2.3, 0.16, 32]} />
          <meshStandardMaterial
            color="#0d111d"
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>

        {/* Observation Perimeter Guardrail (h = 0.72m scale cue) */}
        <mesh position={[0, 0.68, 0]}>
          <torusGeometry args={[2.22, 0.016, 8, 48, Math.PI * 1.5]} />
          <meshStandardMaterial
            color="#475569"
            roughness={0.25}
            metalness={0.9}
          />
        </mesh>
      </group>

      {/* 3. Collimated Skyward Pillar Beacon (Visible across entire canyon highway) */}
      <mesh ref={beaconRef} position={[0, 16, 0]}>
        <cylinderGeometry args={[0.08, 0.3, 32, 16]} />
        <meshBasicMaterial
          color={primaryColor}
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Interactive Landmark Visual Archetype Content */}
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

      {/* 5. Architectural Milestone Signage (Floating above installation) */}
      <group position={[0, 4.4, 0]}>
        <Text
          position={[0, 0.32, 0]}
          fontSize={0.13}
          color={primaryColor}
          anchorX="center"
          anchorY="middle"
          font={JETBRAINS_MONO_FONT}
        >
          {`[ DESTINATION // ${indexStr} ]`}
        </Text>
        <Text
          position={[0, 0.05, 0]}
          fontSize={0.26}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.2}
          textAlign="center"
        >
          {project.title.toUpperCase()}
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.11}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          font={JETBRAINS_MONO_FONT}
        >
          {`// ${project.category.toUpperCase()} • ${project.year || '2026'}`}
        </Text>
      </group>

      {/* 6. Cinematic Dossier Viewfinder & Engagement Plaque */}
      <group ref={dossierRef} position={[0, 0.8, 2.2]}>
        {/* Backing Frame */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[3.2, 1.8]} />
          <meshStandardMaterial
            color="#04060b"
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.94}
          />
        </mesh>

        {/* Viewfinder Outer Wire Border */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[3.25, 1.85]} />
          <meshBasicMaterial
            color={secondaryColor}
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>

        {/* Thumbnail Image Viewport */}
        {project.thumbnail_url && (
          <ThumbnailErrorBoundary>
            <Image
              url={project.thumbnail_url}
              scale={[3.0, 1.6]}
              position={[0, 0, 0.02]}
              transparent
              opacity={0.9}
            />
          </ThumbnailErrorBoundary>
        )}

        {/* Dossier Header */}
        <Text
          position={[0, 1.05, 0.05]}
          fontSize={0.12}
          color={project.featured ? '#fbbf24' : '#f8fafc'}
          anchorX="center"
          anchorY="middle"
          font={JETBRAINS_MONO_FONT}
        >
          {project.featured
            ? `[ ★ FEATURED LANDMARK // ${project.category.toUpperCase()} ]`
            : `[ PROJECT DOSSIER // ${project.category.toUpperCase()} ]`}
        </Text>

        {/* Interactive Selection Trigger Button */}
        <group
          position={[0, -1.05, 0.05]}
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
          <mesh>
            <planeGeometry args={[2.6, 0.36]} />
            <meshBasicMaterial color="#090d16" />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[2.64, 0.4]} />
            <meshBasicMaterial
              color={hovered ? primaryColor : '#334155'}
            />
          </mesh>
          <Text
            position={[0, 0, 0.02]}
            fontSize={0.12}
            color={hovered ? '#ffffff' : '#e2e8f0'}
            anchorX="center"
            anchorY="middle"
            font={JETBRAINS_MONO_FONT}
          >
            {hovered ? '[ EXPLORE PROJECT DOSSIER → ]' : '[ CLICK OR SPACE TO ENTER ]'}
          </Text>
        </group>
      </group>
    </group>
  );
};
