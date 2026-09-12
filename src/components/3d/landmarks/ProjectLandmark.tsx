import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Project } from '@/types/project';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { LazyGLBModel } from '../LazyGLBModel';
import {
  type LandmarkVisualState,
  type BaseLandmarkProps,
  resolveLandmarkArchetype,
} from './LandmarkTypes';
import { LandmarkSubstructure } from './LandmarkSubstructure';
import { ArchitecturalStructure } from './ArchitecturalStructure';
import { MiniatureEnvironment } from './MiniatureEnvironment';
import { TechnicalInstallation } from './TechnicalInstallation';
import { VehicleObject } from './VehicleObject';
import { DataMonument } from './DataMonument';
import { StudioWorkspace } from './StudioWorkspace';

export interface ProjectLandmarkProps {
  project: Project;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  index: number;
  t: number;
  rotationY?: number;
}

/**
 * ProjectLandmark:
 * Transformed from a generic floating geometric crystal into a physical,
 * visually meaningful architectural landmark destination.
 *
 * Supported Visual Archetypes:
 * - Architectural Structure (Pavilion / Terrace / Cantilevered Visor)
 * - Miniature Environment (Contour Biome / Diorama / Crystal Outcrop)
 * - Technical Installation (Optics / Sensor Array / Gantry Rig)
 * - Vehicle / Object (Exploration Probe / Research Craft in Cradle)
 * - Data Monument (Obsidian Monolith / Neural Compute Stele)
 * - Studio / Workspace (Precision Laboratory / Drafting Bench)
 * - Custom GLB Model (Rendered within an architectural exhibition cradle)
 *
 * Four Visual Proximity States:
 * - idle: Distant silhouette recognition, ambient grounding, faint skyward beacon
 * - approaching: Progressive awakening, interior downlights, optic alignment, conduit pulses
 * - focused: Full progressive detail, interactive dossier viewport, milestone metadata
 * - selected: Focal locked state with accent illumination and camera lock
 */
export const ProjectLandmark: React.FC<ProjectLandmarkProps> = ({
  project,
  position,
  index,
  t,
  rotationY = 0,
}) => {
  const [hovered, setHovered] = useState(false);
  const [currentState, setCurrentState] = useState<LandmarkVisualState>('idle');
  const proximityRef = useRef(0);

  const selectProject = useJourneyStore((s) => s.selectProject);
  const selectedProject = useJourneyStore((s) => s.selectedProject);
  const isSelected = selectedProject?.id === project.id;

  const primaryColor = project.node_color_primary || '#38bdf8';
  const secondaryColor = project.node_color_secondary || '#0284c7';

  // Determine which archetype to display
  const archetype = resolveLandmarkArchetype(project.node_style, project.category);

  useFrame((_, delta) => {
    const currentProgress = useJourneyStore.getState().currentProgress;
    const dist = Math.abs(currentProgress - t);

    // Far-distance culling: If traveler is far away (>25% of track), stay in idle
    if (dist > 0.25 && !isSelected && !hovered) {
      if (currentState !== 'idle') setCurrentState('idle');
      return;
    }

    // Smooth proximity envelope (14% of track length)
    const targetProximity = Math.max(0, Math.min(1, 1 - dist / 0.14));
    proximityRef.current = THREE.MathUtils.damp(proximityRef.current, targetProximity, 4.0, delta);

    // State machine transitions
    let state: LandmarkVisualState = 'idle';
    if (isSelected) {
      state = 'selected';
    } else if (dist <= 0.05 || hovered) {
      state = 'focused';
    } else if (dist <= 0.14) {
      state = 'approaching';
    }

    if (state !== currentState) {
      setCurrentState(state);
    }
  });

  const isFocused = currentState === 'focused' || isSelected || hovered;

  const landmarkProps: BaseLandmarkProps = {
    project,
    state: currentState,
    proximity: proximityRef.current,
    isFocused,
    isSelected,
    hovered,
    primaryColor,
    secondaryColor,
  };

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <LandmarkSubstructure
        project={project}
        index={index}
        state={currentState}
        proximity={proximityRef.current}
        isFocused={isFocused}
        isSelected={isSelected}
        hovered={hovered}
        onSelect={() => selectProject(project)}
        onHover={setHovered}
      >
        {/* Custom 3D GLB Model in Exhibition Cradle */}
        {project.custom_model_url ? (
          <group position={[0, 1.4, 0]}>
            <LazyGLBModel
              url={project.custom_model_url}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              hovered={hovered}
              isSelected={isSelected}
            />
          </group>
        ) : (
          <>
            {/* Visual Archetype Dispatcher */}
            {archetype === 'architectural_structure' && (
              <ArchitecturalStructure {...landmarkProps} />
            )}
            {archetype === 'miniature_environment' && (
              <MiniatureEnvironment {...landmarkProps} />
            )}
            {archetype === 'technical_installation' && (
              <TechnicalInstallation {...landmarkProps} />
            )}
            {archetype === 'vehicle_object' && (
              <VehicleObject {...landmarkProps} />
            )}
            {archetype === 'data_monument' && (
              <DataMonument {...landmarkProps} />
            )}
            {archetype === 'studio_workspace' && (
              <StudioWorkspace {...landmarkProps} />
            )}
          </>
        )}
      </LandmarkSubstructure>
    </group>
  );
};
