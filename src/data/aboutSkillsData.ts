import type { AboutProfile, EngineeringDiscipline } from '@/types/skills';

export const ABOUT_PROFILE: AboutProfile = {
  name: 'Adel R.',
  role: 'Systems, Graphics & Simulation Engineer',
  location: 'Interactive Simulation Environment',
  status: 'Portfolio Infrastructure Ready // Awaiting Project Exhibits',
  coreStatement:
    'Demonstrating real-time 3D spatial presentation, procedural world generation, and full-stack administration workflows.',
  philosophy: [
    'Deterministic Reliability: Modular state machines with predictable frame pacing and zero layout shifts.',
    'Mechanical Sympathy: Structuring rendering and computation to optimize GPU throughput and minimize pipeline stalls.',
    'Data-Driven Design: Decoupling presentation logic from content models to support real-time administrative publishing.',
    'Progressive Enhancement: Graceful degradation from rich 3D trajectories to accessible low-overhead views.',
  ],
  whatIBuild: [
    {
      title: 'Real-Time Graphics & Simulation',
      description:
        'Interactive 3D viewports, procedural curves, dynamic lighting, and spatial landmarks.',
      metricsOrFocus: '60 FPS target // Procedural world geometry // Three.js & WebGL',
    },
    {
      title: 'Systems & Architecture',
      description:
        'State management, resilient client-side caching, and data-driven component pipelines.',
      metricsOrFocus: 'Decoupled rendering // Type safety // Reactive stores',
    },
    {
      title: 'Interactive Web Applications',
      description:
        'Full-stack management dashboards, responsive modal presentations, and touch-optimized controls.',
      metricsOrFocus: 'Tailwind CSS // React & TypeScript // Resilient state',
    },
    {
      title: 'Data & Content Management',
      description:
        'Administrative CRUD operations, asset uploads, and database synchronization.',
      metricsOrFocus: 'Real-time updates // Data validation // Supabase integration',
    },
  ],
};

