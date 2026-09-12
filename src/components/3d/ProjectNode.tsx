import React from 'react';
import type { Project } from '@/types/project';
import * as THREE from 'three';
import { ProjectLandmark } from './landmarks/ProjectLandmark';

export type NodeVisualState = 'idle' | 'approaching' | 'focused' | 'hover' | 'selected';

export interface ProjectNodeProps {
  project: Project;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  index: number;
  t: number;
  rotationY?: number;
}

/**
 * ProjectNode:
 * Replaced generic geometric floating crystals with physical, visually meaningful
 * 3D architectural destinations (ProjectLandmark).
 *
 * Preserves backwards compatibility with the existing Scene graph while powering
 * the full 6-archetype ProjectLandmark system.
 */
export const ProjectNode: React.FC<ProjectNodeProps> = (props) => {
  return <ProjectLandmark {...props} />;
};

export { ProjectLandmark };
