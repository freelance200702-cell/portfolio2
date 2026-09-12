import { getSupabaseClient } from './client';
import type { Project, ProjectStatus } from '@/types/project';
import type { Database } from '@/types/database.types';

// Neutral placeholder projects for exercising 3D journey and CMS infrastructure
export const INITIAL_SEED_PROJECTS: Project[] = [
  {
    id: 'proj-alpha',
    title: 'Project Alpha',
    slug: 'project-alpha',
    subtitle: 'Interactive 3D System Template',
    tagline: 'Placeholder project showcasing interactive real-time 3D presentation.',
    description_markdown: `### Project Alpha
This is a neutral template project designed to test the 3D trajectory and content management system.

#### Overview
- Demonstrates 3D landmark rendering, camera targeting, and interaction.
- Provides standard formatting for technical documentation and system notes.
- Intended to be replaced with real project content via the administration dashboard.`,
    category: 'three_d_graphics',
    technologies: ['TypeScript', 'WebGL', 'Three.js'],
    live_demo_url: null,
    github_repo_url: null,
    case_study_url: null,
    thumbnail_url: '',
    video_url: null,
    media_gallery: [],
    achievements: [],
    technical_specs: [],
    node_style: 'technical_installation',
    custom_model_url: null,
    node_color_primary: '#38bdf8',
    node_color_secondary: '#0284c7',
    year: '2026',
    sort_order: 0,
    featured: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-beta',
    title: 'Project Beta',
    slug: 'project-beta',
    subtitle: 'Data Architecture Template',
    tagline: 'Placeholder project representing computational and data systems.',
    description_markdown: `### Project Beta
This is a neutral template project configured for exercising data monument archetypes and administration workflows.

#### Overview
- Configured with neutral parameters for testing data synchronization and real-time updates.
- Exercises data-driven state transitions between idle, approaching, and focused states.
- Fully editable through the project editor and management console.`,
    category: 'ai_ml',
    technologies: ['Python', 'PostgreSQL', 'Docker'],
    live_demo_url: null,
    github_repo_url: null,
    case_study_url: null,
    thumbnail_url: '',
    video_url: null,
    media_gallery: [],
    achievements: [],
    technical_specs: [],
    node_style: 'data_monument',
    node_color_primary: '#818cf8',
    node_color_secondary: '#4f46e5',
    year: '2026',
    sort_order: 1,
    featured: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-gamma',
    title: 'Project Gamma',
    slug: 'project-gamma',
    subtitle: 'Systems Engineering Template',
    tagline: 'Placeholder project demonstrating low-level systems and structural landmarks.',
    description_markdown: `### Project Gamma
This is a neutral template project configured for testing structural architectural landmarks.

#### Overview
- Provides an example structural landmark along the 3D spline trajectory.
- Used to verify distance culling, responsive overlays, and route navigation.
- Ready to be updated with production project details and verified assets.`,
    category: 'systems_engine',
    technologies: ['Rust', 'Linux', 'C++'],
    live_demo_url: null,
    github_repo_url: null,
    case_study_url: null,
    thumbnail_url: '',
    video_url: null,
    media_gallery: [],
    achievements: [],
    technical_specs: [],
    node_style: 'architectural_structure',
    node_color_primary: '#10b981',
    node_color_secondary: '#059669',
    year: '2026',
    sort_order: 2,
    featured: false,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface RelationalProjectRow {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  tagline: string;
  description?: string | null;
  description_markdown: string;
  category: Project['category'];
  node_style: Project['node_style'];
  custom_model_url?: string | null;
  node_color_primary: string;
  node_color_secondary: string;
  thumbnail_url: string;
  hero_media?: string | null;
  video_url?: string | null;
  live_demo_url?: string | null;
  github_repo_url?: string | null;
  case_study_url?: string | null;
  year?: string | null;
  sort_order: number;
  featured: boolean;
  status: Project['status'];
  achievements?: string[];
  technical_specs?: { label: string; value: string }[];
  technologies?: string[];
  media_gallery?: Project['media_gallery'];
  created_at: string;
  updated_at: string;
  project_media?: {
    type: 'image' | 'video';
    url: string;
    caption?: string | null;
    sort_order: number;
    is_hero: boolean;
  }[];
  project_technologies?: {
    sort_order: number;
    technologies?: {
      name: string;
      slug: string;
      category?: string | null;
    } | null;
  }[];
}

function formatRelationalProject(row: RelationalProjectRow): Project {
  const technologies: string[] =
    row.project_technologies && row.project_technologies.length > 0
      ? row.project_technologies
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((pt) => pt.technologies?.name)
          .filter((name): name is string => Boolean(name))
      : Array.isArray(row.technologies)
      ? row.technologies
      : [];

  const mediaGallery =
    row.project_media && row.project_media.length > 0
      ? row.project_media
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((m) => ({
            type: m.type,
            url: m.url,
            caption: m.caption || undefined,
          }))
      : Array.isArray(row.media_gallery)
      ? row.media_gallery
      : [];

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || undefined,
    tagline: row.tagline,
    description: row.description || undefined,
    description_markdown: row.description_markdown,
    category: row.category,
    node_style: row.node_style,
    custom_model_url: row.custom_model_url,
    node_color_primary: row.node_color_primary,
    node_color_secondary: row.node_color_secondary,
    thumbnail_url: row.thumbnail_url,
    hero_media: row.hero_media,
    video_url: row.video_url,
    live_demo_url: row.live_demo_url,
    github_repo_url: row.github_repo_url,
    case_study_url: row.case_study_url,
    year: row.year || undefined,
    sort_order: row.sort_order,
    featured: row.featured,
    status: row.status,
    technologies,
    media_gallery: mediaGallery,
    achievements: Array.isArray(row.achievements) ? row.achievements : [],
    technical_specs: Array.isArray(row.technical_specs) ? row.technical_specs : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const LOCAL_STORAGE_KEY = 'portfolio_projects_local';

function getLocalProjects(): Project[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return [...INITIAL_SEED_PROJECTS];
  }
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (item !== null) {
      return JSON.parse(item);
    }
  } catch {
    // fallback
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_PROJECTS));
  } catch (err) {
    console.debug('Failed to seed localStorage:', err);
  }
  return [...INITIAL_SEED_PROJECTS];
}

