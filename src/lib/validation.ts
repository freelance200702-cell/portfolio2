/**
 * Security & Input Validation Utilities
 * Defends against XSS, URL injection, path traversal, and malformed inputs.
 */

// Strict protocol whitelist: only http and https are allowed for external web links
const SAFE_URL_PROTOCOL_REGEX = /^https?:\/\//i;

// Slugs must be lowercase alphanumeric with hyphens, no leading/trailing hyphens
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Hex color validator (#fff or #ffffff)
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Validates whether a given URL string is safe to navigate to or render.
 * Strictly rejects javascript:, data:, vbscript:, file:, and control characters.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Reject javascript:, data:, vbscript:, blob: (unless safe internal)
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  // Must start with http:// or https://
  if (!SAFE_URL_PROTOCOL_REGEX.test(trimmed)) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns the sanitized URL if safe, or null if potentially malicious.
 */
export function sanitizeSafeUrl(url: string | null | undefined): string | null {
  return isSafeUrl(url) ? (url as string).trim() : null;
}

/**
 * Safely opens an external URL in a new browser tab with noopener,noreferrer
 * preventing reverse tabnabbing and window.opener hijacking attacks.
 */
export function openSafeExternalUrl(url: string | null | undefined): boolean {
  const safeUrl = sanitizeSafeUrl(url);
  if (!safeUrl || typeof window === 'undefined') {
    return false;
  }

  window.open(safeUrl, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Validates URL slug formatting for routes.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  return SLUG_REGEX.test(slug.trim());
}

/**
 * Validates 3-digit or 6-digit hexadecimal color string.
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  return HEX_COLOR_REGEX.test(color.trim());
}

/**
 * Sanitizes a storage file name to prevent path traversal (../)
 * and special characters that could exploit cloud storage keys.
 */
export function sanitizeStorageFileName(rawName: string): string {
  if (!rawName) return 'asset';

  // 1. Extract base filename (strip any path directory separators)
  const baseName = rawName.split(/[/\\\\]/).pop() || 'asset';

  // 2. Separate extension
  const parts = baseName.split('.');
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  const nameWithoutExt = parts.join('.');

  // 3. Remove all non-alphanumeric characters except hyphens and underscores
  const cleanBase = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 80);
  const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);

  return cleanExt ? `${cleanBase || 'asset'}.${cleanExt}` : cleanBase || 'asset';
}
