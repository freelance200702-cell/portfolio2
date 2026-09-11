# Technical Architecture: Premium Interactive 3D Developer Portfolio

> **Status:** Approved Architecture Blueprint  
> **Version:** 1.0.0  
> **Target Audience:** Engineering, Design, DevOps

---

## 1. Executive Summary & Vision

The objective of this project is to build a high-performance, cinematic, interactive 3D portfolio website that showcases deep engineering expertise across **game development, AI/ML, systems programming, web development, and 3D graphics**.

Rather than presenting a standard 2D card grid, visitors embark on a continuous 3D journey along an algorithmic space curve (spline road). Projects are represented in 3D space as interactive exhibits (nodes). Entering or clicking a node smoothly transitions the camera into inspection mode and slides open a comprehensive, media-rich project presentation.

All project data, sequencing, custom 3D models, and media are managed through a secure, private Admin Dashboard backed by Supabase. Reordering or publishing projects in the CMS automatically recalculates the 3D spline path and updates the public journey in real time without frontend code modifications or redeployments.

---

## 2. High-Level Architecture Diagram

```
+--------------------------------------------------------------------------------------------------------+
|                                              CLIENT TIER                                               |
|                                                                                                        |
|  +--------------------------------------------------------------------------------------------------+  |
|  |                                  Interactive 3D Canvas (R3F)                                     |  |
|  |                                                                                                  |  |
|  |    [Origin Portal] ====( CatmullRom 3D Spline Track )====> [Project Node 1] ====> [Node 2] ...   |  |
|  |                                                                   |                              |  |
|  |                                                      (Proximity / Raycasting)                    |  |
|  |                                                                   v                              |  |
|  |                                                        Camera Inspection Matrix                  |  |
|  +--------------------------------------------------------------------------------------------------+  |
|                                                  |                                                     |
|                                                  | (State Sync via Zustand)                            |
|                                                  v                                                     |
|  +--------------------------------------------------------------------------------------------------+  |
|  |                            2D Presentation & Control Layer (Tailwind CSS)                        |  |
|  |                                                                                                  |  |
|  |   - Journey Progress Scrubber (0.0 -> 1.0)              - Case Study Slide-out Drawer            |  |
|  |   - Category Filter (Game, AI, Systems, Web, 3D)       - Tech Stack Badges & Metrics            |  |
|  |   - Audio / Ambient Soundscape Toggle                   - Live Demo & Source Code Portals        |  |
|  |   - Dynamic Performance / Quality Switcher              - Keyboard / Touch Scrubbing Engine      |  |
|  +--------------------------------------------------------------------------------------------------+  |
|                                                  |                                                     |
+--------------------------------------------------|-----------------------------------------------------+
                                                   |
                     +-----------------------------+-----------------------------+
                     | Public Queries (Cached)                                   | Admin Mutations (JWT Authenticated)
                     v                                                           v
+--------------------------------------------------+       +---------------------------------------------+
|               SUPABASE BACKEND                   |       |           PRIVATE ADMIN DASHBOARD           |
|                                                  |       |                                             |
|  - PostgreSQL Database (RLS Enforced)            | <==== |  - Drag-and-Drop Spline Path Sequencer      |
|  - Supabase Storage (Optimized GLB & Media)      |       |  - Real-time 3D Node & Material Previewer   |
|  - Supabase Auth (Admin PKCE & Session Tokens)   |       |  - Markdown Editor for In-depth Case Studies|
|  - Edge CDN & Global Asset Distribution          |       |  - GLB File Validator & Metadata Extractor  |
+--------------------------------------------------+       +---------------------------------------------+
```

---

## 3. Technology Stack Rationale

| Layer | Selected Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Build & Bundler** | **Vite 6 + React 18/19 + TypeScript 5.5+** | Instant HMR, zero SSR hydration mismatches with WebGL canvas contexts, total control over WebGL context lifetime (avoiding context loss during routing). |
| **3D Engine** | **Three.js + React Three Fiber (R3F)** | Industry-standard declarative WebGL scene graph, automatic memory disposal of geometries/materials, seamless component lifecycle integration. |
| **3D Utilities** | **@react-three/drei** | Battle-tested helpers: `Float`, `AdaptiveDpr`, `PerformanceMonitor`, `useGLTF`, `Text`, `MeshDistortMaterial`, `Preload`. |
| **Post-Processing** | **@react-three/postprocessing** | High-fidelity cinematic bloom, chromatic aberration, tone mapping, and vignette with dynamic quality throttling. |
| **Motion & Spline** | **GSAP (@gsap/react) + Lenis** | Smooth 60/120fps camera lerp along curve, non-blocking scroll interpolation (`progress` from 0.0 to 1.0), and cinematic focus transitions. |
| **State Bridge** | **Zustand** | Ultra-lightweight (1KB), zero-re-render bridge connecting the continuous 60fps WebGL render loop (`useFrame`) to 2D HUD overlays. |
| **UI & Styling** | **Tailwind CSS + Radix UI Primitives** | High-performance, responsive glassmorphism HUD, accessible project drawers, and dark-mode admin interface. |
| **Backend & Storage**| **Supabase** | Managed PostgreSQL, Row Level Security (RLS), JWT authentication for admin, and storage buckets for GLB models and media. |
| **Icons & Media** | **Lucide React** | Featherweight modern SVG iconography. |

