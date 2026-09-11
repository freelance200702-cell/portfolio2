import { getSupabaseClient } from './client';
import type { Project, ProjectStatus } from '@/types/project';
import type { Database } from '@/types/database.types';

// Multi-project technical showcase demonstrating scalability
export const INITIAL_SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Aether Engine: Vulkan Path Tracer',
    slug: 'aether-engine',
    subtitle: 'Hardware-Accelerated Real-Time Ray Tracing',
    tagline: 'Hardware-accelerated real-time ray tracing engine written in modern C++20 and Vulkan.',
    description_markdown: `### Aether Engine Overview
A real-time path tracer built from scratch utilizing the Vulkan Ray Tracing API (VK_KHR_ray_tracing_pipeline). Designed for deterministic physical light simulation in interactive environments.

#### Key Architecture Highlights
- **Spatial Acceleration Structures**: Implements dynamic two-level BVH (Bottom-Level Acceleration Structure + Top-Level Acceleration Structure) with asynchronous GPU refitting for deformable animated meshes.
- **Wavefront Integrator**: Decouples ray generation, surface BSDF evaluation, and shadow ray casting into separate compute passes, maximizing SM occupancy and reducing thread divergence.
- **Denoising Pipeline**: Spatiotemporal Variance-Guided Filtering (SVGF) running directly in Vulkan compute shaders, achieving temporal accumulation across motion vectors with variance estimation.
- **Microfacet Models**: GGX/Trowbridge-Reitz microfacet distribution with Smith geometric shadowing and multiple importance sampling (MIS) for direct lighting.`,
    category: 'three_d_graphics',
    technologies: ['C++20', 'Vulkan', 'GLSL', 'CMake', 'Ray Tracing', 'SIMD'],
    live_demo_url: 'https://github.com',
    github_repo_url: 'https://github.com',
    case_study_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    media_gallery: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        caption: 'Full spectral path-traced caustics and multi-bounce diffuse global illumination',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
        caption: 'Two-level BVH spatial partitioning hierarchy visualization showing leaf clusters',
      },
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        caption: 'Real-time ray tracing walkthrough running at native 1440p',
      },
    ],
    achievements: [
      'Sustained 60 FPS at 1440p resolution on RTX 4080 desktop hardware with full dynamic lighting',
      'Zero-divergence Wavefront compute shader architecture yielding 34% higher SIMD utilization',
      'SVGF denoiser converging noisy 1-spp inputs into pristine real-time frames in under 2.8ms',
      'Zero-allocation memory manager wrapping VMA (Vulkan Memory Allocator) with RAII lifetimes',
    ],
    technical_specs: [
      { label: 'Graphics API', value: 'Vulkan 1.3 (VK_KHR_ray_tracing_pipeline)' },
      { label: 'Integrator', value: 'Wavefront Path Tracer (Decoupled Compute Passes)' },
      { label: 'Acceleration', value: 'TLAS/BLAS with SAH & Parallel GPU Refit' },
      { label: 'Denoising', value: 'Spatiotemporal Variance-Guided Filtering (SVGF)' },
      { label: 'Memory Model', value: 'Vulkan Memory Allocator (VMA) + Dedicated Staging' },
      { label: 'Language Standard', value: 'ISO C++20 (Concepts, Coroutines, Modules)' },
    ],
    node_style: 'hologram_pedestal',
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
    id: 'proj-2',
    title: 'SynapseNet: Distributed LLM Sharding',
    slug: 'synapsenet',
    subtitle: 'Tensor-Parallel Neural Cluster Inference',
    tagline: 'High-throughput tensor-parallel framework for distributed deep learning inference.',
    description_markdown: `### SynapseNet
High-performance inference engine delivering zero-copy model execution across heterogeneous GPU clusters with minimal communication latency.

#### Technical Achievements
- **Fused Kernel Fusion**: Custom CUDA kernels combining FlashAttention-2 with RMSNorm and SwiGLU activation layers.
- **Ring All-Reduce**: Custom peer-to-peer communication primitives over InfiniBand RDMA and NVIDIA NCCL.
- **Sub-millisecond TTFT**: Time-to-first-token reduced to 8.4ms through asynchronous KV-cache prefill and continuous batching.
- **Quantization Support**: Native FP8 (E4M3/E5M2) matrix multiplication kernels utilizing tensor cores.`,
    category: 'ai_ml',
    technologies: ['Rust', 'CUDA', 'PyTorch', 'NCCL', 'Triton', 'InfiniBand'],
    live_demo_url: null,
    github_repo_url: 'https://github.com',
    case_study_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    video_url: null,
    media_gallery: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
        caption: 'Distributed GPU memory topology and cross-node ring-reduce interconnects',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        caption: 'Token latency benchmarks showing linear scaling across 32 H100 SXM nodes',
      },
    ],
    achievements: [
      'Delivered 2,400 tokens/sec sustained throughput on 70B parameter models across 4x A100 nodes',
      'Cut inter-GPU communication overhead by 42% via custom ring all-reduce CUDA kernels',
      'Engineered continuous batching scheduler achieving 98.4% GPU tensor core saturation',
      'Engineered lock-free pinned host-to-device streaming buffer for multi-terabyte weights',
    ],
    technical_specs: [
      { label: 'Parallelism', value: 'Megatron-style Tensor Parallelism + Pipeline Sharding' },
      { label: 'Attention Mechanism', value: 'FlashAttention-2 Fused CUDA Kernels' },
      { label: 'Interconnect', value: 'NVIDIA NCCL 2.18 + RoCEv2 / InfiniBand RDMA' },
      { label: 'Quantization', value: 'FP8 Matrix Engine (E4M3/E5M2) + Int4 Weight Unpack' },
      { label: 'Host Runtime', value: 'Rust Engine with Tokio Actor Concurrency' },
    ],
    node_style: 'data_monolith',
    node_color_primary: '#f59e0b',
    node_color_secondary: '#d97706',
    year: '2025',
    sort_order: 1,
    featured: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    title: 'Chronos OS: Microkernel in Rust',
    slug: 'chronos-os',
    subtitle: 'Preemptive Capability-Based Operating System',
    tagline: 'Formally verified preemptive microkernel with capability-based security architecture.',
    description_markdown: `### Chronos Microkernel
A bare-metal x86_64 operating system designed for deterministic robotics and aerospace edge computing with provable isolation guarantees.

#### Systems Capabilities
- **Capability-Based Security**: Object-capability model where access to hardware resources, pages, and channels requires unforgeable cryptographic tokens.
- **Zero-Copy IPC**: Synchronous and asynchronous inter-process communication using grant/call semantics over memory remapping.
- **Deterministic Scheduler**: O(1) multi-priority priority ceiling scheduler immune to priority inversion.
- **Lock-Free Allocator**: Buddy allocation scheme guaranteeing non-fragmenting bounded-time heap allocations.`,
    category: 'systems_engine',
    technologies: ['Rust', 'x86_64 Assembly', 'QEMU', 'Linker Scripts', 'GDB'],
    live_demo_url: null,
    github_repo_url: 'https://github.com',
    case_study_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    video_url: null,
    media_gallery: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        caption: 'Kernel space vs user space capability boundary memory architecture diagram',
      },
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        caption: 'Chronos boot sequence and serial console driver executing in QEMU emulator',
      },
    ],
    achievements: [
      'Sub-microsecond roundtrip IPC latency (340 nanoseconds on modern AMD Zen 4 cores)',
      '100% memory safety and data-race freedom guaranteed at compile-time via Rust type system',
      'Microkernel core footprint under 180 Kilobytes of compiled machine instructions',
      'Deterministic bounded context-switch timing under 120 cycles',
    ],
    technical_specs: [
      { label: 'Architecture Target', value: 'x86_64 (Intel VT-x / AMD-V Ready)' },
      { label: 'Kernel Paradigm', value: 'L4-derivative Capability Microkernel' },
      { label: 'IPC Latency', value: '340ns Roundtrip (Fastpath Syscall Remap)' },
      { label: 'Virtual Memory', value: '4-Level 64-bit Paging (CR3 Management)' },
      { label: 'Security Model', value: 'Cryptographic Object-Capabilities (No Superuser)' },
    ],
    node_style: 'cyber_terminal',
    node_color_primary: '#10b981',
    node_color_secondary: '#059669',
    year: '2025',
    sort_order: 2,
    featured: true,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-4',
    title: 'VoxelWorld: Infinite Procedural Engine',
    slug: 'voxelworld',
    subtitle: 'GPU Dual-Contouring & Rollback Netcode',
    tagline: 'Custom voxel engine with compute-shader terrain generation and deterministic rollback netcode.',
    description_markdown: `### VoxelWorld Engine
A networked voxel sandbox handling millions of destructible voxels with real-time greedy meshing and seamless planet-scale streaming.

#### Architecture
- **Dual Contouring Extraction**: Sharp feature preservation on GPU compute shaders directly extracting isosurfaces from signed distance fields (SDFs).
- **Rollback Netcode**: Deterministic lockstep state machines with rollback prediction over WebRTC UDP data channels.
- **Sparse Voxel Octree (SVO)**: Level-of-detail hierarchy streaming 64km view distances while maintaining 16ms frame budgets.`,
    category: 'game_dev',
    technologies: ['C#', 'HLSL', 'Compute Shaders', 'WebRTC', 'Voxel Meshing', 'SIMD'],
    live_demo_url: 'https://github.com',
    github_repo_url: 'https://github.com',
    case_study_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    video_url: null,
    media_gallery: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Real-time procedural planetary terrain rendered via compute shader dual contouring',
      },
    ],
    achievements: [
      'Real-time extraction of 120 million voxel cells per second via GPU compute shaders',
      'Rollback netcode compensating up to 250ms of network jitter with 0 visible artifacts',
      'Greedy meshing algorithm reducing raw mesh triangle count by 78%',
    ],
    technical_specs: [
      { label: 'Extraction Method', value: 'GPU Dual Contouring from Hermite SDF Data' },
      { label: 'Spatial Indexing', value: 'Linear Sparse Voxel Octrees (SVO) with Morton Codes' },
      { label: 'Networking', value: 'Deterministic Rollback over WebRTC DataChannels' },
      { label: 'Target Frame Rate', value: '144 FPS locked at 1080p' },
    ],
    node_style: 'hologram_pedestal',
    node_color_primary: '#e2e8f0',
    node_color_secondary: '#94a3b8',
    year: '2024',
    sort_order: 3,
    featured: false,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-5',
    title: 'Hyperion: Distributed Time-Series Engine',
    slug: 'hyperion',
    subtitle: 'Log-Structured Append Storage Architecture',
    tagline: 'Log-structured append-only time series engine processing 12M events/sec.',
    description_markdown: `### Hyperion Engine
Ultra low-latency event broker designed for high-frequency financial telemetry and observability.

#### Systems Highlights
- **Zero-Copy I/O**: Direct kernel sendfile transitions and memory-mapped append logs bypassing userland copies.
- **Raft Consensus**: Multi-raft consensus engine partitioning metrics into independent Raft groups for linear write scalability.
- **Gorilla Compression**: Delta-of-delta timestamp encoding paired with XOR floating-point compression yielding an 85% reduction in disk storage.`,
    category: 'systems_engine',
    technologies: ['Go', 'TypeScript', 'gRPC', 'Protobuf', 'Raft', 'eBPF'],
    live_demo_url: 'https://github.com',
    github_repo_url: 'https://github.com',
    case_study_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    video_url: null,
    media_gallery: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-frequency telemetry pipeline architecture and LSM partition compaction tree',
      },
    ],
    achievements: [
      'Ingestion rate exceeding 12,000,000 metrics/second on a single 32-core bare-metal instance',
      'Compression ratio of 1.37 bytes per time-series sample (85% reduction over raw telemetry)',
      'Sub-millisecond query evaluation over 10-billion-row historical time ranges',
    ],
    technical_specs: [
      { label: 'Storage Engine', value: 'Log-Structured Merge Tree (LSM) + mmap Append Log' },
      { label: 'Compression', value: 'Gorilla Delta-of-Delta + XOR Float Packing' },
      { label: 'Consensus', value: 'Multi-Raft Protocol with Async Leader Election' },
      { label: 'Network Protocol', value: 'High-Throughput gRPC + Protobuf over HTTP/2' },
    ],
    node_style: 'data_monolith',
    node_color_primary: '#f97316',
    node_color_secondary: '#ea580c',
    year: '2024',
    sort_order: 4,
    featured: false,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-6',
    title: 'OpticMesh: WebGPU Neural Radiance Fields',
    slug: 'opticmesh',
    subtitle: 'In-Browser Real-Time Instant-NGP Renderer',
    tagline: 'Real-time neural radiance field volumetric rendering in the browser using WebGPU compute shaders.',
    description_markdown: `### OpticMesh NeRF
A production WebGPU implementation of multi-resolution hash encoding for instant volumetric reconstruction and photorealistic rendering.

#### Technical Highlights
- **WGSL Ray Marching**: Highly parallel ray marching through density fields in WebGPU compute shaders.
- **Tensor Core Simulation**: Half-precision floating point matrix evaluation simulated directly inside GPU shader invocations.
- **Zero Dependencies**: Pure WebGPU rendering pipeline running client-side without external backend compute nodes.`,
    category: 'three_d_graphics',
    technologies: ['WebGPU', 'WGSL', 'TypeScript', 'NeRF', 'Compute Shaders', 'Three.js'],
    live_demo_url: 'https://github.com',
    github_repo_url: 'https://github.com',
    case_study_url: null,
    thumbnail_url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80',
    video_url: null,
    media_gallery: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80',
        caption: 'Volumetric radiance field reconstruction displaying continuous novel viewpoints',
      },
    ],
    achievements: [
      '60 FPS sustained rendering at native 1080p directly in browser canvases without plugins',
      'Optimized multiresolution hash table query reducing compute shader cache misses by 63%',
      'Volumetric occupancy grid acceleration skipping 88% of empty space during ray marching',
    ],
    technical_specs: [
      { label: 'Graphics API', value: 'W3C WebGPU with WebGPU Shading Language (WGSL)' },
      { label: 'Volumetric Model', value: 'Instant-NGP Multi-Resolution Hash Encoding' },
      { label: 'Shader Architecture', value: 'Decoupled Raymarch Compute + Blit Render Pipeline' },
      { label: 'Target Frame Rate', value: '60 FPS at 1080p in Chromium / Firefox' },
    ],
    node_style: 'cyber_terminal',
    node_color_primary: '#38bdf8',
    node_color_secondary: '#0369a1',
    year: '2023',
    sort_order: 5,
    featured: true,
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
        console.error('Failed to fetch published projects from Supabase:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as unknown as RelationalProjectRow[]).map(formatRelationalProject);
    } catch (err) {
      console.error('Supabase fetch failed in getPublishedProjects:', err);
      throw err;
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
        console.error('Failed to fetch admin projects from Supabase:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      return (data as unknown as RelationalProjectRow[]).map(formatRelationalProject);
    } catch (err) {
      console.error('Failed to fetch admin projects from Supabase:', err);
      throw err;
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

      if (error || !data) return null;

      return formatRelationalProject(data as unknown as RelationalProjectRow);
    } catch (err) {
      console.error('Failed to fetch project by slug from Supabase:', err);
      return null;
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

      await Promise.all(updates);
      broadcastProjectChange();
      return true;
    } catch (err) {
      console.error('Failed to update project sort order:', err);
      return false;
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
      console.error('Failed to insert project into Supabase:', error);
      return null;
    }

    broadcastProjectChange();
    return data as unknown as Project;
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
      console.error('Failed to update project in Supabase:', error);
      return null;
    }

    broadcastProjectChange();
    return data as unknown as Project;
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

    const { error } = await client.from('projects').delete().eq('id', id);
    if (error) {
      console.error('Failed to delete project from Supabase:', error);
      return false;
    }

    broadcastProjectChange();
    return true;
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

    const { error } = await client
      .from('projects')
      .update({ status })
      .eq('id', id);

    if (!error) {
      broadcastProjectChange();
      return true;
    }
    return false;
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

    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data, error } = await client.storage
      .from('project-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error || !data) {
      console.error('Failed to upload asset to Supabase Storage:', error);
      return null;
    }

    const {
      data: { publicUrl },
    } = client.storage.from('project-media').getPublicUrl(fileName);

    return publicUrl;
  },
};
