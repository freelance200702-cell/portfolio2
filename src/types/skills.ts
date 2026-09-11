export type DisciplineId =
  | 'game_dev'
  | 'ai_ml'
  | 'three_d_graphics'
  | 'simulation'
  | 'systems_engine'
  | 'web_edge';

export type VisArchetype =
  | 'bvh_tree'
  | 'neural_attention'
  | 'shader_crystal'
  | 'particle_swarm'
  | 'memory_lanes'
  | 'edge_mesh';

export interface EngineeringDiscipline {
  id: DisciplineId;
  title: string;
  tagline: string;
  code: string;
  category: string;
  color: string;
  secondaryColor: string;
  visArchetype: VisArchetype;
  
  // Architectural Core & Convictions
  thesis: string;
  productionPrinciples: string[];
  
  // Architectural Patterns & Algorithms
  architecturalPatterns: string[];
  
  // Primary Toolchain & Runtime Systems
  coreToolchain: string[];
  
  // Demonstrated Projects (matching database slugs)
  demonstratedProjectSlugs: string[];
}

export interface AboutProfile {
  name: string;
  role: string;
  location: string;
  status: string;
  coreStatement: string;
  philosophy: string[];
  whatIBuild: {
    title: string;
    description: string;
    metricsOrFocus: string;
  }[];
}
