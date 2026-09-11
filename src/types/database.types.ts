import type { ProjectCategory, NodeStyleType, ProjectStatus } from './project';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          tagline: string;
          description: string | null;
          description_markdown: string;
          category: ProjectCategory;
          node_style: NodeStyleType;
          custom_model_url: string | null;
          node_color_primary: string;
          node_color_secondary: string;
          thumbnail_url: string;
          hero_media: string | null;
          video_url: string | null;
          live_demo_url: string | null;
          github_repo_url: string | null;
          case_study_url: string | null;
          year: string | null;
          sort_order: number;
          featured: boolean;
          status: ProjectStatus;
          achievements: Json;
          technical_specs: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          subtitle?: string | null;
          tagline: string;
          description?: string | null;
          description_markdown: string;
          category: ProjectCategory;
          node_style?: NodeStyleType;
          custom_model_url?: string | null;
          node_color_primary?: string;
          node_color_secondary?: string;
          thumbnail_url: string;
          hero_media?: string | null;
          video_url?: string | null;
          live_demo_url?: string | null;
          github_repo_url?: string | null;
          case_study_url?: string | null;
          year?: string | null;
          sort_order?: number;
          featured?: boolean;
          status?: ProjectStatus;
          achievements?: Json;
          technical_specs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          subtitle?: string | null;
          tagline?: string;
          description?: string | null;
          description_markdown?: string;
          category?: ProjectCategory;
          node_style?: NodeStyleType;
          custom_model_url?: string | null;
          node_color_primary?: string;
          node_color_secondary?: string;
          thumbnail_url?: string;
          hero_media?: string | null;
          video_url?: string | null;
          live_demo_url?: string | null;
          github_repo_url?: string | null;
          case_study_url?: string | null;
          year?: string | null;
          sort_order?: number;
          featured?: boolean;
          status?: ProjectStatus;
          achievements?: Json;
          technical_specs?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      technologies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      project_technologies: {
        Row: {
          project_id: string;
          technology_id: string;
          sort_order: number;
        };
        Insert: {
          project_id: string;
          technology_id: string;
          sort_order?: number;
        };
        Update: {
          project_id?: string;
          technology_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_technologies_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_technologies_technology_id_fkey";
            columns: ["technology_id"];
            referencedRelation: "technologies";
            referencedColumns: ["id"];
          },
        ];
      };
      project_media: {
        Row: {
          id: string;
          project_id: string;
          type: 'image' | 'video';
          url: string;
          caption: string | null;
          sort_order: number;
          is_hero: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type?: 'image' | 'video';
          url: string;
          caption?: string | null;
          sort_order?: number;
          is_hero?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: 'image' | 'video';
          url?: string;
          caption?: string | null;
          sort_order?: number;
          is_hero?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      portfolio_settings: {
        Row: {
          id: string;
          bio_headline: string;
          bio_full_markdown: string | null;
          resume_url: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          contact_email: string | null;
          ambient_audio_url: string | null;
          environment_theme: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bio_headline: string;
          bio_full_markdown?: string | null;
          resume_url?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          contact_email?: string | null;
          ambient_audio_url?: string | null;
          environment_theme?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bio_headline?: string;
          bio_full_markdown?: string | null;
          resume_url?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          contact_email?: string | null;
          ambient_audio_url?: string | null;
          environment_theme?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      reorder_projects: {
        Args: {
          p_ordered_ids: string[];
        };
        Returns: void;
      };
    };
    Enums: {
      project_category: ProjectCategory;
      node_style_type: NodeStyleType;
      project_status: ProjectStatus;
      media_type: 'image' | 'video';
    };
    CompositeTypes: Record<string, never>;
  };
}
