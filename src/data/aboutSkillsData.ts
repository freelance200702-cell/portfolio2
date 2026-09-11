import type { AboutProfile, EngineeringDiscipline } from '@/types/skills';

export const ABOUT_PROFILE: AboutProfile = {
  name: 'Adel R.',
  role: 'Systems, Graphics & AI Engineer',
  location: 'Global / Remote',
  status: 'Available for Mission-Critical Engineering & Systems Architecture',
  coreStatement:
    'Engineering high-throughput, latency-critical software at the intersection of low-level systems, GPU compute pipelines, and autonomous machine intelligence.',
  philosophy: [
    'Mechanical Sympathy: Designing algorithms that respect hardware cache lines, SIMD lanes, memory hierarchy, and branch predictors.',
    'Deterministic Reliability: Eliminating non-deterministic state anomalies through explicit ownership, lockstep clocks, and bounded buffers.',
    'Zero Fluff & Proven Execution: Demonstrating capability through working high-load systems, benchmarks, and production-tested architectures.',
    'Unified Abstractions: Bridging bare-metal performance with ergonomic, modern developer APIs across web and native runtimes.',
  ],
  whatIBuild: [
    {
      title: 'Real-Time Graphics & Simulation Engines',
      description:
        'Custom WebGPU/WebGL and Vulkan rendering pipelines, deferred lighting rigs, procedural geometry generators, and physics particle solvers.',
      metricsOrFocus: '60-144 FPS targets // Sub-16ms budget // Custom shaders',
    },
    {
      title: 'Distributed Machine Learning & Inference',
      description:
        'Low-latency model serving clusters, KV-cache quantization pipelines, custom tensor kernels, and autonomous agent orchestration graphs.',
      metricsOrFocus: 'Sub-30ms TTFT // CUDA & TensorRT // Vector search',
    },
    {
      title: 'Low-Latency Concurrent Systems',
      description:
        'Lock-free ring buffers, zero-copy network demultiplexers, custom memory pools, and multi-threaded event dispatchers in Rust and C++.',
      metricsOrFocus: 'Sub-millisecond p99 // Zero allocation hot paths',
    },
    {
      title: 'Next-Generation Fullstack Applications',
      description:
        'Rich spatial 3D web applications, reactive client state machines, real-time relational databases, and edge-native serverless backends.',
      metricsOrFocus: 'Zero layout shift // 100% type-safety // Supabase & React',
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
      'Games are the ultimate crucible for systems programming: every microsecond spent on garbage collection or cache misses manifests directly as dropped frames. I architect modular, data-oriented entity-component systems with predictable frame pacing.',
    productionPrinciples: [
      'Data-Oriented Design (DoD): Array-of-structures to Structure-of-arrays transformations for sequential cache pre-fetching.',
      'Hierarchical Spatial Indexing: Bounding Volume Hierarchies (BVH) and Octrees to accelerate frustum culling and collision checks from O(N²) to O(log N).',
      'Deterministic Gameplay Ticks: Decoupled fixed-rate physics update loops from variable display refresh interpolation.',
    ],
    architecturalPatterns: [
      'Entity-Component-System (ECS)',
      'Spatial Partitioning & Quadtrees',
      'Lockstep Client Prediction',
      'Hierarchical State Machines',
    ],
    coreToolchain: ['C++', 'Rust', 'Three.js / WebGL', 'GLSL Shaders', 'WebGPU', 'PhysX'],
    demonstratedProjectSlugs: ['vulkan-compute-engine', 'real-time-voxel-engine'],
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
      'Modern AI engineering demands more than consuming black-box REST APIs. I build high-throughput tensor inference pipelines, embedding vector caches, autonomous agent task graphs, and memory-efficient attention layers.',
    productionPrinciples: [
      'Quantized Acceleration: Utilizing FP16, INT8, and FP4 weight quantization to maximize memory bus throughput.',
      'Paged Attention & KV-Caching: Mitigating GPU memory fragmentation during long-context autoregressive token generation.',
      'Multi-Agent State Orchestration: Deterministic state machines governing LLM agent tool-calling, retry backoffs, and execution trees.',
    ],
    architecturalPatterns: [
      'FlashAttention Kernels',
      'Hierarchical Vector Retrieval',
      'Agentic Tool-Use Cycles',
      'Retrieval-Augmented Generation (RAG)',
    ],
    coreToolchain: ['Python', 'PyTorch', 'CUDA', 'TensorRT', 'LangChain / LangGraph', 'pgvector'],
    demonstratedProjectSlugs: ['autonomous-agent-orchestrator', 'distributed-neural-cache'],
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
      'Graphics programming is the art of mastering light physics and hardware parallelism. I craft physically based rendering (PBR) materials, custom vertex displacement shaders, and optimized compute passes that deliver cinematic fidelity at 60+ FPS.',
    productionPrinciples: [
      'PBR Light Transport: Accurate Cook-Torrance microfacet specular and Lambertian diffuse energy conservation.',
      'Procedural Synthesis: Real-time Catmull-Rom trajectory evaluation and analytical curve geometry extrusion without CPU re-allocations.',
      'Shader Micro-Optimizations: Avoiding divergent branch execution in fragment stages and utilizing half-precision floats where perceptual error is imperceptible.',
    ],
    architecturalPatterns: [
      'Deferred & Forward+ Lighting',
      'Temporal Anti-Aliasing (TAA)',
      'Screen Space Reflections (SSR)',
      'GPU Instanced Mesh Drawing',
    ],
    coreToolchain: ['WebGL 2.0', 'WebGPU (WGSL)', 'Three.js / R3F', 'GLSL', 'HLSL', 'DirectX 12'],
    demonstratedProjectSlugs: ['vulkan-compute-engine', 'quantum-spline-journey'],
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
      'From particle swarms to fluid dynamics, physical simulation requires stable numerical integration and massive parallelization. I develop deterministic solvers capable of tracking tens of thousands of interacting bodies in real-time.',
    productionPrinciples: [
      'Symplectic Numerical Integration: Velocity Verlet and Semi-Implicit Euler integration for strict energy conservation over long horizons.',
      'Spatial Hash Grids: 3D bucketed collision hashing providing constant-time neighbor query lookups for particle interactions.',
      'Compute Shader Parallelism: Offloading n-body gravity calculations and collision constraint impulses directly to GPU compute units.',
    ],
    architecturalPatterns: [
      'Position-Based Dynamics (PBD)',
      'Smoothed-Particle Hydrodynamics (SPH)',
      'Spatial Hash Grids',
      'Verlet Collision Solvers',
    ],
    coreToolchain: ['Compute Shaders (WGSL)', 'C++', 'Three.js Points', 'SIMD Intrinsic Ops'],
    demonstratedProjectSlugs: ['real-time-voxel-engine', 'quantum-spline-journey'],
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
      'True software scalability originates at the silicon boundary. I construct low-latency backends, zero-copy packet parsers, and lock-free data structures engineered to saturate memory bus bandwidth and exploit multi-core parallelism.',
    productionPrinciples: [
      'Cache Alignment & False-Sharing Prevention: Aligning atomic counters to 64-byte L1 cache-line boundaries.',
      'Zero-Allocation Critical Paths: Pre-allocated arena allocators, object pools, and ring buffers eliminating OS heap churn.',
      'Lock-Free Ring Buffers: Single-Producer Single-Consumer (SPSC) and MPMC circular queues using atomic acquire-release memory fences.',
    ],
    architecturalPatterns: [
      'Ring Buffer Concurrency',
      'Zero-Copy Serialization',
      'Arena Memory Allocators',
      'Asynchronous Event Demultiplexing',
    ],
    coreToolchain: ['Rust', 'C++20', 'Linux epoll / io_uring', 'POSIX Threads', 'Assembly / SIMD'],
    demonstratedProjectSlugs: ['distributed-neural-cache', 'vulkan-compute-engine'],
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
      'The web browser is the most ubiquitous execution environment in computing history. I build zero-runtime-overhead web applications that seamlessly blend high-framerate WebGL/Three.js viewports with reactive state engines and distributed edge databases.',
    productionPrinciples: [
      'Zero-Lag State Decoupling: Decoupling 60 FPS Three.js animation loops from React DOM tree reconciliation passes.',
      'Edge Relational Integrity: Row-Level Security, automated SQL schema migrations, and real-time WebSocket state replication via Supabase/PostgreSQL.',
      'Graceful Progressive Degradation: Dynamic GPU capability probing and fallback shaders ensuring seamless accessibility across device tiers.',
    ],
    architecturalPatterns: [
      'Client State Hydration',
      'Event-Driven Realtime Subscriptions',
      'Adaptive Quality Presets',
      'Edge-Cached Asset Distribution',
    ],
    coreToolchain: ['TypeScript', 'React', 'Zustand', 'Supabase / PostgreSQL', 'TailwindCSS', 'Vite'],
    demonstratedProjectSlugs: ['autonomous-agent-orchestrator', 'quantum-spline-journey'],
  },
];