---

## 4. Scalable Project Directory Structure

```
portfolio2/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Automated lint, typecheck, and build pipeline
├── public/
│   ├── env/                       # HDRI environment maps (.hdr)
│   ├── textures/                  # Matcaps, noise textures, path normal maps
│   ├── audio/                     # Ambient cyber soundscapes (subtle, loopable)
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── 3d/                    # Pure WebGL / R3F Canvas components
│   │   │   ├── CanvasContainer.tsx# Master Canvas, camera configuration, DPR monitoring
│   │   │   ├── Scene.tsx          # 3D world composition, lighting, environment
│   │   │   ├── CameraRig.tsx      # Spline path interpolation & camera focus controller
│   │   │   ├── SplineRoad.tsx     # Extruded path geometry & animated UV neon shader
│   │   │   ├── ProjectNode.tsx    # Interactive 3D project landmark
│   │   │   ├── NodePresets/       # Built-in procedural 3D archetypes
│   │   │   │   ├── HologramPedestal.tsx
│   │   │   │   ├── CyberTerminal.tsx
│   │   │   │   ├── DataMonolith.tsx
│   │   │   │   └── CustomGLBWrapper.tsx
│   │   │   ├── Environment/       # Atmospherics, floating dust, lighting, background grid
│   │   │   │   ├── StarField.tsx
│   │   │   │   ├── NebulaFog.tsx
│   │   │   │   └── LightingRig.tsx
│   │   │   └── PostEffects.tsx    # Selective Bloom, ToneMapping, ChromaticAberration
│   │   ├── ui/                    # 2D HUD overlays rendered over the 3D canvas
│   │   │   ├── HUD.tsx            # Main HUD wrapper & responsive grid
│   │   │   ├── JourneyScrubber.tsx# Visual progress timeline with project anchor ticks
│   │   │   ├── ProjectDrawer.tsx  # Slide-out detailed case study modal
│   │   │   ├── CategoryPills.tsx  # Filter tags (Game Dev, AI, Systems, Web, 3D)
│   │   │   ├── QualitySelector.tsx# Graphics preset toggle (Cinematic / Low Power)
│   │   │   └── AudioController.tsx# Ambient soundscape toggle & volume slider
│   │   └── admin/                 # Private Admin Management Portal
│   │       ├── AdminLayout.tsx    # Shell with navigation, session info, and stats
│   │       ├── PathSequencer.tsx  # Drag-and-drop project reordering (sort_order)
│   │       ├── ProjectEditor.tsx  # Add / edit form with Markdown editor
│   │       ├── GLBUploader.tsx    # Drag-and-drop 3D asset uploader with validation
│   │       └── MediaDropzone.tsx  # Multi-file gallery upload for screenshots & video
│   ├── hooks/                     # Custom React Hooks
│   │   ├── useProjects.ts         # Supabase data querying & caching
│   │   ├── useSplineGeometry.ts   # Derives 3D curve & road coordinates from project list
│   │   ├── useJourneyScroll.ts    # Lenis / gesture input mapped to 0.0 - 1.0 progress
│   │   └── useAssetPreload.ts     # Preloading manager for GLB models & textures
│   ├── stores/                    # Global Zustand Stores
│   │   ├── useJourneyStore.ts     # Active project, camera mode, scroll progress (t)
│   │   ├── useUIStore.ts          # Drawer state, selected category, audio state
│   │   └── useQualityStore.ts     # DPR settings, shadow toggles, postprocessing levels
│   ├── lib/                       # Utility Libraries & Singletons
│   │   ├── supabase.ts            # Supabase client initialization
│   │   ├── splineMath.ts          # Catmull-Rom math, tangents, Frenet frames, bank angles
│   │   └── glbValidator.ts        # Client-side 3D model validation (file size, format)
│   ├── types/                     # TypeScript Type Definitions
│   │   ├── project.ts             # Domain interfaces (Project, Category, NodeStyle, Media)
│   │   └── database.types.ts      # Generated Supabase schema types
│   ├── pages/                     # Route Pages
│   │   ├── JourneyPage.tsx        # Public interactive 3D portfolio view
│   │   ├── AdminLoginPage.tsx     # Admin authentication portal
│   │   └── AdminDashboardPage.tsx # CMS dashboard view
│   ├── App.tsx                    # Router & React Query Provider setup
│   ├── index.css                  # Global styles, Tailwind directives, custom scrollbars
│   └── main.tsx                   # Application bootstrap
├── ARCHITECTURE.md                # This document
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 5. Database Schema & Supabase Configuration

### 5.1 Enums & Types
```sql
-- Project classification
CREATE TYPE project_category AS ENUM (
  'game_dev',
  'ai_ml',
  'systems_engine',
  'three_d_graphics',
  'web_fullstack'
);

