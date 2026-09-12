import React, { useState, useEffect } from 'react';
import type { Project, ProjectCategory, NodeStyleType, ProjectStatus } from '@/types/project';
import { projectService } from '@/services/supabase/projectService';
import { Heading, MonoLabel } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { X, Save, AlertCircle, Sparkles } from 'lucide-react';
import { isValidSlug, isValidHexColor, isSafeUrl } from '@/lib/validation';

interface ProjectEditorModalProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectSaved: (saved: Project) => void;
}

const CATEGORIES: { id: ProjectCategory; label: string }[] = [
  { id: 'three_d_graphics', label: '3D Graphics & Simulation' },
  { id: 'ai_ml', label: 'AI & Neural Systems' },
  { id: 'systems_engine', label: 'Systems & Microkernel' },
  { id: 'game_dev', label: 'Game Architecture' },
  { id: 'web_fullstack', label: 'Web Systems & Distributed' },
];

const NODE_STYLES: { id: NodeStyleType; label: string }[] = [
  { id: 'architectural_structure', label: 'Architectural Structure (Pavilion / Terrace)' },
  { id: 'miniature_environment', label: 'Miniature Environment (Contour Diorama)' },
  { id: 'technical_installation', label: 'Technical Installation (Optics / Sensor Array)' },
  { id: 'vehicle_object', label: 'Vehicle / Object (Exploration Probe in Cradle)' },
  { id: 'data_monument', label: 'Data Monument (Obsidian Compute Pylon)' },
  { id: 'studio_workspace', label: 'Studio / Workspace (Drafting Workstation)' },
  { id: 'custom_glb', label: 'Custom 3D GLB Model (Requires .glb URL)' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({
  project,
  isOpen,
  onClose,
  onProjectSaved,
}) => {
  const isEditing = Boolean(project);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('three_d_graphics');
  const [nodeStyle, setNodeStyle] = useState<NodeStyleType>('hologram_pedestal');
  const [customModelUrl, setCustomModelUrl] = useState('');
  const [nodeColorPrimary, setNodeColorPrimary] = useState('#38bdf8');
  const [nodeColorSecondary, setNodeColorSecondary] = useState('#0284c7');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [year, setYear] = useState('2026');
  const [status, setStatus] = useState<ProjectStatus>('published');
  const [featured, setFeatured] = useState(false);
  const [technologiesStr, setTechnologiesStr] = useState('');
  const [achievementsStr, setAchievementsStr] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form on project change
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setSlug(project.slug);
      setSubtitle(project.subtitle || '');
      setTagline(project.tagline);
      setDescriptionMarkdown(project.description_markdown);
      setCategory(project.category);
      setNodeStyle(project.node_style);
      setCustomModelUrl(project.custom_model_url || '');
      setNodeColorPrimary(project.node_color_primary);
      setNodeColorSecondary(project.node_color_secondary);
      setThumbnailUrl(project.thumbnail_url);
      setLiveDemoUrl(project.live_demo_url || '');
      setGithubRepoUrl(project.github_repo_url || '');
      setYear(project.year ? String(project.year) : '2026');
      setStatus(project.status);
      setFeatured(project.featured);
      setTechnologiesStr(project.technologies.join(', '));
      setAchievementsStr((project.achievements || []).join('\n'));
    } else {
      // Default empty state for new project
      setTitle('');
      setSlug('');
      setSubtitle('');
      setTagline('');
      setDescriptionMarkdown('');
      setCategory('three_d_graphics');
      setNodeStyle('hologram_pedestal');
      setCustomModelUrl('');
      setNodeColorPrimary('#38bdf8');
      setNodeColorSecondary('#0284c7');
      setThumbnailUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
      setLiveDemoUrl('');
      setGithubRepoUrl('');
      setYear('2026');
      setStatus('published');
      setFeatured(false);
      setTechnologiesStr('');
      setAchievementsStr('');
    }
    setError(null);
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing || !slug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }
    if (!tagline.trim()) {
      setError('Project tagline is required.');
      return;
    }
    if (!slug.trim() || !isValidSlug(slug.trim())) {
      setError('A valid URL slug is required (lowercase letters, numbers, and hyphens only, e.g. "neural-pipeline").');
      return;
    }
    if (nodeColorPrimary && !isValidHexColor(nodeColorPrimary)) {
      setError('Primary node color must be a valid 6-character hex code (e.g. #38bdf8).');
      return;
    }
    if (nodeColorSecondary && !isValidHexColor(nodeColorSecondary)) {
      setError('Secondary node color must be a valid 6-character hex code (e.g. #0284c7).');
      return;
    }
    if (liveDemoUrl.trim() && !isSafeUrl(liveDemoUrl.trim())) {
      setError('Live demo URL must be a secure web URL (starting with http:// or https://).');
      return;
    }
    if (githubRepoUrl.trim() && !isSafeUrl(githubRepoUrl.trim())) {
      setError('GitHub repository URL must be a secure web URL (starting with http:// or https://).');
      return;
    }
    if (customModelUrl.trim() && !isSafeUrl(customModelUrl.trim())) {
      setError('Custom 3D Model URL must be a secure web URL (starting with http:// or https://).');
      return;
    }
    if (thumbnailUrl.trim() && !isSafeUrl(thumbnailUrl.trim())) {
      setError('Thumbnail URL must be a valid web URL (starting with http:// or https://).');
      return;
    }
    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear < 1970 || parsedYear > 2100) {
      setError('Project year must be a valid 4-digit year between 1970 and 2100.');
      return;
    }

    const technologies = technologiesStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const achievements = achievementsStr
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (isEditing && project) {
        const updated = await projectService.updateProject(project.id, {
          title,
          slug,
          subtitle: subtitle || undefined,
          tagline,
          description_markdown: descriptionMarkdown || tagline,
          category,
          node_style: nodeStyle,
          custom_model_url: customModelUrl || null,
          node_color_primary: nodeColorPrimary,
          node_color_secondary: nodeColorSecondary,
          thumbnail_url: thumbnailUrl,
          live_demo_url: liveDemoUrl || null,
          github_repo_url: githubRepoUrl || null,
          year,
          status,
          featured,
          technologies,
          achievements,
        });

        if (updated) {
          onProjectSaved(updated);
          onClose();
        } else {
          setError('Failed to update project.');
        }
      } else {
        const created = await projectService.createProject({
          title,
          slug,
          subtitle: subtitle || undefined,
          tagline,
          description_markdown: descriptionMarkdown || tagline,
          category,
          node_style: nodeStyle,
          custom_model_url: customModelUrl || null,
          node_color_primary: nodeColorPrimary,
          node_color_secondary: nodeColorSecondary,
          thumbnail_url: thumbnailUrl,
          live_demo_url: liveDemoUrl || null,
          github_repo_url: githubRepoUrl || null,
          year,
          sort_order: 99,
          status,
          featured,
          technologies,
          achievements,
          media_gallery: [],
          technical_specs: [],
        });

        if (created) {
          onProjectSaved(created);
          onClose();
        } else {
          setError('Failed to create project.');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-white/[0.1] bg-[#0c0c14] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0f0f1c]">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <div>
              <MonoLabel className="text-[10px] text-primary block">
                {isEditing ? `EXHIBIT ARCHITECTURE // EDIT` : `EXHIBIT ARCHITECTURE // CREATE`}
              </MonoLabel>
              <Heading level={3} className="text-base sm:text-lg font-bold text-foreground">
                {isEditing ? `Edit: ${project?.title}` : 'Construct New Project Exhibit'}
              </Heading>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar font-sans text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Core Identifiers */}
          <div className="space-y-4">
            <MonoLabel className="text-[10px] text-muted-foreground uppercase tracking-widest block border-b border-white/[0.06] pb-1">
              1. Identity & Routing
            </MonoLabel>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  EXHIBIT TITLE *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Project Title"
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs focus:outline-none focus:border-primary/60"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  URL SLUG *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="project-slug"
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono focus:outline-none focus:border-primary/60"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  SUBTITLE / TOPIC
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. System Architecture & Capabilities"
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  YEAR OF CREATION
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono focus:outline-none focus:border-primary/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                SUMMARY TAGLINE *
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Concise overview of project objectives and architecture."
                className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs focus:outline-none focus:border-primary/60"
                required
              />
            </div>
          </div>

          {/* Section 2: 3D Visualization & Aesthetics */}
          <div className="space-y-4">
            <MonoLabel className="text-[10px] text-muted-foreground uppercase tracking-widest block border-b border-white/[0.06] pb-1">
              2. 3D Waypoint & Archetype Styling
            </MonoLabel>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  DISCIPLINE CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs focus:outline-none focus:border-primary/60"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  3D ARTIFACT ARCHETYPE
                </label>
                <select
                  value={nodeStyle}
                  onChange={(e) => setNodeStyle(e.target.value as NodeStyleType)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs focus:outline-none focus:border-primary/60"
                >
                  {NODE_STYLES.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {nodeStyle === 'custom_glb' && (
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  CUSTOM GLB ASSET URL
                </label>
                <input
                  type="url"
                  value={customModelUrl}
                  onChange={(e) => setCustomModelUrl(e.target.value)}
                  placeholder="https://.../model.glb"
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono focus:outline-none focus:border-primary/60"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  PRIMARY ACCENT COLOR (HEX)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={nodeColorPrimary}
                    onChange={(e) => setNodeColorPrimary(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={nodeColorPrimary}
                    onChange={(e) => setNodeColorPrimary(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  SECONDARY ACCENT COLOR (HEX)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={nodeColorSecondary}
                    onChange={(e) => setNodeColorSecondary(e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={nodeColorSecondary}
                    onChange={(e) => setNodeColorSecondary(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Status & Visibility */}
          <div className="space-y-4">
            <MonoLabel className="text-[10px] text-muted-foreground uppercase tracking-widest block border-b border-white/[0.06] pb-1">
              3. Exhibition Status
            </MonoLabel>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  PUBLICATION STATE
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs focus:outline-none focus:border-primary/60"
                >
                  <option value="published">Published (Visible on 3D Path)</option>
                  <option value="draft">Draft (Hidden from Public)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded bg-[#07070b] border-white/[0.2] text-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="text-xs text-foreground cursor-pointer flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Featured Exhibit (Aura Ring & Priority Accents)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Dossier Details & Markdown */}
          <div className="space-y-4">
            <MonoLabel className="text-[10px] text-muted-foreground uppercase tracking-widest block border-b border-white/[0.06] pb-1">
              4. Technical Dossier Details
            </MonoLabel>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                TECHNOLOGY STACK (COMMA-SEPARATED)
              </label>
              <input
                type="text"
                value={technologiesStr}
                onChange={(e) => setTechnologiesStr(e.target.value)}
                placeholder="TypeScript, WebGL, Rust, Three.js"
                className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono focus:outline-none focus:border-primary/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                KEY ACHIEVEMENTS (ONE PER LINE)
              </label>
              <textarea
                value={achievementsStr}
                onChange={(e) => setAchievementsStr(e.target.value)}
                rows={3}
                placeholder="Highlight verified project metrics or key architectural milestones&#10;e.g. Modular rendering pipeline with decoupled update passes"
                className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs leading-relaxed focus:outline-none focus:border-primary/60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                DETAILED ARCHITECTURE SPECIFICATION (MARKDOWN)
              </label>
              <textarea
                value={descriptionMarkdown}
                onChange={(e) => setDescriptionMarkdown(e.target.value)}
                rows={5}
                placeholder="### Architecture Overview&#10;Describe system architecture, design patterns, and engineering tradeoffs..."
                className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono leading-relaxed focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  GITHUB REPOSITORY URL
                </label>
                <input
                  type="url"
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                  LIVE DEMO / RUNTIME URL
                </label>
                <input
                  type="url"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono focus:outline-none focus:border-primary/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted-foreground mb-1">
                THUMBNAIL IMAGE URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-lg bg-[#07070b] border border-white/[0.1] text-foreground text-xs font-mono focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              className="gap-2 text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Persisting Exhibit...' : isEditing ? 'Save Changes' : 'Create Exhibit'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
