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
  const textGroupRef = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);

  const selectProject = useJourneyStore((s) => s.selectProject);
  const selectedProject = useJourneyStore((s) => s.selectedProject);
  const isSelected = selectedProject?.id === project.id;

  // Track dynamic proximity and preview visibility transitions
  const proximityRef = useRef(0);
  const previewOpacityRef = useRef(0);

  // Dynamic visual state evaluation
  const [currentState, setCurrentState] = useState<NodeVisualState>('idle');
  // Proximity-triggered lazy asset loading flag (avoids distant texture/asset downloads)
  const [hasBeenApproached, setHasBeenApproached] = useState(false);

  // Format index string (e.g. "01", "02")
  const indexStr = useMemo(() => `0${index + 1}`.slice(-2), [index]);

  useFrame((_, delta) => {
    const currentProgress = useJourneyStore.getState().currentProgress;
    const dist = Math.abs(currentProgress - t);

    // Deep fog culling: If traveler is far away (>22% track away), skip all CPU rotations & updates
    if (dist > 0.22 && !isSelected && !hovered) {
      if (currentState !== 'idle') setCurrentState('idle');
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

    // 3. Floating 3D Holographic Project Preview Panel (Revealed when focused)
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

    // 4. Emissive Highlight Scaling
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
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 1. Milled Dark Titanium Architectural Pedestal */}
      <group position={[0, -0.4, 0]}>
        {/* Tier 1: Lower Heavy Plinth */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2.0, 2.3, 0.35, 32]} />
          <meshStandardMaterial
            color="#07070b"
            roughness={0.25}
            metalness={0.92}
          />
        </mesh>

        {/* Tier 2: Recessed Hairline Optical Seam */}
        <mesh position={[0, 0.2, 0]}>
          <torusGeometry args={[1.8, 0.02, 16, 64]} />
          <meshBasicMaterial
            color={project.node_color_primary}
            transparent
            opacity={currentState === 'idle' ? 0.35 : 0.85}
          />
        </mesh>

        {/* Tier 3: Upper Platform */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[1.65, 1.75, 0.22, 32]} />
          <meshStandardMaterial
            color="#0d0d14"
            roughness={0.3}
            metalness={0.88}
          />
        </mesh>
      </group>

      {/* 2. Collimated Vertical Pencil Light Column */}
      <mesh ref={beaconRef} position={[0, 7, 0]}>
        <cylinderGeometry args={[0.03, 0.25, 14, 16]} />
        <meshBasicMaterial
          color={project.node_color_primary}
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Sculptural Quantum Polyhedron Artifact */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <group
          position={[0, 1.9, 0]}
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
          {/* Custom 3D Model or Procedural Quantum Polyhedron */}
          {project.node_style === 'custom_glb' && project.custom_model_url ? (
            <LazyGLBModel
              url={project.custom_model_url}
              primaryColor={project.node_color_primary}
              secondaryColor={project.node_color_secondary}
              hovered={hovered}
              isSelected={isSelected}
            />
          ) : (
            <>
              {/* Outer Faceted Obsidian Polyhedron */}
              <mesh ref={outerCoreRef}>
                <octahedronGeometry args={[hovered ? 1.2 : 1.05, 0]} />
                <meshStandardMaterial
                  color="#0a0f1d"
                  emissive={project.node_color_primary}
                  emissiveIntensity={0.5}
                  roughness={0.12}
                  metalness={0.92}
                  transparent
                  opacity={0.94}
                />
              </mesh>

              {/* Inner Precision Wireframe Lattice */}
              <mesh ref={innerCoreRef}>
                <icosahedronGeometry args={[0.7, 0]} />
                <meshBasicMaterial
                  color={project.node_color_secondary}
                  wireframe
                  transparent
                  opacity={0.6}
                />
              </mesh>
            </>
          )}

          {/* Precision Gimbal Ring */}
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.75, 0.015, 12, 64]} />
            <meshBasicMaterial
              color="#64748b"
              transparent
              opacity={0.4}
            />
          </mesh>

          {/* Featured Exhibit Orbital Gold/Accent Ring */}
          {project.featured && (
            <mesh rotation={[Math.PI / 4, 0, 0]}>
              <torusGeometry args={[2.0, 0.02, 16, 64]} />
              <meshBasicMaterial
                color={project.node_color_primary || '#f59e0b'}
                transparent
                opacity={hovered || isSelected ? 0.9 : 0.6}
              />
            </mesh>
          )}

          {/* Focal Light (Culled to 0 intensity when distant to eliminate forward-rendering light loops) */}
          <pointLight
            color={project.node_color_primary}
            intensity={
              hovered || isSelected
                ? 3.4
                : currentState !== 'idle'
                  ? (project.featured ? 2.2 : 1.4)
                  : 0
            }
            distance={8}
            decay={2}
          />

          {/* 4. Crisp In-World 3D Monospace Header */}
          <group ref={textGroupRef} position={[0, 2.1, 0]}>
            <Text
              position={[0, 0.52, 0]}
              fontSize={0.18}
              color={project.featured ? '#f59e0b' : project.node_color_primary}
              anchorX="center"
              anchorY="middle"
              font={JETBRAINS_MONO_FONT}
            >
              {`SPEC // ${indexStr} // ${project.featured ? '★ FEATURED // ' : ''}${project.year || '2026'} // ${project.category.replace('_', ' ').toUpperCase()}`}
            </Text>

            <Text
              position={[0, 0.16, 0]}
              fontSize={0.32}
              color="#f8fafc"
              anchorX="center"
              anchorY="middle"
              maxWidth={5.5}
              textAlign="center"
            >
              {project.title.toUpperCase()}
            </Text>
          </group>

          {/* 5. In-World Holographic Project Preview Display (Revealed when Focused) */}
          <group ref={previewGroupRef} position={[0, -0.4, 1.8]}>
            {/* Viewfinder Backing Screen */}
            <mesh position={[0, 0, -0.02]}>
              <planeGeometry args={[3.2, 1.8]} />
              <meshStandardMaterial
                color="#030306"
                roughness={0.2}
                metalness={0.9}
                transparent
                opacity={0.88}
              />
            </mesh>

            {/* Hairline Outer Frame */}
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[3.25, 1.85]} />
              <meshBasicMaterial
                color="#ffffff"
                wireframe
                transparent
                opacity={0.18}
              />
            </mesh>

            {/* High-Resolution Thumbnail Viewport (Lazy-Loaded upon Proximity) */}
            {(hasBeenApproached || currentState !== 'idle') && project.thumbnail_url && (
              <Image
                url={project.thumbnail_url}
                scale={[3.0, 1.6]}
                position={[0, 0, 0.02]}
                transparent
                opacity={0.85}
              />
            )}

            {/* Floating Telemetry Header Bar on Viewport */}
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

            {/* Interactive Engagement Button Prompt */}
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
                <planeGeometry args={[2.4, 0.32]} />
                <meshBasicMaterial color="#0b0b14" />
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
