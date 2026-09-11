-- ==============================================================================
-- 3D DEVELOPER PORTFOLIO - SEED DATA MIGRATION
-- Migration: 20260911000003_seed_data.sql
-- Description: Seeds initial high-caliber technical projects, normalized technologies, and gallery media.
-- ==============================================================================

-- 1. SEED TECHNOLOGIES
INSERT INTO public.technologies (name, slug, category) VALUES
    ('C++20', 'cpp20', 'Languages'),
    ('Vulkan', 'vulkan', 'Graphics APIs'),
    ('GLSL', 'glsl', 'Shaders'),
    ('CMake', 'cmake', 'Build Systems'),
    ('Ray Tracing', 'ray-tracing', 'Graphics'),
    ('SIMD', 'simd', 'Systems'),
    ('Rust', 'rust', 'Languages'),
    ('CUDA', 'cuda', 'GPU Computing'),
    ('PyTorch', 'pytorch', 'AI/ML'),
    ('NCCL', 'nccl', 'Distributed Computing'),
    ('Triton', 'triton', 'Compilers'),
    ('InfiniBand', 'infiniband', 'Networking'),
    ('x86_64 Assembly', 'x86_64-assembly', 'Languages'),
    ('QEMU', 'qemu', 'Virtualization'),
    ('Linker Scripts', 'linker-scripts', 'Systems'),
    ('GDB', 'gdb', 'Debugging'),
    ('C#', 'csharp', 'Languages'),
    ('HLSL', 'hlsl', 'Shaders'),
    ('Compute Shaders', 'compute-shaders', 'Graphics'),
    ('WebRTC', 'webrtc', 'Networking'),
    ('Voxel Meshing', 'voxel-meshing', 'Algorithms'),
    ('Go', 'go', 'Languages'),
    ('TypeScript', 'typescript', 'Languages'),
    ('gRPC', 'grpc', 'Networking'),
    ('Protobuf', 'protobuf', 'Serialization'),
    ('Raft', 'raft', 'Consensus'),
    ('eBPF', 'ebpf', 'Kernel'),
    ('WebGPU', 'webgpu', 'Graphics APIs'),
    ('WGSL', 'wgsl', 'Shaders'),
    ('NeRF', 'nerf', 'AI/Graphics'),
    ('Three.js', 'threejs', 'Graphics')
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED PROJECTS
INSERT INTO public.projects (
    id,
    slug,
    title,
    subtitle,
    tagline,
    description_markdown,
    category,
    node_style,
    node_color_primary,
    node_color_secondary,
    thumbnail_url,
    video_url,
    live_demo_url,
    github_repo_url,
    year,
    sort_order,
    featured,
    status,
    achievements,
    technical_specs
) VALUES
(
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'aether-engine',
    'Aether Engine: Vulkan Path Tracer',
    'Hardware-Accelerated Real-Time Ray Tracing',
    'Hardware-accelerated real-time ray tracing engine written in modern C++20 and Vulkan.',
    E'### Aether Engine Overview\nA real-time path tracer built from scratch utilizing the Vulkan Ray Tracing API (VK_KHR_ray_tracing_pipeline). Designed for deterministic physical light simulation in interactive environments.\n\n#### Key Architecture Highlights\n- **Spatial Acceleration Structures**: Implements dynamic two-level BVH (Bottom-Level Acceleration Structure + Top-Level Acceleration Structure) with asynchronous GPU refitting for deformable animated meshes.\n- **Wavefront Integrator**: Decouples ray generation, surface BSDF evaluation, and shadow ray casting into separate compute passes, maximizing SM occupancy and reducing thread divergence.\n- **Denoising Pipeline**: Spatiotemporal Variance-Guided Filtering (SVGF) running directly in Vulkan compute shaders, achieving temporal accumulation across motion vectors with variance estimation.\n- **Microfacet Models**: GGX/Trowbridge-Reitz microfacet distribution with Smith geometric shadowing and multiple importance sampling (MIS) for direct lighting.',
    'three_d_graphics',
    'hologram_pedestal',
    '#38bdf8',
    '#0284c7',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://github.com',
    'https://github.com',
    '2026',
    0,
    TRUE,
    'published',
    '[
        "Sustained 60 FPS at 1440p resolution on RTX 4080 desktop hardware with full dynamic lighting",
        "Zero-divergence Wavefront compute shader architecture yielding 34% higher SIMD utilization",
        "SVGF denoiser converging noisy 1-spp inputs into pristine real-time frames in under 2.8ms",
        "Zero-allocation memory manager wrapping VMA (Vulkan Memory Allocator) with RAII lifetimes"
    ]'::jsonb,
    '[
        {"label": "Graphics API", "value": "Vulkan 1.3 (VK_KHR_ray_tracing_pipeline)"},
        {"label": "Integrator", "value": "Wavefront Path Tracer (Decoupled Compute Passes)"},
        {"label": "Acceleration", "value": "TLAS/BLAS with SAH & Parallel GPU Refit"},
        {"label": "Denoising", "value": "Spatiotemporal Variance-Guided Filtering (SVGF)"},
        {"label": "Memory Model", "value": "Vulkan Memory Allocator (VMA) + Dedicated Staging"},
        {"label": "Language Standard", "value": "ISO C++20 (Concepts, Coroutines, Modules)"}
    ]'::jsonb
),
(
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'synapsenet',
    'SynapseNet: Distributed LLM Sharding',
    'Tensor-Parallel Neural Cluster Inference',
    'High-throughput tensor-parallel framework for distributed deep learning inference.',
    E'### SynapseNet\nHigh-performance inference engine delivering zero-copy model execution across heterogeneous GPU clusters with minimal communication latency.\n\n#### Technical Achievements\n- **Fused Kernel Fusion**: Custom CUDA kernels combining FlashAttention-2 with RMSNorm and SwiGLU activation layers.\n- **Ring All-Reduce**: Custom peer-to-peer communication primitives over InfiniBand RDMA and NVIDIA NCCL.\n- **Sub-millisecond TTFT**: Time-to-first-token reduced to 8.4ms through asynchronous KV-cache prefill and continuous batching.\n- **Quantization Support**: Native FP8 (E4M3/E5M2) matrix multiplication kernels utilizing tensor cores.',
    'ai_ml',
    'data_monolith',
    '#f59e0b',
    '#d97706',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    NULL,
    NULL,
    'https://github.com',
    '2025',
    1,
    TRUE,
    'published',
    '[
        "Delivered 2,400 tokens/sec sustained throughput on 70B parameter models across 4x A100 nodes",
        "Cut inter-GPU communication overhead by 42% via custom ring all-reduce CUDA kernels",
        "Engineered continuous batching scheduler achieving 98.4% GPU tensor core saturation",
        "Engineered lock-free pinned host-to-device streaming buffer for multi-terabyte weights"
    ]'::jsonb,
    '[
        {"label": "Parallelism", "value": "Megatron-style Tensor Parallelism + Pipeline Sharding"},
        {"label": "Attention Mechanism", "value": "FlashAttention-2 Fused CUDA Kernels"},
        {"label": "Interconnect", "value": "NVIDIA NCCL 2.18 + RoCEv2 / InfiniBand RDMA"},
        {"label": "Quantization", "value": "FP8 Matrix Engine (E4M3/E5M2) + Int4 Weight Unpack"},
        {"label": "Host Runtime", "value": "Rust Engine with Tokio Actor Concurrency"}
    ]'::jsonb
),
(
    'a1000000-0000-0000-0000-000000000003'::uuid,
    'chronos-os',
    'Chronos OS: Microkernel in Rust',
    'Preemptive Capability-Based Operating System',
    'Formally verified preemptive microkernel with capability-based security architecture.',
    E'### Chronos Microkernel\nA bare-metal x86_64 operating system designed for deterministic robotics and aerospace edge computing with provable isolation guarantees.\n\n#### Systems Capabilities\n- **Capability-Based Security**: Object-capability model where access to hardware resources, pages, and channels requires unforgeable cryptographic tokens.\n- **Zero-Copy IPC**: Synchronous and asynchronous inter-process communication using grant/call semantics over memory remapping.\n- **Deterministic Scheduler**: O(1) multi-priority priority ceiling scheduler immune to priority inversion.\n- **Lock-Free Allocator**: Buddy allocation scheme guaranteeing non-fragmenting bounded-time heap allocations.',
    'systems_engine',
    'cyber_terminal',
    '#10b981',
    '#059669',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    NULL,
    NULL,
    'https://github.com',
    '2025',
    2,
    TRUE,
    'published',
    '[
        "Sub-microsecond roundtrip IPC latency (340 nanoseconds on modern AMD Zen 4 cores)",
        "100% memory safety and data-race freedom guaranteed at compile-time via Rust type system",
        "Microkernel core footprint under 180 Kilobytes of compiled machine instructions",
        "Deterministic bounded context-switch timing under 120 cycles"
    ]'::jsonb,
    '[
        {"label": "Architecture Target", "value": "x86_64 (Intel VT-x / AMD-V Ready)"},
        {"label": "Kernel Paradigm", "value": "L4-derivative Capability Microkernel"},
        {"label": "IPC Latency", "value": "340ns Roundtrip (Fastpath Syscall Remap)"},
        {"label": "Virtual Memory", "value": "4-Level 64-bit Paging (CR3 Management)"},
        {"label": "Security Model", "value": "Cryptographic Object-Capabilities (No Superuser)"}
    ]'::jsonb
),
(
    'a1000000-0000-0000-0000-000000000004'::uuid,
    'voxelworld',
    'VoxelWorld: Infinite Procedural Engine',
    'GPU Dual-Contouring & Rollback Netcode',
    'Custom voxel engine with compute-shader terrain generation and deterministic rollback netcode.',
    E'### VoxelWorld Engine\nA networked voxel sandbox handling millions of destructible voxels with real-time greedy meshing and seamless planet-scale streaming.\n\n#### Architecture\n- **Dual Contouring Extraction**: Sharp feature preservation on GPU compute shaders directly extracting isosurfaces from signed distance fields (SDFs).\n- **Rollback Netcode**: Deterministic lockstep state machines with rollback prediction over WebRTC UDP data channels.\n- **Sparse Voxel Octree (SVO)**: Level-of-detail hierarchy streaming 64km view distances while maintaining 16ms frame budgets.',
    'game_dev',
    'hologram_pedestal',
    '#e2e8f0',
    '#94a3b8',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    NULL,
    'https://github.com',
    'https://github.com',
    '2024',
    3,
    FALSE,
    'published',
    '[
        "Real-time extraction of 120 million voxel cells per second via GPU compute shaders",
        "Rollback netcode compensating up to 250ms of network jitter with 0 visible artifacts",
        "Greedy meshing algorithm reducing raw mesh triangle count by 78%"
    ]'::jsonb,
    '[
        {"label": "Extraction Method", "value": "GPU Dual Contouring from Hermite SDF Data"},
        {"label": "Spatial Indexing", "value": "Linear Sparse Voxel Octrees (SVO) with Morton Codes"},
        {"label": "Networking", "value": "Deterministic Rollback over WebRTC DataChannels"},
        {"label": "Target Frame Rate", "value": "144 FPS locked at 1080p"}
    ]'::jsonb
),
(
    'a1000000-0000-0000-0000-000000000005'::uuid,
    'hyperion',
    'Hyperion: Distributed Time-Series Engine',
    'Log-Structured Append Storage Architecture',
    'Log-structured append-only time series engine processing 12M events/sec.',
    E'### Hyperion Engine\nUltra low-latency event broker designed for high-frequency financial telemetry and observability.\n\n#### Systems Highlights\n- **Zero-Copy I/O**: Direct kernel sendfile transitions and memory-mapped append logs bypassing userland copies.\n- **Raft Consensus**: Multi-raft consensus engine partitioning metrics into independent Raft groups for linear write scalability.\n- **Gorilla Compression**: Delta-of-delta timestamp encoding paired with XOR floating-point compression yielding an 85% reduction in disk storage.',
    'systems_engine',
    'data_monolith',
    '#f97316',
    '#ea580c',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    NULL,
    'https://github.com',
    'https://github.com',
    '2024',
    4,
    FALSE,
    'published',
    '[
        "Ingestion rate exceeding 12,000,000 metrics/second on a single 32-core bare-metal instance",
        "Compression ratio of 1.37 bytes per time-series sample (85% reduction over raw telemetry)",
        "Sub-millisecond query evaluation over 10-billion-row historical time ranges"
    ]'::jsonb,
    '[
        {"label": "Storage Engine", "value": "Log-Structured Merge Tree (LSM) + mmap Append Log"},
        {"label": "Compression", "value": "Gorilla Delta-of-Delta + XOR Float Packing"},
        {"label": "Consensus", "value": "Multi-Raft Protocol with Async Leader Election"},
        {"label": "Network Protocol", "value": "High-Throughput gRPC + Protobuf over HTTP/2"}
    ]'::jsonb
),
(
    'a1000000-0000-0000-0000-000000000006'::uuid,
    'opticmesh',
    'OpticMesh: WebGPU Neural Radiance Fields',
    'In-Browser Real-Time Instant-NGP Renderer',
    'Real-time neural radiance field volumetric rendering in the browser using WebGPU compute shaders.',
    E'### OpticMesh NeRF\nA production WebGPU implementation of multi-resolution hash encoding for instant volumetric reconstruction and photorealistic rendering.\n\n#### Technical Highlights\n- **WGSL Ray Marching**: Highly parallel ray marching through density fields in WebGPU compute shaders.\n- **Tensor Core Simulation**: Half-precision floating point matrix evaluation simulated directly inside GPU shader invocations.\n- **Zero Dependencies**: Pure WebGPU rendering pipeline running client-side without external backend compute nodes.',
    'three_d_graphics',
    'cyber_terminal',
    '#38bdf8',
    '#0369a1',
    'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80',
    NULL,
    'https://github.com',
    'https://github.com',
    '2023',
    5,
    TRUE,
    'published',
    '[
        "60 FPS sustained rendering at native 1080p directly in browser canvases without plugins",
        "Optimized multiresolution hash table query reducing compute shader cache misses by 63%",
        "Volumetric occupancy grid acceleration skipping 88% of empty space during ray marching"
    ]'::jsonb,
    '[
        {"label": "Graphics API", "value": "W3C WebGPU with WebGPU Shading Language (WGSL)"},
        {"label": "Volumetric Model", "value": "Instant-NGP Multi-Resolution Hash Encoding"},
        {"label": "Shader Architecture", "value": "Decoupled Raymarch Compute + Blit Render Pipeline"},
        {"label": "Target Frame Rate", "value": "60 FPS at 1080p in Chromium / Firefox"}
    ]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    tagline = EXCLUDED.tagline,
    description_markdown = EXCLUDED.description_markdown,
    category = EXCLUDED.category,
    node_style = EXCLUDED.node_style,
    node_color_primary = EXCLUDED.node_color_primary,
    node_color_secondary = EXCLUDED.node_color_secondary,
    thumbnail_url = EXCLUDED.thumbnail_url,
    video_url = EXCLUDED.video_url,
    live_demo_url = EXCLUDED.live_demo_url,
    github_repo_url = EXCLUDED.github_repo_url,
    year = EXCLUDED.year,
    sort_order = EXCLUDED.sort_order,
    featured = EXCLUDED.featured,
    status = EXCLUDED.status,
    achievements = EXCLUDED.achievements,
    technical_specs = EXCLUDED.technical_specs;