export const DISCIPLINES: EngineeringDiscipline[] = [
  {
    id: 'game_dev',
    title: 'Game Development',
    tagline: 'Entity-Component Architecture & Real-Time Simulation Loops',
    code: 'DISC // 01',
    category: 'Interactive Real-Time',
    color: '#38bdf8',
    secondaryColor: '#0284c7',
    visArchetype: 'bvh_tree',
    thesis:
      'Real-time simulation demands disciplined control over memory, frame timing, and state synchronization across complex interactive systems.',
    productionPrinciples: [
      'Data-Oriented Design (DoD): Structuring data arrays for sequential cache pre-fetching.',
      'Hierarchical Spatial Indexing: Partitioning space to accelerate frustum culling and interaction checks.',
      'Deterministic Update Loops: Decoupled fixed-rate update passes from variable display refresh rates.',
    ],
    architecturalPatterns: [
      'Entity-Component-System (ECS)',
      'Spatial Partitioning & Quadtrees',
      'Client State Interpolation',
      'Hierarchical State Machines',
    ],
    coreToolchain: ['C++', 'Rust', 'Three.js / WebGL', 'GLSL Shaders', 'WebGPU'],
    demonstratedProjectSlugs: ['project-alpha'],
  },
  {
    id: 'ai_ml',
    title: 'AI & Neural Systems',
    tagline: 'Distributed Model Inference & High-Performance Tensor Runtimes',
    code: 'DISC // 02',
    category: 'Machine Intelligence',
    color: '#818cf8',
    secondaryColor: '#4f46e5',
    visArchetype: 'neural_attention',
    thesis:
      'Production machine intelligence systems require robust data pipelines, scalable orchestration, and efficient execution runtimes.',
    productionPrinciples: [
      'Efficient Memory Management: Optimizing batching and memory allocation for low latency.',
      'Asynchronous Processing: Decoupling inference pipelines from user-facing event handlers.',
      'Reliable Orchestration: Structured state machines governing model evaluation and tool execution.',
    ],
    architecturalPatterns: [
      'Asynchronous Worker Queues',
      'Hierarchical Vector Retrieval',
      'Task Graph Orchestration',
      'Pipelined Data Processing',
    ],
    coreToolchain: ['Python', 'PyTorch', 'Docker', 'PostgreSQL', 'TypeScript'],
    demonstratedProjectSlugs: ['project-beta'],
  },
  {
    id: 'three_d_graphics',
    title: '3D Graphics & Shaders',
    tagline: 'Physically Based Shaders, Post-Processing & GPU Pipeline Design',
    code: 'DISC // 03',
    category: 'Hardware Acceleration',
    color: '#34d399',
    secondaryColor: '#059669',
    visArchetype: 'shader_crystal',
    thesis:
      'Graphics programming combines geometric math and hardware parallelism to present expressive, high-framerate visual destinations.',
    productionPrinciples: [
      'Physically Based Rendering: Energy-conserving materials, roughness workflows, and ambient occlusion.',
      'Procedural Synthesis: Analytical curve evaluation and dynamic mesh generation without CPU overhead.',
      'Shader Optimization: Streamlined shader stages to preserve strict frame budgets across device tiers.',
    ],
    architecturalPatterns: [
      'Forward & Deferred Lighting',
      'Procedural Trajectory Generation',
      'Instanced Geometry Rendering',
      'Atmospheric Perspective & Fog',
    ],
    coreToolchain: ['WebGL 2.0', 'WebGPU (WGSL)', 'Three.js', 'GLSL', 'TypeScript'],
    demonstratedProjectSlugs: ['project-alpha'],
  },
  {
    id: 'simulation',
    title: 'Simulation & Physics',
    tagline: 'Deterministic Particle Dynamics & Multi-Body Kinematics',
    code: 'DISC // 04',
    category: 'Computational Physics',
    color: '#f59e0b',
    secondaryColor: '#d97706',
    visArchetype: 'particle_swarm',
    thesis:
      'Physical simulation requires stable numerical integration and spatial indexing to simulate interacting particles and dynamic environments.',
    productionPrinciples: [
      'Numerical Integration: Explicit and semi-implicit integration algorithms for numerical stability.',
      'Spatial Hash Grids: Uniform grid hashing providing rapid neighbor queries.',
      'Parallel Solvers: Parallelized constraint resolution and vector math.',
    ],
    architecturalPatterns: [
      'Position-Based Dynamics (PBD)',
      'Spatial Hash Grids',
      'Verlet Integration Solvers',
      'State History Buffers',
    ],
    coreToolchain: ['Three.js Points', 'WebGL', 'TypeScript', 'Vector Math'],
    demonstratedProjectSlugs: ['project-gamma'],
  },
  {
    id: 'systems_engine',
    title: 'Systems Engineering',
    tagline: 'Memory Layouts, Zero-Copy IO & Bare-Metal Concurrency',
    code: 'DISC // 05',
    category: 'Low-Level Architecture',
    color: '#ec4899',
    secondaryColor: '#be185d',
    visArchetype: 'memory_lanes',
    thesis:
      'High-performance software systems prioritize predictable memory layout, efficient resource utilization, and structured concurrency.',
    productionPrinciples: [
      'Cache-Friendly Layouts: Contiguous memory layouts to minimize cache misses.',
      'Bounded Resource Utilization: Controlled allocations and reusable buffer pools.',
      'Concurrency Safety: Explicit data ownership and structured concurrency boundaries.',
    ],
    architecturalPatterns: [
      'Ring Buffer Channels',
      'Zero-Copy Buffers',
      'Memory Pools',
      'Event Dispatchers',
    ],
    coreToolchain: ['Rust', 'C++', 'Linux', 'Posix Interfaces'],
    demonstratedProjectSlugs: ['project-gamma'],
  },
  {
    id: 'web_edge',
    title: 'Web & Edge Systems',
    tagline: 'Reactive State Machines & Hybrid Canvas Cloud Architectures',
    code: 'DISC // 06',
    category: 'Distributed Fullstack',
    color: '#a855f7',
    secondaryColor: '#7e22ce',
    visArchetype: 'edge_mesh',
    thesis:
      'Web platforms enable rich spatial applications by connecting hardware-accelerated 3D viewports with real-time cloud data layers.',
    productionPrinciples: [
      'State Decoupling: Decoupling high-frequency 60 FPS animation loops from DOM rendering cycles.',
      'Resilient Persistence: Seamless synchronization between local storage fallbacks and remote cloud databases.',
      'Progressive Accessibility: Adaptive fallback views for reduced motion and low-power hardware.',
    ],
    architecturalPatterns: [
      'State Machine Architecture',
      'Optimistic Local Updates',
      'Adaptive Quality Presets',
      'Modular Component Trees',
    ],
    coreToolchain: ['TypeScript', 'React', 'Zustand', 'Supabase / PostgreSQL', 'TailwindCSS', 'Vite'],
    demonstratedProjectSlugs: ['project-beta'],
  },
];
