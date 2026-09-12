import type { Project, NodeStyleType } from '@/types/project';

export type LandmarkVisualState = 'idle' | 'approaching' | 'focused' | 'selected';

export type LandmarkArchetype =
  | 'architectural_structure'
  | 'miniature_environment'
  | 'technical_installation'
  | 'vehicle_object'
  | 'data_monument'
  | 'studio_workspace';

export interface BaseLandmarkProps {
  project: Project;
  state: LandmarkVisualState;
  proximity: number; // 0 (far) to 1 (closest)
  isFocused: boolean;
  isSelected: boolean;
  hovered: boolean;
  primaryColor: string;
  secondaryColor: string;
}

/**
 * Resolves any NodeStyleType (including legacy values) to one of the 6 canonical 3D landmark archetypes.
 */
export function resolveLandmarkArchetype(style?: NodeStyleType | null, category?: string): LandmarkArchetype {
  switch (style) {
    case 'architectural_structure':
      return 'architectural_structure';
    case 'miniature_environment':
      return 'miniature_environment';
    case 'technical_installation':
      return 'technical_installation';
    case 'vehicle_object':
      return 'vehicle_object';
    case 'data_monument':
    case 'data_monolith':
      return 'data_monument';
    case 'studio_workspace':
      return 'studio_workspace';
    case 'cyber_terminal':
      return 'technical_installation';
    case 'hologram_pedestal':
      // Map based on project category for rich diversity
      if (category === 'ai_ml') return 'data_monument';
      if (category === 'systems_engine') return 'architectural_structure';
      if (category === 'game_dev') return 'miniature_environment';
      if (category === 'three_d_graphics') return 'technical_installation';
      return 'studio_workspace';
    default:
      if (category === 'ai_ml') return 'data_monument';
      if (category === 'systems_engine') return 'technical_installation';
      if (category === 'game_dev') return 'miniature_environment';
      if (category === 'three_d_graphics') return 'technical_installation';
      return 'architectural_structure';
  }
}
