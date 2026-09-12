export type ProjectCategory =
  | 'game_dev'
  | 'ai_ml'
  | 'systems_engine'
  | 'three_d_graphics'
  | 'web_fullstack';

export type NodeStyleType =
  | 'architectural_structure'
  | 'miniature_environment'
  | 'technical_installation'
  | 'vehicle_object'
  | 'data_monument'
  | 'studio_workspace'
  | 'hologram_pedestal'
  | 'cyber_terminal'
  | 'data_monolith'
  | 'custom_glb';

export type ProjectStatus = 'draft' | 'published' | 'archived';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  tagline: string;
  description?: string;
  description_markdown: string;
  category: ProjectCategory;
  technologies: string[];
  
  // Deliverables & Links
  live_demo_url?: string | null;
  github_repo_url?: string | null;
  case_study_url?: string | null;
  
  // Media & Video
  thumbnail_url: string;
  hero_media?: string | null;
  video_url?: string | null;
  media_gallery: MediaItem[];
  
  // 3D Node Presentation & Archetype
  node_style: NodeStyleType;
  custom_model_url?: string | null;
  node_color_primary: string;
  node_color_secondary: string;
  
  // Technical Specifications & Achievements
  achievements?: string[];
  technical_specs?: { label: string; value: string }[];

  // Metrics & Sequencing
  year?: string | number;
  sort_order: number;
  featured: boolean;
  status: ProjectStatus;
  
  created_at: string;
  updated_at: string;
}

export interface PortfolioSettings {
  id: string;
  bio_headline: string;
  bio_full_markdown?: string | null;
  resume_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  contact_email?: string | null;
  ambient_audio_url?: string | null;
  environment_theme: string;
  updated_at: string;
}
