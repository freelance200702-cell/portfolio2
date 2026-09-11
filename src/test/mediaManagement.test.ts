import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mediaService, MEDIA_LIMITS } from '@/services/supabase/mediaService';
import * as supabaseClientModule from '@/services/supabase/client';

type ClientReturnType = ReturnType<typeof supabaseClientModule.getSupabaseClient>;

describe('Portfolio Media Management System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. File Type & Size Validation Rules', () => {
    it('approves compliant image files (JPEG, PNG, WebP, GIF <= 10MB)', () => {
      const validJpg = new File([new Uint8Array(1024 * 100)], 'hero.jpg', { type: 'image/jpeg' });
      const validPng = new File([new Uint8Array(1024 * 500)], 'preview.png', { type: 'image/png' });
      const validWebp = new File([new Uint8Array(1024 * 300)], 'banner.webp', { type: 'image/webp' });
      const validGif = new File([new Uint8Array(1024 * 200)], 'anim.gif', { type: 'image/gif' });

      expect(mediaService.validateMediaFile(validJpg, 'image').valid).toBe(true);
      expect(mediaService.validateMediaFile(validPng, 'image').valid).toBe(true);
      expect(mediaService.validateMediaFile(validWebp, 'image').valid).toBe(true);
      expect(mediaService.validateMediaFile(validGif, 'image').valid).toBe(true);
    });

    it('rejects oversized images (> 10MB)', () => {
      const oversizedImage = new File(
        [new Uint8Array(MEDIA_LIMITS.IMAGE_MAX_BYTES + 1024)],
        'massive_photo.png',
        { type: 'image/png' }
      );

      const result = mediaService.validateMediaFile(oversizedImage, 'image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10MB');
    });

    it('rejects forbidden image formats (PDF, SVG, TIFF, Executables)', () => {
      const pdfFile = new File([new Uint8Array(1024)], 'document.pdf', { type: 'application/pdf' });
      const svgFile = new File([new Uint8Array(1024)], 'vector.svg', { type: 'image/svg+xml' });

      const resPdf = mediaService.validateMediaFile(pdfFile, 'image');
      expect(resPdf.valid).toBe(false);
      expect(resPdf.error).toContain('Unsupported image format');

      const resSvg = mediaService.validateMediaFile(svgFile, 'image');
      expect(resSvg.valid).toBe(false);
      expect(resSvg.error).toContain('Unsupported image format');
    });

    it('approves compliant video assets (MP4, WebM, OGG <= 50MB)', () => {
      const validMp4 = new File([new Uint8Array(1024 * 1024 * 5)], 'demo.mp4', { type: 'video/mp4' });
      const validWebm = new File([new Uint8Array(1024 * 1024 * 8)], 'showcase.webm', { type: 'video/webm' });

      expect(mediaService.validateMediaFile(validMp4, 'video').valid).toBe(true);
      expect(mediaService.validateMediaFile(validWebm, 'video').valid).toBe(true);
    });

    it('rejects oversized videos (> 50MB)', () => {
      const oversizedVideo = new File(
        [new Uint8Array(MEDIA_LIMITS.VIDEO_MAX_BYTES + 1024)],
        'raw_4k_footage.mp4',
        { type: 'video/mp4' }
      );

      const result = mediaService.validateMediaFile(oversizedVideo, 'video');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('50MB');
    });

    it('rejects non-video formats when video expected', () => {
      const fakeVideo = new File([new Uint8Array(1024)], 'demo.avi', { type: 'video/x-msvideo' });
      const result = mediaService.validateMediaFile(fakeVideo, 'video');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported video format');
    });

    it('approves binary glTF 3D assets (.glb, .gltf <= 25MB)', () => {
      const validGlb = new File([new Uint8Array(1024 * 1024 * 2)], 'spaceship.glb', {
        type: 'model/gltf-binary',
      });
      const result = mediaService.validateMediaFile(validGlb, 'model');
      expect(result.valid).toBe(true);
    });

    it('rejects oversized 3D models (> 25MB)', () => {
      const oversizedGlb = new File(
        [new Uint8Array(MEDIA_LIMITS.MODEL_MAX_BYTES + 1024)],
        'hyper_mesh.glb',
        { type: 'model/gltf-binary' }
      );

      const result = mediaService.validateMediaFile(oversizedGlb, 'model');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('25MB');
    });

    it('rejects unsupported 3D formats (.obj, .fbx, .blend, .zip)', () => {
      const objFile = new File([new Uint8Array(1024)], 'mesh.obj', { type: 'text/plain' });
      const fbxFile = new File([new Uint8Array(1024)], 'model.fbx', { type: 'application/octet-stream' });

      expect(mediaService.validateMediaFile(objFile, 'model').valid).toBe(false);
      expect(mediaService.validateMediaFile(fbxFile, 'model').valid).toBe(false);
    });
  });

  describe('2. Progressive Upload System', () => {
    it('executes progressive upload flow and generates valid public URL in Supabase mode', async () => {
      const mockFile = new File([new Uint8Array(1024 * 50)], 'thumbnail.webp', { type: 'image/webp' });
      const progressTracker: number[] = [];

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: 'thumbnails/test-thumb.webp' },
        error: null,
      });

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://xyz.supabase.co/storage/v1/object/public/project-media/thumbnails/test-thumb.webp' },
      });

      const mockClient = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            getPublicUrl: mockGetPublicUrl,
          }),
        },
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);

      const result = await mediaService.uploadWithProgress(mockFile, 'thumbnails', (pct) => {
        progressTracker.push(pct);
      });

      expect(progressTracker.length).toBeGreaterThan(0);
      expect(progressTracker[progressTracker.length - 1]).toBe(100);
      expect(result.url).toContain('https://xyz.supabase.co/storage/v1/object/public/project-media/');
      expect(mockUpload).toHaveBeenCalled();
    });

    it('handles simulated offline / development fallback with progressive updates', async () => {
      // Supabase unconfigured / null client
      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(null);

      // Mock URL.createObjectURL
      const mockObjectUrl = 'blob:http://localhost:3000/test-blob-uuid';
      vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockObjectUrl);

      const mockFile = new File([new Uint8Array(1024)], 'fallback.png', { type: 'image/png' });
      const progressLog: number[] = [];

      const result = await mediaService.uploadWithProgress(mockFile, 'gallery', (pct) => {
        progressLog.push(pct);
      });

      expect(progressLog).toEqual([35, 75, 100]);
      expect(result.url).toBe(mockObjectUrl);
    });

    it('throws descriptive error on Supabase Storage failure', async () => {
      const mockFile = new File([new Uint8Array(1024)], 'error-file.jpg', { type: 'image/jpeg' });

      const mockClient = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Bucket access denied or quota exceeded'),
            }),
          }),
        },
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);

      await expect(mediaService.uploadWithProgress(mockFile, 'heroes')).rejects.toThrow(
        'Bucket access denied or quota exceeded'
      );
    });
  });

  describe('3. Remote Storage Deletion', () => {
    it('extracts bucket path from public URL and invokes Supabase removal', async () => {
      const mockRemove = vi.fn().mockResolvedValue({ error: null });
      const mockClient = {
        storage: {
          from: vi.fn().mockReturnValue({
            remove: mockRemove,
          }),
        },
      };

      vi.spyOn(supabaseClientModule, 'getSupabaseClient').mockReturnValue(mockClient as unknown as ClientReturnType);

      const fullPublicUrl = 'https://xyz.supabase.co/storage/v1/object/public/project-media/gallery/sample-photo.jpg';
      const success = await mediaService.deleteStorageAsset(fullPublicUrl);

      expect(success).toBe(true);
      expect(mockRemove).toHaveBeenCalledWith(['gallery/sample-photo.jpg']);
    });
  });
});