-- 3. LINK PROJECT TECHNOLOGIES
INSERT INTO public.project_technologies (project_id, technology_id, sort_order)
SELECT p.id, t.id, 0
FROM public.projects p, public.technologies t
WHERE p.slug = 'aether-engine' AND t.slug IN ('cpp20', 'vulkan', 'glsl', 'cmake', 'ray-tracing', 'simd')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_technologies (project_id, technology_id, sort_order)
SELECT p.id, t.id, 0
FROM public.projects p, public.technologies t
WHERE p.slug = 'synapsenet' AND t.slug IN ('rust', 'cuda', 'pytorch', 'nccl', 'triton', 'infiniband')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_technologies (project_id, technology_id, sort_order)
SELECT p.id, t.id, 0
FROM public.projects p, public.technologies t
WHERE p.slug = 'chronos-os' AND t.slug IN ('rust', 'x86_64-assembly', 'qemu', 'linker-scripts', 'gdb')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_technologies (project_id, technology_id, sort_order)
SELECT p.id, t.id, 0
FROM public.projects p, public.technologies t
WHERE p.slug = 'voxelworld' AND t.slug IN ('csharp', 'hlsl', 'compute-shaders', 'webrtc', 'voxel-meshing', 'simd')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_technologies (project_id, technology_id, sort_order)
SELECT p.id, t.id, 0
FROM public.projects p, public.technologies t
WHERE p.slug = 'hyperion' AND t.slug IN ('go', 'typescript', 'grpc', 'protobuf', 'raft', 'ebpf')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_technologies (project_id, technology_id, sort_order)
SELECT p.id, t.id, 0
FROM public.projects p, public.technologies t
WHERE p.slug = 'opticmesh' AND t.slug IN ('webgpu', 'wgsl', 'typescript', 'nerf', 'compute-shaders', 'threejs')
ON CONFLICT DO NOTHING;