-- Visual 3D archetype for the project node
CREATE TYPE node_style_type AS ENUM (
  'hologram_pedestal',
  'cyber_terminal',
  'data_monolith',
  'custom_glb'
);

-- Publication lifecycle status
CREATE TYPE project_status AS ENUM (
  'draft',
  'published',
  'archived'
);
```

### 5.2 Tables
```sql
-- 1. Projects Table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT NOT NULL,
  description_markdown TEXT NOT NULL,
  category project_category NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  
  -- External Links & Deliverables
  live_demo_url TEXT,
  github_repo_url TEXT,
  case_study_url TEXT,
  
  -- Media & Assets
  thumbnail_url TEXT NOT NULL,
  media_gallery JSONB DEFAULT '[]'::jsonb, -- Array of { type: 'image'|'video', url: string, caption?: string }
  
  -- 3D Node Configuration
  node_style node_style_type NOT NULL DEFAULT 'hologram_pedestal',
  custom_model_url TEXT,                  -- Reference to Supabase Storage .glb
  node_color_primary TEXT DEFAULT '#00f0ff',
  node_color_secondary TEXT DEFAULT '#7928ca',
  
  -- Sequence along the 3D spline
  sort_order INTEGER NOT NULL DEFAULT 0,  -- Ascending order defines spatial position
  featured BOOLEAN NOT NULL DEFAULT false,
  status project_status NOT NULL DEFAULT 'draft',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup index for published journey
CREATE INDEX idx_projects_journey ON public.projects (sort_order ASC) WHERE status = 'published';

-- 2. Admin Profiles Table (RBAC)
CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_superadmin BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Global Portfolio Configuration
CREATE TABLE public.portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bio_headline TEXT NOT NULL DEFAULT 'Interactive 3D & Systems Developer',
  bio_full_markdown TEXT,
  resume_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  contact_email TEXT,
  ambient_audio_url TEXT,
  environment_theme TEXT DEFAULT 'cyber_nebula',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.3 Row Level Security (RLS) Policies
```sql
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies
CREATE POLICY "Allow public read for published projects"
ON public.projects FOR SELECT
USING (status = 'published');

CREATE POLICY "Allow public read for portfolio settings"
ON public.portfolio_settings FOR SELECT
USING (true);

-- 2. Admin Write Policies (Protected by admin_profiles)
CREATE POLICY "Admins have full CRUD access to projects"
ON public.projects FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE is_superadmin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE is_superadmin = true));

CREATE POLICY "Admins can update portfolio settings"
ON public.portfolio_settings FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE is_superadmin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_profiles WHERE is_superadmin = true));
```

### 5.4 Supabase Storage Buckets
1. **`portfolio-media`**: Public bucket for screenshots, hero images, and video demos. Max file size: 50MB.
2. **`portfolio-models`**: Public bucket for uploaded `.glb` 3D models. Max file size: 20MB. Uploads restricted to authenticated admins via Storage RLS.

---

## 6. Algorithmic 3D Spline Journey & Math

### 6.1 Dynamic Curve Generation
Instead of maintaining a static 3D world with hardcoded object coordinates, the entire journey path is derived dynamically from the ordered array of $N$ published projects:

1. **Control Point Synthesis**:
   Given $N$ projects, we generate $N + 2$ control points:
   - $P_0$: Origin / Entrance Portal $(0, 0, 0)$
   - $P_{i+1}$: Project Node Position ($i \in [0, N-1]$)
   - $P_{N+1}$: Finale / Contact Portal