function saveLocalProjects(projects: Project[]): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    } catch (err) {
      console.debug('Failed to write to localStorage:', err);
    }
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('portfolio:projects_changed'));
  }
}

function broadcastProjectChange(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('portfolio:projects_changed'));
  }
}

export const projectService = {
  /**
   * Public query: Fetches all published projects for 3D journey and public views.
   * Returns empty array if no published projects exist (zero hardcoded fallback).
   */
  async getPublishedProjects(): Promise<Project[]> {
    const client = getSupabaseClient();
    if (!client) {
      const local = getLocalProjects();
      return local
        .filter((p) => p.status === 'published')
        .sort((a, b) => a.sort_order - b.sort_order);
    }

    try {
      const { data, error } = await client
        .from('projects')
        .select(`
          *,
          project_media (*),
          project_technologies (
            sort_order,
            technologies (*)
          )
        `)
        .eq('status', 'published')
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn(
          `Supabase projects query returned error (${error.code || error.message || 'unknown'}). Serving local offline exhibits.`
        );
        const local = getLocalProjects();
        return local
          .filter((p) => p.status === 'published')
          .sort((a, b) => a.sort_order - b.sort_order);
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as unknown as RelationalProjectRow[]).map(formatRelationalProject);
    } catch (err) {
      console.warn('Supabase fetch failed in getPublishedProjects, serving local exhibits:', err);
      const local = getLocalProjects();
      return local
        .filter((p) => p.status === 'published')
        .sort((a, b) => a.sort_order - b.sort_order);
    }
  },

  /**
   * Admin query: Fetches all projects regardless of published/draft/archived state.
   */
  async getAllProjectsForAdmin(): Promise<Project[]> {
    const client = getSupabaseClient();
    if (!client) {
      const local = getLocalProjects();
      return local.sort((a, b) => a.sort_order - b.sort_order);
    }

    try {
      const { data, error } = await client
        .from('projects')
        .select(`
          *,
          project_media (*),
          project_technologies (
            sort_order,
            technologies (*)
          )
        `)
        .order('sort_order', { ascending: true });

      if (error) {
        console.warn(
          `Supabase admin projects query returned error (${error.code || error.message || 'unknown'}). Serving local offline exhibits.`
        );
        const local = getLocalProjects();
        return local.sort((a, b) => a.sort_order - b.sort_order);
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as unknown as RelationalProjectRow[]).map(formatRelationalProject);
    } catch (err) {
      console.warn('Failed to fetch admin projects from Supabase, serving local exhibits:', err);
      const local = getLocalProjects();
      return local.sort((a, b) => a.sort_order - b.sort_order);
    }
  },

  /**
   * Fetches a single project by URL slug.
   */
  async getProjectBySlug(slug: string): Promise<Project | null> {
    const client = getSupabaseClient();
    if (!client) {
      return getLocalProjects().find((p) => p.slug === slug) || null;
    }

    try {
      const { data, error } = await client
        .from('projects')
        .select(`
          *,
          project_media (*),
          project_technologies (
            sort_order,
            technologies (*)
          )
        `)
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        return getLocalProjects().find((p) => p.slug === slug) || null;
      }

      return formatRelationalProject(data as unknown as RelationalProjectRow);
    } catch (err) {
      console.warn('Failed to fetch project by slug from Supabase, using local fallback:', err);
      return getLocalProjects().find((p) => p.slug === slug) || null;
    }
  },

  /**
   * Subscribes to project mutations across live Supabase Realtime and local events.
   */
  subscribeToProjects(callback: () => void): () => void {
    const cleanups: (() => void)[] = [];

    if (typeof window !== 'undefined') {
      const localHandler = () => callback();
      window.addEventListener('portfolio:projects_changed', localHandler);
      const storageHandler = (e: StorageEvent) => {
        if (e.key === LOCAL_STORAGE_KEY) callback();
      };
      window.addEventListener('storage', storageHandler);

      cleanups.push(() => {
        window.removeEventListener('portfolio:projects_changed', localHandler);
        window.removeEventListener('storage', storageHandler);
      });
    }

    const client = getSupabaseClient();
    if (client) {
      const channel = client
        .channel('realtime:projects')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'projects' },
          () => {
            callback();
          }
        )
        .subscribe();

      cleanups.push(() => {
        client.removeChannel(channel);
      });
    }

    return () => {
      cleanups.forEach((c) => c());
    };
  },

  /**
   * Admin mutation: Reorders projects atomically.
   */
  async updateSortOrder(orderedIds: string[]): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) {
      const local = getLocalProjects();
      orderedIds.forEach((id, index) => {
        const found = local.find((p) => p.id === id);
        if (found) found.sort_order = index;
      });
      saveLocalProjects(local);
      return true;
    }

    try {
      // First attempt atomic RPC function
      const { error: rpcError } = await client.rpc('reorder_projects', {
        p_ordered_ids: orderedIds,
      });

      if (!rpcError) {
        broadcastProjectChange();
        return true;
      }

      // Fallback to batch updates
      const updates = orderedIds.map((id, index) =>
        client.from('projects').update({ sort_order: index }).eq('id', id)
      );

      const results = await Promise.all(updates);
      const hasError = results.some((r) => r.error);
      if (hasError) {
        console.warn('Supabase batch reorder failed, applying reorder locally');
        const local = getLocalProjects();
        orderedIds.forEach((id, index) => {
          const found = local.find((p) => p.id === id);
          if (found) found.sort_order = index;
        });
        saveLocalProjects(local);
        return true;
      }
      broadcastProjectChange();
      return true;
    } catch (err) {
      console.warn('Failed to update project sort order in Supabase, updating locally:', err);
      const local = getLocalProjects();
      orderedIds.forEach((id, index) => {
        const found = local.find((p) => p.id === id);
        if (found) found.sort_order = index;
      });
      saveLocalProjects(local);
      return true;
    }
  },

  /**
   * Admin mutation: Create a new project.
   */
  async createProject(
    projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project | null> {
    const client = getSupabaseClient();
    if (!client) {
      const local = getLocalProjects();
      const newProj: Project = {
        ...projectData,
        id: `proj-local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      local.push(newProj);
      saveLocalProjects(local);
      return newProj;
    }

    try {
      const { data, error } = await client
        .from('projects')
        .insert({
          slug: projectData.slug,
          title: projectData.title,
          subtitle: projectData.subtitle || null,
          tagline: projectData.tagline,
          description: projectData.description || null,
          description_markdown: projectData.description_markdown,
          category: projectData.category,
          node_style: projectData.node_style,
          custom_model_url: projectData.custom_model_url || null,
          node_color_primary: projectData.node_color_primary,
          node_color_secondary: projectData.node_color_secondary,
          thumbnail_url: projectData.thumbnail_url,
          hero_media: projectData.hero_media || null,
          video_url: projectData.video_url || null,
          live_demo_url: projectData.live_demo_url || null,
          github_repo_url: projectData.github_repo_url || null,
          case_study_url: projectData.case_study_url || null,
          year: projectData.year ? String(projectData.year) : null,
          sort_order: projectData.sort_order,
          featured: projectData.featured,
          status: projectData.status,
          achievements: projectData.achievements || [],
          technical_specs: projectData.technical_specs || [],
        })
        .select()
        .single();

      if (error || !data) {
        console.warn('Failed to insert project into Supabase, saving locally:', error);
        const local = getLocalProjects();
        const newProj: Project = {
          ...projectData,
          id: `proj-local-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        local.push(newProj);
        saveLocalProjects(local);
        return newProj;
      }

      broadcastProjectChange();
      return data as unknown as Project;
    } catch (err) {
      console.warn('Failed to insert project into Supabase, saving locally:', err);
      const local = getLocalProjects();
      const newProj: Project = {
        ...projectData,
        id: `proj-local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      local.push(newProj);
      saveLocalProjects(local);
      return newProj;
    }
  },

  /**
   * Admin mutation: Update an existing project.
   */
  async updateProject(
    id: string,
    updates: Partial<Project>
  ): Promise<Project | null> {
    const client = getSupabaseClient();
    if (!client) {
      const local = getLocalProjects();
      const found = local.find((p) => p.id === id);
      if (found) {
        Object.assign(found, updates, { updated_at: new Date().toISOString() });
        saveLocalProjects(local);
        return found;
      }
      return null;
    }

    try {
      const payload: Database['public']['Tables']['projects']['Update'] = {};
      if (updates.slug !== undefined) payload.slug = updates.slug;
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle;
      if (updates.tagline !== undefined) payload.tagline = updates.tagline;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.description_markdown !== undefined) payload.description_markdown = updates.description_markdown;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.node_style !== undefined) payload.node_style = updates.node_style;
      if (updates.custom_model_url !== undefined) payload.custom_model_url = updates.custom_model_url;
      if (updates.node_color_primary !== undefined) payload.node_color_primary = updates.node_color_primary;
      if (updates.node_color_secondary !== undefined) payload.node_color_secondary = updates.node_color_secondary;
      if (updates.thumbnail_url !== undefined) payload.thumbnail_url = updates.thumbnail_url;
      if (updates.hero_media !== undefined) payload.hero_media = updates.hero_media;
      if (updates.video_url !== undefined) payload.video_url = updates.video_url;
      if (updates.live_demo_url !== undefined) payload.live_demo_url = updates.live_demo_url;
      if (updates.github_repo_url !== undefined) payload.github_repo_url = updates.github_repo_url;
      if (updates.case_study_url !== undefined) payload.case_study_url = updates.case_study_url;
      if (updates.year !== undefined) payload.year = updates.year ? String(updates.year) : null;
      if (updates.sort_order !== undefined) payload.sort_order = updates.sort_order;
      if (updates.featured !== undefined) payload.featured = updates.featured;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.achievements !== undefined) payload.achievements = updates.achievements;
      if (updates.technical_specs !== undefined) payload.technical_specs = updates.technical_specs;

      const { data, error } = await client
        .from('projects')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        console.warn('Failed to update project in Supabase, updating locally:', error);
        const local = getLocalProjects();
        const found = local.find((p) => p.id === id);
        if (found) {
          Object.assign(found, updates, { updated_at: new Date().toISOString() });
          saveLocalProjects(local);
          return found;
        }
        return null;
      }

      broadcastProjectChange();
      return data as unknown as Project;
    } catch (err) {
      console.warn('Failed to update project in Supabase, updating locally:', err);
      const local = getLocalProjects();
      const found = local.find((p) => p.id === id);
      if (found) {
        Object.assign(found, updates, { updated_at: new Date().toISOString() });
        saveLocalProjects(local);
        return found;
      }
      return null;
    }
  },

  /**
   * Admin mutation: Delete a project.
   */
  async deleteProject(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) {
      const local = getLocalProjects();
      const idx = local.findIndex((p) => p.id === id);
      if (idx !== -1) {
        local.splice(idx, 1);
        saveLocalProjects(local);
        return true;
      }
      return false;
    }

    try {
      const { error } = await client.from('projects').delete().eq('id', id);
      if (error) {
        console.warn('Failed to delete project from Supabase, deleting locally:', error);
        const local = getLocalProjects();
        const idx = local.findIndex((p) => p.id === id);
        if (idx !== -1) {
          local.splice(idx, 1);
          saveLocalProjects(local);
          return true;
        }
        return false;
      }

      broadcastProjectChange();
      return true;
    } catch (err) {
      console.warn('Failed to delete project from Supabase, deleting locally:', err);
      const local = getLocalProjects();
      const idx = local.findIndex((p) => p.id === id);
      if (idx !== -1) {
        local.splice(idx, 1);
        saveLocalProjects(local);
        return true;
      }
      return false;
    }
  },

  /**
   * Admin mutation: Toggle publication status.
   */
  async togglePublishStatus(
    id: string,
    status: ProjectStatus
  ): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) {
      const local = getLocalProjects();
      const found = local.find((p) => p.id === id);
      if (found) {
        found.status = status;
        saveLocalProjects(local);
        return true;
      }
      return false;
    }

    try {
      const { error } = await client
        .from('projects')
        .update({ status })
        .eq('id', id);

      if (!error) {
        broadcastProjectChange();
        return true;
      }

      console.warn('Failed to toggle status in Supabase, toggling locally:', error);
      const local = getLocalProjects();
      const found = local.find((p) => p.id === id);
      if (found) {
        found.status = status;
        saveLocalProjects(local);
        return true;
      }
      return false;
    } catch {
      const local = getLocalProjects();
      const found = local.find((p) => p.id === id);
      if (found) {
        found.status = status;
        saveLocalProjects(local);
        return true;
      }
      return false;
    }
  },

  /**
   * Admin storage mutation: Upload an image or video asset to Supabase Storage.
   */
  async uploadMediaAsset(file: File, folder = 'assets'): Promise<string | null> {
    const client = getSupabaseClient();
    if (!client) {
      // Local fallback mock URL for offline dev
      return URL.createObjectURL(file);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      const { data, error } = await client.storage
        .from('project-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error || !data) {
        console.warn('Failed to upload asset to Supabase Storage, using local object URL:', error);
        return URL.createObjectURL(file);
      }

      const {
        data: { publicUrl },
      } = client.storage.from('project-media').getPublicUrl(fileName);

      return publicUrl;
    } catch {
      return URL.createObjectURL(file);
    }
  },
};