-- 4. SEED PROJECT MEDIA (Gallery)
INSERT INTO public.project_media (project_id, type, url, caption, sort_order, is_hero)
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Full spectral path-traced caustics and multi-bounce diffuse global illumination', 0, true
FROM public.projects p WHERE p.slug = 'aether-engine'
UNION ALL
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80', 'Two-level BVH spatial partitioning hierarchy visualization showing leaf clusters', 1, false
FROM public.projects p WHERE p.slug = 'aether-engine'
UNION ALL
SELECT p.id, 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'Real-time ray tracing walkthrough running at native 1440p', 2, false
FROM public.projects p WHERE p.slug = 'aether-engine'
UNION ALL
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80', 'Distributed GPU memory topology and cross-node ring-reduce interconnects', 0, true
FROM public.projects p WHERE p.slug = 'synapsenet'
UNION ALL
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', 'Token latency benchmarks showing linear scaling across 32 H100 SXM nodes', 1, false
FROM public.projects p WHERE p.slug = 'synapsenet'
UNION ALL
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80', 'Kernel space vs user space capability boundary memory architecture diagram', 0, true
FROM public.projects p WHERE p.slug = 'chronos-os'
UNION ALL
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', 'Chronos boot sequence and serial console driver executing in QEMU emulator', 1, false
FROM public.projects p WHERE p.slug = 'chronos-os'
UNION ALL
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80', 'Real-time procedural planetary terrain rendered via compute shader dual contouring', 0, true
FROM public.projects p WHERE p.slug = 'voxelworld'
UNION ALL
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', 'High-frequency telemetry pipeline architecture and LSM partition compaction tree', 0, true
FROM public.projects p WHERE p.slug = 'hyperion'
UNION ALL
SELECT p.id, 'image', 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1200&q=80', 'Volumetric radiance field reconstruction displaying continuous novel viewpoints', 0, true
FROM public.projects p WHERE p.slug = 'opticmesh';

-- 5. SEED DEFAULT PORTFOLIO SETTINGS
INSERT INTO public.portfolio_settings (
    id,
    bio_headline,
    bio_full_markdown,
    resume_url,
    github_url,
    linkedin_url,
    contact_email,
    environment_theme
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Systems, AI & Real-Time 3D Graphics Architect',
    E'# Biography\n\nSoftware engineer specializing in high-performance computer graphics, distributed inference engines, and low-latency microkernel operating systems.',
    'https://example.com/resume.pdf',
    'https://github.com',
    'https://linkedin.com',
    'contact@adelr.dev',
    'obsidian_titanium'
)
ON CONFLICT (id) DO NOTHING;
