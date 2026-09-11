import React, { useState, useRef } from 'react';
import type { Project, MediaItem } from '@/types/project';
import { mediaService } from '@/services/supabase/mediaService';
import { projectService } from '@/services/supabase/projectService';
import { Heading, MonoLabel } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import {
  X,
  Upload,
  Image as ImageIcon,
  Film,
  Box,
  Trash2,
  MoveUp,
  MoveDown,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface MediaManagerModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated: (updated: Project) => void;
}

type TabType = 'thumbnail' | 'hero' | 'gallery' | 'model';

export const MediaManagerModal: React.FC<MediaManagerModalProps> = ({
  project,
  isOpen,
  onClose,
  onProjectUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('thumbnail');

  // Working state copied from project
  const [thumbnailUrl, setThumbnailUrl] = useState(project.thumbnail_url || '');
  const [heroMedia, setHeroMedia] = useState(project.hero_media || '');
  const [videoUrl, setVideoUrl] = useState(project.video_url || '');
  const [gallery, setGallery] = useState<MediaItem[]>(project.media_gallery || []);
  const [customModelUrl, setCustomModelUrl] = useState(project.custom_model_url || '');
  const [nodeStyle, setNodeStyle] = useState(project.node_style);

  // Upload status and feedback
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Persist project media updates
  const saveUpdates = async (partial: Partial<Project>) => {
    setIsSaving(true);
    setUploadError(null);
    try {
      const updated = await projectService.updateProject(project.id, partial);
      if (updated) {
        onProjectUpdated(updated);
        setSuccessMessage('Media specifications updated.');
        setTimeout(() => setSuccessMessage(null), 2400);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update project media.';
      setUploadError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Thumbnail Upload Handler
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = mediaService.validateMediaFile(file, 'image');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      return;
    }

    try {
      setUploadError(null);
      const result = await mediaService.uploadWithProgress(file, 'thumbnails', (pct) => {
        setUploadProgress(pct);
      });

      setThumbnailUrl(result.url);
      setUploadProgress(null);
      await saveUpdates({ thumbnail_url: result.url });
    } catch (err: unknown) {
      setUploadProgress(null);
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    }
  };

  // 2. Hero Media Upload Handler
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const validation = mediaService.validateMediaFile(file, isVideo ? 'video' : 'image');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid media file.');
      return;
    }

    try {
      setUploadError(null);
      const result = await mediaService.uploadWithProgress(file, 'hero', (pct) => {
        setUploadProgress(pct);
      });

      if (isVideo) {
        setVideoUrl(result.url);
        setHeroMedia(result.url);
        await saveUpdates({ hero_media: result.url, video_url: result.url });
      } else {
        setHeroMedia(result.url);
        await saveUpdates({ hero_media: result.url });
      }
      setUploadProgress(null);
    } catch (err: unknown) {
      setUploadProgress(null);
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    }
  };

  // 3. Gallery Upload Handler
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const newItems: MediaItem[] = [...gallery];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const validation = mediaService.validateMediaFile(file, isVideo ? 'video' : 'image');

      if (!validation.valid) {
        setUploadError(`File "${file.name}": ${validation.error}`);
        continue;
      }

      try {
        const result = await mediaService.uploadWithProgress(file, 'gallery', (pct) => {
          setUploadProgress(Math.round(((i + pct / 100) / files.length) * 100));
        });

        newItems.push({
          type: isVideo ? 'video' : 'image',
          url: result.url,
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        });
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Failed to upload one or more files.');
      }
    }

    setUploadProgress(null);
    setGallery(newItems);
    await saveUpdates({ media_gallery: newItems });
  };

  // Gallery Item Controls
  const handleMoveGalleryItem = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;

    const reordered = [...gallery];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setGallery(reordered);
    await saveUpdates({ media_gallery: reordered });
  };

  const handleUpdateCaption = async (index: number, caption: string) => {
    const updated = [...gallery];
    updated[index] = { ...updated[index], caption };
    setGallery(updated);
  };

  const handleSaveCaptions = async () => {
    await saveUpdates({ media_gallery: gallery });
  };

  const handleRemoveGalleryItem = async (index: number) => {
    const item = gallery[index];
    const filtered = gallery.filter((_, i) => i !== index);
    setGallery(filtered);
    await saveUpdates({ media_gallery: filtered });

    if (item.url) {
      await mediaService.deleteStorageAsset(item.url);
    }
  };

  // 4. Custom 3D Model (.glb) Upload Handler
  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = mediaService.validateMediaFile(file, 'model');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid 3D asset.');
      return;
    }

    try {
      setUploadError(null);
      const result = await mediaService.uploadWithProgress(file, 'models', (pct) => {
        setUploadProgress(pct);
      });

      setCustomModelUrl(result.url);
      setNodeStyle('custom_glb');
      setUploadProgress(null);

      await saveUpdates({
        custom_model_url: result.url,
        node_style: 'custom_glb',
      });
    } catch (err: unknown) {
      setUploadProgress(null);
      setUploadError(err instanceof Error ? err.message : 'Model upload failed.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media Manager Modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6 pointer-events-auto select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#090912] border border-white/[0.12] rounded-sm shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-foreground font-sans animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <header className="flex-shrink-0 h-16 border-b border-white/[0.08] px-6 flex items-center justify-between bg-[#06060c]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary border border-primary/25">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <MonoLabel className="text-[10px] tracking-wider text-muted-foreground">
                PORTFOLIO MEDIA ASSET MANAGER
              </MonoLabel>
              <Heading level={2} className="text-base font-bold text-white tracking-tight truncate max-w-md">
                {project.title}
              </Heading>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 border border-white/[0.08] text-muted-foreground hover:text-white"
            aria-label="Close Media Manager"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/[0.08] bg-black/40 px-6 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('thumbnail')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === 'thumbnail'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>THUMBNAIL</span>
          </button>

          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === 'hero'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>HERO SHOWCASE</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === 'gallery'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>GALLERY ({gallery.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === 'model'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-white'
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span>3D GLB ASSET</span>
          </button>
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress !== null && (
          <div className="bg-primary/10 border-b border-primary/20 px-6 py-2 flex items-center justify-between font-mono text-xs text-primary">
            <span>UPLOADING TO SUPABASE STORAGE...</span>
            <span>{uploadProgress}%</span>
            <div className="absolute left-0 bottom-0 h-0.5 bg-primary transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        {/* Status Alerts */}
        {uploadError && (
          <div className="mx-6 mt-4 p-3 rounded-sm bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-sm bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {/* TAB 1: THUMBNAIL */}
          {activeTab === 'thumbnail' && (
            <div className="space-y-6">
              <div>
                <MonoLabel className="text-[10px] text-muted-foreground block mb-1">
                  PRIMARY SPECIFICATION EXHIBIT THUMBNAIL
                </MonoLabel>
                <p className="text-xs text-muted-foreground font-mono">
                  High-resolution preview displayed on the 3D node holographic viewfinder and case study dossier. Max 10MB (JPEG, PNG, WebP).
                </p>
              </div>

              {thumbnailUrl ? (
                <div className="relative max-w-md aspect-video rounded-sm overflow-hidden border border-white/10 bg-black group">
                  <img
                    src={thumbnailUrl}
                    alt="Project Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-3 py-1.5 rounded-sm bg-white/20 hover:bg-white/30 text-white font-mono text-xs transition-colors flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleThumbnailUpload}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={async () => {
                        setThumbnailUrl('');
                        await saveUpdates({ thumbnail_url: '' });
                      }}
                      className="px-3 py-1.5 rounded-sm bg-red-500/30 hover:bg-red-500/50 text-red-200 font-mono text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center max-w-md aspect-video rounded-sm border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/40 cursor-pointer transition-all p-6">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="font-mono text-xs text-white font-medium">Click or Drag Thumbnail to Upload</span>
                  <span className="font-mono text-[10px] text-muted-foreground mt-1">JPEG, PNG, WebP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                </label>
              )}
            </div>
          )}

          {/* TAB 2: HERO SHOWCASE */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div>
                <MonoLabel className="text-[10px] text-muted-foreground block mb-1">
                  HERO MEDIA SHOWCASE
                </MonoLabel>
                <p className="text-xs text-muted-foreground font-mono">
                  Top visual banner displayed in the technical dossier modal. Supports high-resolution widescreen stills or dynamic video walkthroughs (Max 50MB for video, 10MB for image).
                </p>
              </div>

              {heroMedia ? (
                <div className="relative max-w-xl aspect-video rounded-sm overflow-hidden border border-white/10 bg-black group">
                  {videoUrl ? (
                    <video src={videoUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={heroMedia} alt="Hero Media" className="w-full h-full object-cover" />
                  )}

                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <label className="cursor-pointer px-2.5 py-1 rounded-sm bg-black/80 hover:bg-black text-white font-mono text-[10px] transition-colors border border-white/20">
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleHeroUpload}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={async () => {
                        setHeroMedia('');
                        setVideoUrl('');
                        await saveUpdates({ hero_media: null, video_url: null });
                      }}
                      className="px-2.5 py-1 rounded-sm bg-red-950/80 hover:bg-red-900 text-red-200 font-mono text-[10px] transition-colors border border-red-500/30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center max-w-xl aspect-video rounded-sm border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/40 cursor-pointer transition-all p-6">
                  <Film className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="font-mono text-xs text-white font-medium">Upload Hero Image or Video Walkthrough</span>
                  <span className="font-mono text-[10px] text-muted-foreground mt-1">MP4, WebM (up to 50MB) or PNG/WebP (up to 10MB)</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleHeroUpload}
                  />
                </label>
              )}
            </div>
          )}

          {/* TAB 3: VISUAL GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <MonoLabel className="text-[10px] text-muted-foreground block mb-1">
                    PROJECT SCHEMATICS & SCREENSHOTS GALLERY
                  </MonoLabel>
                  <p className="text-xs text-muted-foreground font-mono">
                    Upload multiple architectural diagrams, benchmarks, and captures. Reorder items or update alt text/captions.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-primary text-black font-mono text-xs font-semibold cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Files</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>

              {/* Gallery Items List */}
              {gallery.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-sm font-mono text-xs text-muted-foreground">
                  No visual assets in gallery. Click "Upload Files" to attach screenshots.
                </div>
              ) : (
                <div className="space-y-3">
                  {gallery.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-sm bg-[#06060c] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-24 rounded-sm overflow-hidden bg-black border border-white/10 shrink-0">
                          {item.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/60 text-white">
                              <Film className="h-4 w-4" />
                            </div>
                          ) : (
                            <img src={item.url} alt={item.caption || 'Asset'} className="w-full h-full object-cover" />
                          )}
                          <span className="absolute bottom-0.5 right-0.5 text-[8px] px-1 py-0.2 bg-black/80 text-white font-semibold">
                            {item.type.toUpperCase()}
                          </span>
                        </div>

                        {/* Editable Caption / Alt text */}
                        <div className="flex-1 min-w-[200px]">
                          <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">
                            Caption & Alt Description
                          </label>
                          <input
                            type="text"
                            value={item.caption || ''}
                            onChange={(e) => handleUpdateCaption(idx, e.target.value)}
                            onBlur={handleSaveCaptions}
                            placeholder="Architectural schematic description..."
                            className="w-full px-2 py-1 rounded-sm bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/60"
                          />
                        </div>
                      </div>

                      {/* Controls: Reorder & Delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => handleMoveGalleryItem(idx, 'up')}
                          disabled={idx === 0}
                          className="h-7 w-7 flex items-center justify-center rounded-sm border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                          title="Move Earlier"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleMoveGalleryItem(idx, 'down')}
                          disabled={idx === gallery.length - 1}
                          className="h-7 w-7 flex items-center justify-center rounded-sm border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white"
                          title="Move Later"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleRemoveGalleryItem(idx)}
                          className="h-7 w-7 flex items-center justify-center rounded-sm border border-red-500/30 hover:bg-red-500/20 text-red-400"
                          title="Delete Asset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 3D GLB ASSET */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              <div>
                <MonoLabel className="text-[10px] text-muted-foreground block mb-1">
                  CUSTOM 3D ARTIFACT (.GLB)
                </MonoLabel>
                <p className="text-xs text-muted-foreground font-mono">
                  Attach an optimized binary glTF (.glb) model to replace the procedural quantum polyhedron on the 3D track. Maximum size: 25MB.
                </p>
              </div>

              {customModelUrl ? (
                <div className="p-4 rounded-sm bg-[#06060c] border border-white/10 space-y-4 max-w-lg font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-primary" />
                      <span className="text-white font-medium">CUSTOM GLB LOADED</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">ACTIVE</span>
                  </div>

                  <p className="text-muted-foreground break-all text-[11px] bg-black/50 p-2 rounded-sm border border-white/5">
                    {customModelUrl}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-sm bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors">
                      <span>Replace .GLB</span>
                      <input
                        type="file"
                        accept=".glb"
                        className="hidden"
                        onChange={handleModelUpload}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={async () => {
                        setCustomModelUrl('');
                        setNodeStyle('hologram_pedestal');
                        await saveUpdates({
                          custom_model_url: null,
                          node_style: 'hologram_pedestal',
                        });
                      }}
                      className="px-3 py-1.5 rounded-sm bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-mono border border-red-500/30 transition-colors"
                    >
                      Revert to Procedural
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center max-w-lg aspect-video rounded-sm border-2 border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/40 cursor-pointer transition-all p-6">
                  <Box className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="font-mono text-xs text-white font-medium">Upload Binary glTF (.glb) Asset</span>
                  <span className="font-mono text-[10px] text-muted-foreground mt-1">Binary format (.glb) up to 25MB</span>
                  <input
                    type="file"
                    accept=".glb"
                    className="hidden"
                    onChange={handleModelUpload}
                  />
                </label>
              )}

              {/* Node Style Selector */}
              <div className="pt-4 border-t border-white/[0.08] max-w-lg space-y-2 font-mono text-xs">
                <label className="text-muted-foreground uppercase text-[10px] block">
                  3D Visual Archetype Preset
                </label>
                <select
                  value={nodeStyle}
                  onChange={async (e) => {
                    const nextStyle = e.target.value as Project['node_style'];
                    setNodeStyle(nextStyle);
                    await saveUpdates({ node_style: nextStyle });
                  }}
                  className="w-full px-3 py-2 rounded-sm bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-primary"
                >
                  <option value="hologram_pedestal">Hologram Pedestal (Procedural Diamond)</option>
                  <option value="cyber_terminal">Cyber Terminal (Procedural Monolith)</option>
                  <option value="data_monolith">Data Monolith (Procedural Obelisk)</option>
                  <option value="custom_glb">Custom GLB Model (Requires .glb URL)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <footer className="flex-shrink-0 h-14 border-t border-white/[0.08] px-6 flex items-center justify-between bg-[#06060c] font-mono text-xs">
          <span className="text-muted-foreground text-[11px]">
            {isSaving ? 'SAVING SPECIFICATION...' : 'ALL CHANGES AUTO-SAVED'}
          </span>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="px-4 text-xs font-semibold"
          >
            Done
          </Button>
        </footer>
      </div>
    </div>
  );
};