2. **Harmonic Spatial Distribution**:
   To create an organic, winding trajectory through 3D space:
   $$X_i = A_x \cdot \sin(i \cdot \omega_x) + \Delta x_{\text{lateral}}$$
   $$Y_i = A_y \cdot \cos(i \cdot \omega_y) + \Delta y_{\text{elevation}}$$
   $$Z_i = - (i + 1) \cdot D_{\text{step}}$$
   *(where $D_{\text{step}} \approx 30$ units between exhibits to allow spacious contemplation)*.
3. **Spline Formulation**:
   We construct a `THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5)`.
   The `centripetal` curve type eliminates tight self-intersecting loops and unnatural cusps.
4. **Normalized Parameter Mapping**:
   Each project $i$ occupies a fixed normalized progress value $t_i$:
   $$t_i = \frac{i + 1}{N + 1} \quad (t_i \in (0, 1))$$

### 6.2 Road Extrusion & Alignment
- **Ribbon Geometry**: A custom procedural track mesh is extruded along the spline curve, with UV coordinates mapped along the path length.
- **Orientation Matrix**: At any point $t_i$, the local coordinate frame is computed via Frenet-Serret framing or parallel transport frames:
  - Tangent vector: $\vec{T} = \text{curve.getTangentAt}(t_i)$
  - Up vector: $\vec{U} = (0, 1, 0)$ (damped for roll stability)
  - Normal vector: $\vec{N} = \vec{T} \times \vec{U}$
- The 3D project node is positioned at $\text{curve.getPointAt}(t_i)$ and oriented to face incoming travelers.

### 6.3 Camera Navigation & Cinematic Lerp
- **Scroll Progression**: Virtual scroll events, touch drags, or timeline scrubber interactions update `targetProgress` ($0.0 \le t \le 1.0$).
- **Physics Damping**: In the render loop (`useFrame`):
  $$t_{\text{current}} = \text{THREE.MathUtils.damp}(t_{\text{current}}, t_{\text{target}}, \lambda, \Delta t)$$
- **Camera Rigging**:
  $$\vec{P}_{\text{cam}} = \text{curve.getPointAt}(t) + \vec{O}_{\text{cam}}$$
  $$\vec{P}_{\text{look}} = \text{curve.getPointAt}(\min(1.0, t + \Delta_{\text{look}}))$$
- **Inspection State**: When a user clicks a project node:
  1. Camera unlocks from the spline track.
  2. A GSAP timeline smoothly animates the camera into an orbital framing of the selected project node.
  3. The 2D Project Detail Drawer slides out.
  4. Closing the drawer seamlessly animates the camera back to its spline coordinates.

---

## 7. 3D Asset Pipeline & Procedural Archetypes

### 7.1 Procedural-First Strategy
To eliminate heavy initial download barriers, all core journey infrastructure is 100% procedural:
- **Procedural Track**: Custom shader with glowing neon edges and animated scanlines.
- **Particle Atmosphere**: 2,000 instanced dust motes drifting with curl noise.
- **Built-in Node Presets**:
  - `hologram_pedestal`: Floating ring emitter with rotating wireframe polyhedron.
  - `cyber_terminal`: Dual-screen holographic console displaying project metrics.
  - `data_monolith`: Glass-refractive monolith with internal pulsing laser core.

### 7.2 Custom GLB Upload & Optimization Workflow
For projects requiring bespoke 3D models (game characters, robotics, custom hardware):
1. **Admin Ingestion**:
   - Model file format must be `.glb` (binary glTF).
   - Pre-upload client-side validation checks file size (limit: 15MB) and inspects the binary header.
2. **Asset Optimization Standard**:
   - Meshes must be compressed using Draco or Meshopt.
   - Textures must be WebP or Basis Universal (KTX2) to minimize GPU memory pressure.
   - Total vertex count recommended under 100,000 vertices per node.
3. **Progressive Lazy Loading**:
   - The frontend uses `useGLTF.preload` only when the camera approaches within $1.5$ steps of the project along the spline.
   - While a custom GLB is streaming, the node renders its procedural holographic fallback, ensuring zero hitching or blank voids.

---

## 8. Admin Architecture & CMS Workflow

### 8.1 Authentication & Route Guarding
- Admin routes are housed under `/admin/*` and code-split (`React.lazy`), excluding CMS bundles from the public client payload.
- Authentication uses Supabase PKCE session tokens.
- `<AdminGuard>` component verifies that the authenticated user's ID exists in `public.admin_profiles` with `is_superadmin = true`.

### 8.2 Path Sequencer (Drag-and-Drop)
- The admin dashboard features a visual timeline representing the 3D spline.
- Admins can reorder projects via drag-and-drop.
- On drop, a batch update recalculates `sort_order` sequentially ($0, 1, 2, \dots$) and commits to Supabase in a single atomic call.
- The public site updates instantly without code redeployment.

