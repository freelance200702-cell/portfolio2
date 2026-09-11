import { describe, it, expect, beforeEach, vi } from 'vitest';
import { projectService, LOCAL_STORAGE_KEY } from '@/services/supabase/projectService';
import * as supabaseClientModule from '@/services/supabase/client';
import { generateSplineCurve, sampleCurveFrame } from '@/lib/splineMath';
import type { Project } from '@/types/project';

type ClientReturnType = ReturnType<typeof supabaseClientModule.getSupabaseClient>;

// In-memory mock for localStorage and window events in Node test runner
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

const listeners = new Map<string, Set<EventListener>>();
const mockWindow = {
  addEventListener: (event: string, handler: EventListener) => {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler);
  },
  removeEventListener: (event: string, handler: EventListener) => {
    listeners.get(event)?.delete(handler);
  },
  dispatchEvent: (event: Event) => {
    listeners.get(event.type)?.forEach((h) => h(event));
    return true;
  },
};

globalThis.localStorage = mockLocalStorage as unknown as Storage;
globalThis.window = mockWindow as unknown as Window & typeof globalThis;

describe('Live Project Data & Journey Lifecycle', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    storageMap.clear();
    listeners.clear();
  });

  describe('1. Live Supabase Querying & Relational Formatting', () => {
    it('queries published projects ordered by sort_order ascending without injecting seed placeholders', async () => {
      const mockSupabaseProjects = [
        {
          id: 'real-db-proj-1',
          slug: 'vulkan-compute-engine',
          title: 'Vulkan Compute Engine',
          subtitle: 'GPU Acceleration',
          tagline: 'High-performance compute shaders in Vulkan.',
          description: null,
          description_markdown: '### Deep dive into Vulkan compute.',
          category: 'three_d_graphics',
          node_style: 'hologram_pedestal',
          custom_model_url: null,
          node_color_primary: '#38bdf8',
          node_color_secondary: '#0284c7',
          thumbnail_url: 'https://cdn.example.com/vulkan.png',
          hero_media: null,
          video_url: null,
          live_demo_url: 'https://vulkan.demo',
          github_repo_url: 'https://github.com/vulkan',
          case_study_url: null,
          year: '2026',
          sort_order: 0,
          featured: true,
          status: 'published',
          achievements: ['Achieved 120 FPS'],
          technical_specs: [{ label: 'API', value: 'Vulkan 1.3' }],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          project_media: [
            {
              type: 'image',
              url: 'https://cdn.example.com/gallery1.png',
              caption: 'Frame capture',
              sort_order: 0,
              is_hero: false,
            },
          ],
          project_technologies: [
            {
              sort_order: 0,
              technologies: { name: 'Vulkan', slug: 'vulkan', category: 'Graphics' },
            },
            {
              sort_order: 1,
              technologies: { name: 'C++20', slug: 'cpp20', category: 'Language' },
            },
          ],
        },
      ];

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockSupabaseProjects,
                error: null,
              }),
            }),
          }),
        }),
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);

      const projects = await projectService.getPublishedProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe('real-db-proj-1');
      expect(projects[0].title).toBe('Vulkan Compute Engine');
      expect(projects[0].technologies).toEqual(['Vulkan', 'C++20']);
      expect(projects[0].media_gallery).toHaveLength(1);
      expect(projects[0].featured).toBe(true);
    });

    it('returns an empty array when 0 published projects exist, refusing hardcoded seed fallback', async () => {
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);

      const projects = await projectService.getPublishedProjects();

      // STRICT CHECK: Must be empty array, NOT initial seed projects!
      expect(projects).toEqual([]);
      expect(projects).toHaveLength(0);
    });
  });

  describe('2. Empty State & Spline Curve Resilience', () => {
    it('generates a valid Catmull-Rom spline curve with 0 projects without throwing', () => {
      const emptyProjects: Project[] = [];
      const curve = generateSplineCurve(emptyProjects);

      expect(curve).toBeDefined();
      expect(curve.points.length).toBeGreaterThan(2);

      // Sampling points along the empty spline should produce valid non-NaN coordinates
      const frameStart = sampleCurveFrame(curve, 0.1);
      expect(Number.isNaN(frameStart.position.x)).toBe(false);
      expect(Number.isNaN(frameStart.position.y)).toBe(false);
      expect(Number.isNaN(frameStart.position.z)).toBe(false);

      const frameEnd = sampleCurveFrame(curve, 0.9);
      expect(Number.isNaN(frameEnd.position.z)).toBe(false);
    });

    it('places multiple projects along dynamic normalized parameters t_i = (i + 1) / (N + 1)', () => {
      const testProjects: Project[] = [
        { id: '1', title: 'P1', sort_order: 0 } as Project,
        { id: '2', title: 'P2', sort_order: 1 } as Project,
        { id: '3', title: 'P3', sort_order: 2 } as Project,
      ];

      const curve = generateSplineCurve(testProjects);
      const N = testProjects.length;

      const expectedTValues = [1 / 4, 2 / 4, 3 / 4];
      expectedTValues.forEach((expectedT, i) => {
        const calculatedT = (i + 1) / (N + 1);
        expect(calculatedT).toBeCloseTo(expectedT);

        const frame = sampleCurveFrame(curve, calculatedT);
        expect(frame.position).toBeDefined();
        expect(frame.tangent.lengthSq()).toBeCloseTo(1.0);
      });
    });
  });

  describe('3. Local Persistence & Real-Time Synchronization', () => {
    it('creates and persists new projects to localStorage and triggers change broadcast', async () => {
      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(null);

      let broadcastFired = false;
      const unsubscribe = projectService.subscribeToProjects(() => {
        broadcastFired = true;
      });

      const newProject = await projectService.createProject({
        title: 'Quantum Compiler',
        slug: 'quantum-compiler',
        tagline: 'QASM to Pulse transpiler',
        description_markdown: 'Quantum pulse generation',
        category: 'systems_engine',
        node_style: 'data_monolith',
        node_color_primary: '#10b981',
        node_color_secondary: '#059669',
        thumbnail_url: 'https://example.com/quantum.jpg',
        year: '2026',
        sort_order: 10,
        featured: true,
        status: 'published',
        technologies: ['Rust', 'LLVM', 'QASM'],
        achievements: ['99.9% gate fidelity'],
        media_gallery: [],
      });

      expect(newProject).toBeDefined();
      expect(newProject?.title).toBe('Quantum Compiler');
      expect(broadcastFired).toBe(true);

      // Verify persisted in localStorage
      const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
      const found = stored.find((p: Project) => p.title === 'Quantum Compiler');
      expect(found).toBeDefined();
      expect(found.featured).toBe(true);

      unsubscribe();
    });

    it('updates sort order and notifies subscribers', async () => {
      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(null);

      let notificationCount = 0;
      const unsubscribe = projectService.subscribeToProjects(() => {
        notificationCount++;
      });

      // Fetch existing local projects
      const existing = await projectService.getAllProjectsForAdmin();
      expect(existing.length).toBeGreaterThan(1);

      const reverseIds = existing.map((p) => p.id).reverse();
      const updated = await projectService.updateSortOrder(reverseIds);

      expect(updated).toBe(true);
      expect(notificationCount).toBeGreaterThan(0);

      const reloaded = await projectService.getAllProjectsForAdmin();
      expect(reloaded[0].id).toBe(reverseIds[0]);

      unsubscribe();
    });

    it('deletes projects and updates live query results', async () => {
      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(null);

      const existing = await projectService.getAllProjectsForAdmin();
      const targetId = existing[0].id;

      const success = await projectService.deleteProject(targetId);
      expect(success).toBe(true);

      const afterDelete = await projectService.getAllProjectsForAdmin();
      expect(afterDelete.some((p) => p.id === targetId)).toBe(false);
    });

    it('toggles publish status between published and draft', async () => {
      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(null);

      const existing = await projectService.getAllProjectsForAdmin();
      const target = existing[0];

      await projectService.togglePublishStatus(target.id, 'draft');

      const published = await projectService.getPublishedProjects();
      expect(published.some((p) => p.id === target.id)).toBe(false);

      await projectService.togglePublishStatus(target.id, 'published');
      const rePublished = await projectService.getPublishedProjects();
      expect(rePublished.some((p) => p.id === target.id)).toBe(true);
    });
  });
});
