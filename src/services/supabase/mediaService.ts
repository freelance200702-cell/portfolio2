import { getSupabaseClient } from './client';
import { sanitizeStorageFileName } from '@/lib/validation';

export type MediaTypeCategory = 'image' | 'video' | 'model';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const MEDIA_LIMITS = {
  IMAGE_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
  VIDEO_MAX_BYTES: 50 * 1024 * 1024, // 50 MB
  MODEL_MAX_BYTES: 25 * 1024 * 1024, // 25 MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_MODEL_EXTENSIONS: ['.glb', '.gltf'],
};

export const mediaService = {
  /**
   * Validates a media file for size and MIME/extension conformity.
   */
  validateMediaFile(file: File, expectedType: MediaTypeCategory): FileValidationResult {
    if (!file) {
      return { valid: false, error: 'No file provided.' };
    }

    const name = file.name.toLowerCase();

    switch (expectedType) {
      case 'image': {
        if (file.size > MEDIA_LIMITS.IMAGE_MAX_BYTES) {
          return {
            valid: false,
            error: `Image exceeds maximum permitted size of 10MB (Current: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          };
        }
        if (!MEDIA_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return {
            valid: false,
            error: `Unsupported image format (${file.type || 'unknown'}). Supported formats: JPEG, PNG, WebP, GIF.`,
          };
        }
        return { valid: true };
      }

      case 'video': {
        if (file.size > MEDIA_LIMITS.VIDEO_MAX_BYTES) {
          return {
            valid: false,
            error: `Video exceeds maximum permitted size of 50MB (Current: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          };
        }
        if (!MEDIA_LIMITS.ALLOWED_VIDEO_TYPES.includes(file.type)) {
          return {
            valid: false,
            error: `Unsupported video format (${file.type || 'unknown'}). Supported formats: MP4, WebM, OGG.`,
          };
        }
        return { valid: true };
      }

      case 'model': {
        if (file.size > MEDIA_LIMITS.MODEL_MAX_BYTES) {
          return {
            valid: false,
            error: `3D Model exceeds maximum permitted size of 25MB (Current: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          };
        }
        const hasValidExt = MEDIA_LIMITS.ALLOWED_MODEL_EXTENSIONS.some((ext) => name.endsWith(ext));
        if (!hasValidExt) {
          return {
            valid: false,
            error: 'Unsupported 3D asset format. Only binary glTF (.glb) files are accepted.',
          };
        }
        return { valid: true };
      }

      default:
        return { valid: false, error: 'Unknown asset category requested.' };
    }
  },

  /**
   * Uploads a validated file to Supabase Storage with progressive feedback.
   */
  async uploadWithProgress(
    file: File,
    folder: string,
    onProgress?: (percent: number) => void
  ): Promise<{ url: string; path: string }> {
    const client = getSupabaseClient();

    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'general';
    const sanitizedName = sanitizeStorageFileName(file.name);

    // Local dev mode fallback with object URL
    if (!client) {
      if (onProgress) {
        onProgress(35);
        await new Promise((r) => setTimeout(r, 60));
        onProgress(75);
        await new Promise((r) => setTimeout(r, 60));
        onProgress(100);
      }
      const localUrl = URL.createObjectURL(file);
      return { url: localUrl, path: `local/${cleanFolder}/${sanitizedName}` };
    }

    const fileExt = sanitizedName.split('.').pop() || '';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const storagePath = `${cleanFolder}/${cleanFileName}`;

    if (onProgress) onProgress(15);

    // Perform Supabase Storage upload
    const { data, error } = await client.storage
      .from('project-media')
      .upload(storagePath, file, {
        cacheControl: '31536000', // 1 year immutable cache
        upsert: true,
      });

    if (error || !data) {
      throw new Error(error?.message || 'Storage upload failed.');
    }

    if (onProgress) onProgress(85);

    const {
      data: { publicUrl },
    } = client.storage.from('project-media').getPublicUrl(storagePath);

    if (onProgress) onProgress(100);

    return {
      url: publicUrl,
      path: storagePath,
    };
  },

  /**
   * Deletes a media asset from Supabase Storage given its public URL or relative path.
   */
  async deleteStorageAsset(urlOrPath: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client || !urlOrPath) return true;

    try {
      let path = urlOrPath;
      if (urlOrPath.includes('/project-media/')) {
        path = urlOrPath.split('/project-media/')[1];
      }

      const { error } = await client.storage.from('project-media').remove([path]);
      return !error;
    } catch {
      return false;
    }
  },
};