### 8.3 Project Editor
- Rich metadata: Title, Slug, Taglines, Category, and Tech Stack pills.
- Markdown editor for in-depth architecture write-ups, code snippets, and performance benchmarks.
- Live 3D Node Configurator: select node archetype (`hologram_pedestal`, `cyber_terminal`, `data_monolith`, `custom_glb`), adjust primary/secondary emissive colors with an interactive color picker, and preview live.
- Direct-to-Supabase Storage dropzone for screenshots, videos, and GLB models.

---

## 9. Performance & Mobile Strategy

### 9.1 Adaptive Performance Architecture
Maintaining 60 FPS on diverse hardware (from M-series Macs to budget mobile devices) is non-negotiable.

1. **R3F `<PerformanceMonitor>` Integration**:
   - Continuously measures frame rate over sliding 3-second windows.
   - High performance (>55 FPS): Dynamic DPR set to 1.5–2.0; full postprocessing (Bloom, ChromaticAberration).
   - Degraded performance (<48 FPS): Dynamic DPR throttled to 1.0; bloom passes bypassed; particle density reduced.
2. **Frustum & Distance Culling**:
   - Nodes further than 2 curve segments away from the camera are culled (`visible = false`).
   - Materials utilize instanced rendering for repetitive geometry (path markers, boundary pylons).

### 9.2 Mobile & Touch Experience
- **Touch Gesture Handling**: Vertical swipe gestures smoothly advance or rewind along the spline path using non-blocking passive touch listeners.
- **Sticky Jump Controls**: Mobile HUD provides floating "Next Project" / "Previous Project" buttons for quick traversal.
- **Adaptive UI**: On screens $< 768\text{px}$, the project detail presentation transitions from a side sheet into a native-feeling full-screen swipeable bottom sheet.
- **Power Budget**: Postprocessing effects (such as heavy depth-of-field) are automatically disabled on touch devices to conserve battery and GPU thermals.

---

## 10. Security Boundaries

1. **Client Isolation**:
   - The public application only has access to the Supabase `anon` public key.
   - Row Level Security (RLS) ensures public callers can only query rows where `status = 'published'`.
   - Admin tables (`admin_profiles`) are strictly unreadable by public anon tokens.
2. **No Service Role Keys in Client**:
   - `SUPABASE_SERVICE_ROLE_KEY` is strictly prohibited from client bundles and environment files.
   - All admin mutations are authorized via user JWT claims validated against the `admin_profiles` table.
3. **Storage Security**:
   - Public read access is granted for project media and models.
   - Write and delete operations on storage buckets strictly require authenticated admin credentials.

---

## 11. Deployment Architecture

- **Frontend Hosting**: Vercel or Cloudflare Pages with edge caching, automated SSL, and instant preview deployments.
- **Backend Infrastructure**: Supabase Managed Cloud (PostgreSQL 15+, Auth, Storage, Edge CDN).
- **CI/CD Pipeline**: GitHub Actions running:
  1. `tsc --noEmit` (TypeScript strict type validation)
  2. `eslint` (Code quality checks)
  3. `vite build` (Production bundling verification)

---

## 12. Implementation Roadmap

The implementation will proceed systematically in subsequent phases:

- **Phase 1: Project Scaffolding & Design Foundation**  
  Initialize Vite, TypeScript, Tailwind CSS, R3F, Drei, GSAP, and project folder hierarchy.
- **Phase 2: Mathematical Spline & 3D Environment**  
  Implement `SplineRoad`, procedural starfield/atmosphere, and `CameraRig` with smooth progress interpolation.
- **Phase 3: Procedural 3D Project Nodes**  
  Develop `HologramPedestal`, `CyberTerminal`, and `DataMonolith` node archetypes with interactive hover and click triggers.
- **Phase 4: 2D HUD & Project Detail Presentation**  
  Construct the glassmorphism HUD, journey progress scrubber, category filters, and slide-out project case study drawer.
- **Phase 5: Supabase Integration & Database Seeding**  
  Deploy database migrations, configure RLS policies, set up storage buckets, and wire the live data pipeline to the 3D scene.
- **Phase 6: Private Admin Dashboard**  
  Build admin authentication, drag-and-drop spline path sequencer, rich project editor, and GLB upload pipeline.
- **Phase 7: Performance Profiling, Mobile Tuning & Polish**  
  Fine-tune touch gestures, test adaptive DPR degradation, calibrate bloom thresholds, and verify cross-browser stability.
