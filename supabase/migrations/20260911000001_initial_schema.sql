-- ==============================================================================
-- 3D DEVELOPER PORTFOLIO - INITIAL SCHEMA MIGRATION
-- Migration: 20260911000001_initial_schema.sql
-- Description: Creates enums, relational tables, indexes, and triggers.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE project_category AS ENUM (
        'game_dev',
        'ai_ml',
        'systems_engine',
        'three_d_graphics',
        'web_fullstack'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM (
        'draft',
        'published',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE node_style_type AS ENUM (
        'hologram_pedestal',
        'cyber_terminal',
        'data_monolith',
        'custom_glb'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type AS ENUM (
        'image',
        'video'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. ADMIN PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROJECTS TABLE (Primary 3D portfolio milestones)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    tagline TEXT NOT NULL,
    description TEXT,
    description_markdown TEXT NOT NULL,
    category project_category NOT NULL,
    node_style node_style_type NOT NULL DEFAULT 'hologram_pedestal',
    custom_model_url TEXT,
    node_color_primary TEXT NOT NULL DEFAULT '#38bdf8',
    node_color_secondary TEXT NOT NULL DEFAULT '#0284c7',
    thumbnail_url TEXT NOT NULL,
    hero_media TEXT,
    video_url TEXT,
    live_demo_url TEXT,
    github_repo_url TEXT,
    case_study_url TEXT,
    year TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    status project_status NOT NULL DEFAULT 'draft',
    achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
    technical_specs JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for projects.updated_at
DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. TECHNOLOGIES TABLE (Normalized technology entities)
CREATE TABLE IF NOT EXISTS public.technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PROJECT_TECHNOLOGIES (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.project_technologies (
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    technology_id UUID NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, technology_id)
);

-- 8. PROJECT_MEDIA (One-to-many relational gallery and assets)
CREATE TABLE IF NOT EXISTS public.project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type media_type NOT NULL DEFAULT 'image',
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_hero BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PORTFOLIO_SETTINGS (Global configuration & bio)
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bio_headline TEXT NOT NULL,
    bio_full_markdown TEXT,
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    contact_email TEXT,
    ambient_audio_url TEXT,
    environment_theme TEXT NOT NULL DEFAULT 'obsidian_titanium',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for portfolio_settings.updated_at
DROP TRIGGER IF EXISTS trigger_portfolio_settings_updated_at ON public.portfolio_settings;
CREATE TRIGGER trigger_portfolio_settings_updated_at
    BEFORE UPDATE ON public.portfolio_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 10. INDEXES FOR HIGH-THROUGHPUT RETRIEVAL
CREATE INDEX IF NOT EXISTS idx_projects_status_sort ON public.projects(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_project_media_project ON public.project_media(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_project_tech_project ON public.project_technologies(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_project_tech_tech ON public.project_technologies(technology_id);
CREATE INDEX IF NOT EXISTS idx_technologies_slug ON public.technologies(slug);

-- 11. ATOMIC PROJECT REORDERING FUNCTION
CREATE OR REPLACE FUNCTION public.reorder_projects(p_ordered_ids UUID[])
RETURNS VOID AS $$
DECLARE
    i INT;
BEGIN
    FOR i IN 1..array_length(p_ordered_ids, 1) LOOP
        UPDATE public.projects
        SET sort_order = i - 1
        WHERE id = p_ordered_ids[i];
    END LOOP;
END;
$$ LANGUAGE plpgsql;
