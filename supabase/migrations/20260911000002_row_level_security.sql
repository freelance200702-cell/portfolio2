-- ==============================================================================
-- 3D DEVELOPER PORTFOLIO - ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20260911000002_row_level_security.sql
-- Description: Establishes zero-trust security policies and admin role authorization.
-- ==============================================================================

-- 1. SECURITY DEFINER HELPER FOR ADMIN VERIFICATION
-- Avoids recursive RLS evaluation and ensures tamper-proof verification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.admin_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execution to authenticated users and anon (evaluates to false for anon)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 2. ENABLE RLS ON ALL APPLICATION TABLES
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. POLICIES: ADMIN_PROFILES
-- ==============================================================================

-- Users can read their own profile, or admins can view all admin profiles
DROP POLICY IF EXISTS "Admin profiles select policy" ON public.admin_profiles;
CREATE POLICY "Admin profiles select policy"
    ON public.admin_profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_admin());

-- Only existing admins can add or update other admin profiles
DROP POLICY IF EXISTS "Admin profiles insert policy" ON public.admin_profiles;
CREATE POLICY "Admin profiles insert policy"
    ON public.admin_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin profiles update policy" ON public.admin_profiles;
CREATE POLICY "Admin profiles update policy"
    ON public.admin_profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin profiles delete policy" ON public.admin_profiles;
CREATE POLICY "Admin profiles delete policy"
    ON public.admin_profiles
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 4. POLICIES: PROJECTS
-- ==============================================================================

-- Public visitors (anon or authenticated) can ONLY read published projects
DROP POLICY IF EXISTS "Public can view published projects" ON public.projects;
CREATE POLICY "Public can view published projects"
    ON public.projects
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published' OR public.is_admin());

-- Authorized administrators can create new projects
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects"
    ON public.projects
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- Authorized administrators can modify any project
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects"
    ON public.projects
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Authorized administrators can delete projects
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects"
    ON public.projects
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 5. POLICIES: TECHNOLOGIES
-- ==============================================================================

-- Public can read all technology definitions
DROP POLICY IF EXISTS "Public can view technologies" ON public.technologies;
CREATE POLICY "Public can view technologies"
    ON public.technologies
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Admins can manage technologies
DROP POLICY IF EXISTS "Admins can insert technologies" ON public.technologies;
CREATE POLICY "Admins can insert technologies"
    ON public.technologies
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update technologies" ON public.technologies;
CREATE POLICY "Admins can update technologies"
    ON public.technologies
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete technologies" ON public.technologies;
CREATE POLICY "Admins can delete technologies"
    ON public.technologies
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 6. POLICIES: PROJECT_TECHNOLOGIES (JOIN TABLE)
-- ==============================================================================

-- Public can view tech associations for published projects
DROP POLICY IF EXISTS "Public can view project technologies" ON public.project_technologies;
CREATE POLICY "Public can view project technologies"
    ON public.project_technologies
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_technologies.project_id
              AND (projects.status = 'published' OR public.is_admin())
        )
    );

-- Admins can manage project tech associations
DROP POLICY IF EXISTS "Admins can insert project technologies" ON public.project_technologies;
CREATE POLICY "Admins can insert project technologies"
    ON public.project_technologies
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete project technologies" ON public.project_technologies;
CREATE POLICY "Admins can delete project technologies"
    ON public.project_technologies
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 7. POLICIES: PROJECT_MEDIA
-- ==============================================================================

-- Public can view media for published projects
DROP POLICY IF EXISTS "Public can view published project media" ON public.project_media;
CREATE POLICY "Public can view published project media"
    ON public.project_media
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_media.project_id
              AND (projects.status = 'published' OR public.is_admin())
        )
    );

-- Admins can manage media
DROP POLICY IF EXISTS "Admins can insert project media" ON public.project_media;
CREATE POLICY "Admins can insert project media"
    ON public.project_media
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update project media" ON public.project_media;
CREATE POLICY "Admins can update project media"
    ON public.project_media
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete project media" ON public.project_media;
CREATE POLICY "Admins can delete project media"
    ON public.project_media
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ==============================================================================
-- 8. POLICIES: PORTFOLIO_SETTINGS
-- ==============================================================================

-- Public can read portfolio settings
DROP POLICY IF EXISTS "Public can view portfolio settings" ON public.portfolio_settings;
CREATE POLICY "Public can view portfolio settings"
    ON public.portfolio_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Admins can update portfolio settings
DROP POLICY IF EXISTS "Admins can update portfolio settings" ON public.portfolio_settings;
CREATE POLICY "Admins can update portfolio settings"
    ON public.portfolio_settings
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert portfolio settings" ON public.portfolio_settings;
CREATE POLICY "Admins can insert portfolio settings"
    ON public.portfolio_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- 9. STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================

-- Create bucket 'project-media' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-media', 'project-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public can download/view any object in 'project-media'
DROP POLICY IF EXISTS "Public can view project media assets" ON storage.objects;
CREATE POLICY "Public can view project media assets"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'project-media');

-- Only authorized administrators can upload assets
DROP POLICY IF EXISTS "Admins can upload project media assets" ON storage.objects;
CREATE POLICY "Admins can upload project media assets"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'project-media' AND public.is_admin());

-- Only authorized administrators can update/overwrite assets
DROP POLICY IF EXISTS "Admins can update project media assets" ON storage.objects;
CREATE POLICY "Admins can update project media assets"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'project-media' AND public.is_admin())
    WITH CHECK (bucket_id = 'project-media' AND public.is_admin());

-- Only authorized administrators can delete assets
DROP POLICY IF EXISTS "Admins can delete project media assets" ON storage.objects;
CREATE POLICY "Admins can delete project media assets"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'project-media' AND public.is_admin());
