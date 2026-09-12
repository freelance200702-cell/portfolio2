import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Image } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/types/project';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { LazyGLBModel } from './LazyGLBModel';
import { JETBRAINS_MONO_FONT } from '@/constants/assets';

export type NodeVisualState = 'idle' | 'approaching' | 'focused' | 'hover' | 'selected';

interface ProjectNodeProps {
  project: Project;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  index: number;
  t: number;
  rotationY?: number;
}

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

export const ProjectNode: React.FC<ProjectNodeProps> = ({
  project,
  position,
  index,
  t,
  rotationY = 0,
}) => {
  const outerCoreRef = useRef<THREE.Mesh>(null);
  const innerCoreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const previewGroupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const [hovered, setHovered] = useState(false);

  const selectProject = useJourneyStore((s) => s.selectProject);
  const selectedProject = useJourneyStore((s) => s.selectedProject);
  const isSelected = selectedProject?.id === project.id;

  // Track dynamic proximity and preview visibility transitions
  const proximityRef = useRef(0);
  const previewOpacityRef = useRef(0);

  // Dynamic visual state evaluation
  const [currentState, setCurrentState] = useState<NodeVisualState>('idle');
  const [hasBeenApproached, setHasBeenApproached] = useState(false);

  // Format index string (e.g. "01", "02")
  const indexStr = useMemo(() => `0${index + 1}`.slice(-2), [index]);

  useFrame((_, delta) => {
    const currentProgress = useJourneyStore.getState().currentProgress;
    const dist = Math.abs(currentProgress - t);

    // Deep fog culling: If traveler is far away (>22% track away), skip all CPU updates
    if (dist > 0.22 && !isSelected && !hovered) {
      if (currentState !== 'idle') setCurrentState('idle');
      if (lightRef.current && lightRef.current.intensity > 0) {
        lightRef.current.intensity = 0;
      }
      return;
    }

    // Trigger lazy loading of heavier textures/assets when camera enters proximity
    if (dist <= 0.15 && !hasBeenApproached) {
      setHasBeenApproached(true);
    }

    // Proximity envelope (12% of track length)
    const targetProximity = Math.max(0, Math.min(1, 1 - dist / 0.12));
    proximityRef.current = THREE.MathUtils.damp(proximityRef.current, targetProximity, 4.2, delta);
    const P = proximityRef.current;

    // Evaluate current state
    let state: NodeVisualState = 'idle';
    if (isSelected) {
      state = 'selected';
    } else if (hovered) {
      state = 'hover';
    } else if (dist <= 0.045) {
      state = 'focused';
    } else if (dist <= 0.12) {
      state = 'approaching';
    }

    if (state !== currentState) {
      setCurrentState(state);
    }

    const isFocused = state === 'focused' || state === 'hover' || state === 'selected';

    // 1. Quantum Artifact Spin Physics
    const baseSpeed = state === 'idle' ? 0.3 : state === 'approaching' ? 0.65 : 1.35;
    if (outerCoreRef.current) {
      outerCoreRef.current.rotation.y += delta * baseSpeed * 0.5;
      outerCoreRef.current.rotation.x += delta * baseSpeed * 0.25;
    }
    if (innerCoreRef.current) {
      innerCoreRef.current.rotation.y -= delta * baseSpeed * 0.75;
      innerCoreRef.current.rotation.z += delta * baseSpeed * 0.35;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * baseSpeed * 0.4;
    }

    // 2. Collimated Vertical Beacon
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        const targetOpacity = state === 'selected' ? 0.25 : isFocused ? 0.16 : state === 'approaching' ? 0.08 : 0.03;
        mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 3.5, delta);
      }
      const targetScale = isFocused ? 1.3 : 1.0;
      beaconRef.current.scale.set(targetScale, 1, targetScale);
    }

    // 3. Floating 3D Holographic Project Preview Panel
    const targetPreviewOpacity = isFocused ? 1.0 : 0.0;
    previewOpacityRef.current = THREE.MathUtils.damp(
      previewOpacityRef.current,
      targetPreviewOpacity,
      4.0,
      delta
    );

    if (previewGroupRef.current) {
      previewGroupRef.current.visible = previewOpacityRef.current > 0.01;
      const targetScale = 0.85 + previewOpacityRef.current * 0.15;
      previewGroupRef.current.scale.setScalar(targetScale);
    }

    // 4. Emissive Highlight & Point Light Scaling
    if (outerCoreRef.current) {
      const coreMat = outerCoreRef.current.material as THREE.MeshStandardMaterial;
      if (coreMat) {
        const targetEmissive = state === 'selected' ? 2.0 : isFocused ? 1.2 : 0.4 + P * 0.5;
        coreMat.emissiveIntensity = THREE.MathUtils.damp(
          coreMat.emissiveIntensity,
          targetEmissive,
          4.0,
          delta
        );
      }
    }

    if (lightRef.current) {
      const targetLightIntensity = isFocused ? 2.8 : state === 'approaching' ? 1.4 : 0.4;
      lightRef.current.intensity = THREE.MathUtils.damp(
        lightRef.current.intensity,
        targetLightIntensity,
        4.0,
        delta
      );
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 1. Structural Sub-Platform Foundation (Grounded down to planetary floor at y = -0.6) */}
      <mesh position={[0, -1.0, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.6, 1.8, 24]} />
        <meshStandardMaterial
          color="#06080e"
          roughness={0.5}
          metalness={0.82}
        />
      </mesh>

      {/* 2. Cantilevered Architectural Plinth Platform */}
      <group position={[0, -0.15, 0]}>
        {/* Tier 1: Heavy Base Deck */}
        <mesh position={[0, 0, 0]} receiveShadow castShadow>
          <cylinderGeometry args={[2.1, 2.3, 0.35, 32]} />
          <meshStandardMaterial
            color="#090c14"
            roughness={0.25}
            metalness={0.92}
          />
        </mesh>

        {/* Tier 2: Recessed Signature Optical Seam */}
        <mesh position={[0, 0.2, 0]}>
          <torusGeometry args={[1.9, 0.025, 16, 64]} />
          <meshBasicMaterial
            color={project.node_color_primary || '#38bdf8'}
            transparent
            opacity={currentState === 'idle' ? 0.4 : 0.9}
          />
        </mesh>

        {/* Tier 3: Upper Exhibit Plinth */}
        <mesh position={[0, 0.28, 0]} receiveShadow>
          <cylinderGeometry args={[1.7, 1.8, 0.22, 32]} />
          <meshStandardMaterial
            color="#0e121d"
            roughness={0.3}
            metalness={0.88}
          />
        </mesh>
      </group>

      {/* 3. Architectural Canopy Frame (Framing the exhibit) */}
      <group position={[0, 2.4, -0.6]}>
        {/* Rear Support Column */}
        <mesh position={[0, 0.2, -0.8]} castShadow>
          <boxGeometry args={[0.3, 3.4, 0.3]} />
          <meshStandardMaterial color="#0c101c" roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Overhead Cantilever Visor */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[2.6, 0.15, 1.8]} />
          <meshStandardMaterial color="#0c101c" roughness={0.3} metalness={0.9} />
        </mesh>
      </group>

      {/* 4. Collimated Skyward Beacon Shaft */}
      <mesh ref={beaconRef} position={[0, 14, 0]}>
        <cylinderGeometry args={[0.06, 0.25, 28, 16]} />
        <meshBasicMaterial
          color={project.node_color_primary || '#38bdf8'}
          transparent
          opacity={0.03}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 5. Soft Architectural Spotlight illuminating the exhibit */}
      <pointLight
        ref={lightRef}
        position={[0, 3.2, 0.5]}
        color={project.node_color_primary || '#38bdf8'}
        intensity={0.4}
        distance={9}
        decay={2}
      />

      {/* 6. Kinetic Exhibit Core (3D Model or Quantum Artifact) */}
      <Float
        speed={currentState === 'idle' ? 1.0 : 1.8}
        rotationIntensity={0.2}
        floatIntensity={0.35}
      >
        <group
          position={[0, 1.6, 0]}
          onClick={(e) => {
            e.stopPropagation();
            selectProject(project);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
        >
          {project.custom_model_url ? (
            <LazyGLBModel
              url={project.custom_model_url}
              primaryColor={project.node_color_primary}
              secondaryColor={project.node_color_secondary}
              hovered={hovered}
              isSelected={isSelected}
            />
          ) : (
            <group>
              {/* Outer Faceted Titanium Core */}
              <mesh ref={outerCoreRef} castShadow>
                <octahedronGeometry args={[hovered ? 1.15 : 1.0, 0]} />
                <meshStandardMaterial
                  color="#090d16"
                  emissive={project.node_color_primary || '#38bdf8'}
                  emissiveIntensity={0.6}
                  roughness={0.15}
                  metalness={0.92}
                  transparent
                  opacity={0.94}
                />
              </mesh>

              {/* Inner Optical Lattice */}
              <mesh ref={innerCoreRef}>
                <icosahedronGeometry args={[0.65, 0]} />
                <meshBasicMaterial
                  color={project.node_color_secondary || '#818cf8'}
                  wireframe
                  transparent
                  opacity={0.7}
                />
              </mesh>

              {/* Quantum Equatorial Ring */}
              <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[1.4, 0.02, 16, 48]} />
                <meshBasicMaterial
                  color={project.node_color_primary || '#38bdf8'}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            </group>
          )}

          {/* 7. Milestone Label Signage */}
          <group position={[0, 1.8, 0]}>
            <Text
              position={[0, 0.35, 0]}
              fontSize={0.13}
              color={project.node_color_primary || '#38bdf8'}
              anchorX="center"
              anchorY="middle"
              font={JETBRAINS_MONO_FONT}
            >
              {`[ MILESTONE // ${indexStr} ]`}
            </Text>
            <Text
              position={[0, 0.05, 0]}
              fontSize={0.28}
              color="#f8fafc"
              anchorX="center"
              anchorY="middle"
              maxWidth={5.0}
              textAlign="center"
            >
              {project.title.toUpperCase()}
            </Text>
          </group>

          {/* 8. Holographic Project Preview Display (Revealed when Focused) */}
          <group ref={previewGroupRef} position={[0, -0.4, 1.8]}>
            {/* Viewfinder Screen */}
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[3.2, 1.8]} />
              <meshStandardMaterial
                color="#04060b"
                roughness={0.2}
                metalness={0.9}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Viewfinder Outer Frame */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[3.25, 1.85]} />
              <meshBasicMaterial
                color="#ffffff"
                wireframe
                transparent
                opacity={0.18}
              />
            </mesh>

            {/* Thumbnail Viewport (Protected with Error Boundary) */}
            {(hasBeenApproached || currentState !== 'idle') && project.thumbnail_url && (
              <ThumbnailErrorBoundary>
                <Image
                  url={project.thumbnail_url}
                  scale={[3.0, 1.6]}
                  position={[0, 0, 0.02]}
                  transparent
                  opacity={0.88}
                />
              </ThumbnailErrorBoundary>
            )}

            {/* Telemetry Header */}
            <Text
              position={[0, 1.05, 0.05]}
              fontSize={0.13}
              color={project.featured ? '#fbbf24' : '#f8fafc'}
              anchorX="center"
              anchorY="middle"
              font={JETBRAINS_MONO_FONT}
            >
              {project.featured
                ? `[ ★ FEATURED DOSSIER // ${project.category.toUpperCase()} ]`
                : `[ DOSSIER PREVIEW // ${project.category.toUpperCase()} ]`}
            </Text>

            {/* Interactive Engagement Button */}
            <group
              position={[0, -1.05, 0.05]}
              onClick={(e) => {
                e.stopPropagation();
                selectProject(project);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
              }}
            >
              <mesh>
                <planeGeometry args={[2.5, 0.34]} />
                <meshBasicMaterial color="#090d16" />
              </mesh>
              <Text
                position={[0, 0, 0.02]}
                fontSize={0.12}
                color={hovered ? '#38bdf8' : '#e2e8f0'}
                anchorX="center"
                anchorY="middle"
                font={JETBRAINS_MONO_FONT}
              >
                {hovered ? '[ ENGAGE TECHNICAL DOSSIER → ]' : '[ CLICK OR SPACE TO ENTER ]'}
              </Text>
            </group>
          </group>
        </group>
      </Float>
    </group>
  );
};
