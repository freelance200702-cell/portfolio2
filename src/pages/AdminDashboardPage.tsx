import React, { useEffect, useState } from 'react';
import type { Project, ProjectStatus } from '@/types/project';
import { projectService } from '@/services/supabase/projectService';
import { Heading, Paragraph, MonoLabel } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import {
  Plus,
  MoveUp,
  MoveDown,
  Eye,
  CheckCircle2,
  Layers,
  Edit,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { MediaManagerModal } from '@/components/admin/MediaManagerModal';
import { ProjectEditorModal } from '@/components/admin/ProjectEditorModal';

export const AdminDashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedProjectForMedia, setSelectedProjectForMedia] = useState<Project | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAllProjectsForAdmin();
      setProjects(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleProjectUpdated = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProjectForMedia(updated);
  };

  const handleProjectSaved = (saved: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [...prev, saved];
    });
    setSaveStatus(`Exhibit "${saved.title}" saved successfully.`);
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete exhibit "${project.title}"?`)) {
      return;
    }
    const success = await projectService.deleteProject(project.id);
    if (success) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setSaveStatus(`Exhibit "${project.title}" deleted.`);
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const handleTogglePublish = async (project: Project) => {
    const nextStatus: ProjectStatus = project.status === 'published' ? 'draft' : 'published';
    const success = await projectService.togglePublishStatus(project.id, nextStatus);
    if (success) {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, status: nextStatus } : p))
      );
      setSaveStatus(`Exhibit "${project.title}" marked as ${nextStatus.toUpperCase()}.`);
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newProjects = [...projects];
    const [moved] = newProjects.splice(index, 1);
    newProjects.splice(targetIndex, 0, moved);

    // Update local state immediately for snappy UX
    setProjects(newProjects);
    setSaveStatus('Updating path order...');

    const orderedIds = newProjects.map((p) => p.id);
    await projectService.updateSortOrder(orderedIds);
    setSaveStatus('Path sequence saved successfully');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="max-w-6xl w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <MonoLabel className="text-[11px] mb-1 block">3D SPLINE SEQUENCING</MonoLabel>
          <Heading level={1} className="text-2xl sm:text-3xl font-bold">
            Project Exhibits Management
          </Heading>
          <Paragraph className="text-sm text-muted-foreground mt-1">
            Order in this list directly maps to the spatial sequence along the continuous 3D journey curve.
          </Paragraph>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            className="gap-2 text-xs"
            onClick={() => {
              setEditingProject(null);
              setIsEditorOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Create Exhibit</span>
          </Button>
        </div>
      </div>

      {saveStatus && (
        <div className="mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Projects Table / Card List */}
      {loading ? (
        <div className="text-center py-20 text-muted-foreground font-mono text-sm">
          LOADING EXHIBITS DATA...
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, idx) => (
            <Card
              key={project.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#0f0f1c] hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Visual Sequence Index */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono text-primary font-bold text-sm border border-primary/20">
                  {`0${idx + 1}`}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="primary" className="text-[10px]">
                      {project.category.replace('_', ' ').toUpperCase()}
                    </Badge>

                    {project.featured && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-amber-400 border border-amber-400/30 bg-amber-400/10">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>FEATURED</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleTogglePublish(project)}
                      title={`Click to switch status (Current: ${project.status})`}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                        project.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                      }`}
                    >
                      {project.status.toUpperCase()}
                    </button>

                    <span className="text-xs font-mono text-muted-foreground">
                      {project.node_style}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {project.tagline}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveProject(idx, 'up')}
                  disabled={idx === 0}
                  title="Move Earlier Along 3D Spline"
                  className="h-8 w-8"
                >
                  <MoveUp className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => moveProject(idx, 'down')}
                  disabled={idx === projects.length - 1}
                  title="Move Later Along 3D Spline"
                  className="h-8 w-8"
                >
                  <MoveDown className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingProject(project);
                    setIsEditorOpen(true);
                  }}
                  className="gap-1.5 text-xs border-white/[0.1] text-foreground hover:bg-white/[0.08]"
                  title="Edit exhibit details and specifications"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProjectForMedia(project)}
                  className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                  title="Configure project media, hero showcase, gallery, and 3D GLB assets"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Media Assets</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/#${project.slug}`, '_blank')}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteProject(project)}
                  className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                  title="Delete Exhibit"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Project Construction / Editing Modal */}
      {isEditorOpen && (
        <ProjectEditorModal
          project={editingProject}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onProjectSaved={handleProjectSaved}
        />
      )}

      {/* Media Management Modal */}
      {selectedProjectForMedia && (
        <MediaManagerModal
          project={selectedProjectForMedia}
          isOpen={Boolean(selectedProjectForMedia)}
          onClose={() => setSelectedProjectForMedia(null)}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
};
