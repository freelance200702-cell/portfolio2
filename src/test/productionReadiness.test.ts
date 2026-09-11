import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isSafeUrl,
  sanitizeSafeUrl,
  openSafeExternalUrl,
  isValidSlug,
  isValidHexColor,
  sanitizeStorageFileName,
} from '@/lib/validation';
import { detectDeviceCapabilities } from '@/lib/deviceDetection';
import { useAuthStore } from '@/stores/useAuthStore';
import { env } from '@/lib/env';

describe('Production Readiness & Security Hardening Audit', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. URL Sanitization & Protocol Injection Defense', () => {
    it('accepts legitimate HTTPS and HTTP web endpoints', () => {
      expect(isSafeUrl('https://github.com/adel/vulkan-engine')).toBe(true);
      expect(isSafeUrl('http://localhost:3000')).toBe(true);
      expect(isSafeUrl('https://demo.portfolio.dev/live?param=1')).toBe(true);
    });

    it('strictly blocks javascript: protocol XSS attacks', () => {
      expect(isSafeUrl('javascript:alert(document.cookie)')).toBe(false);
      expect(isSafeUrl('JAVASCRIPT:fetch("https://attacker.com")')).toBe(false);
      expect(isSafeUrl(' javascript:void(0) ')).toBe(false);
    });

    it('blocks data: and vbscript: URI payloads', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('file:///etc/passwd')).toBe(false);
    });

    it('rejects malformed, empty, or protocol-relative URLs', () => {
      expect(isSafeUrl('')).toBe(false);
      expect(isSafeUrl('   ')).toBe(false);
      expect(isSafeUrl(null)).toBe(false);
      expect(isSafeUrl(undefined)).toBe(false);
      expect(isSafeUrl('//evil.com/payload')).toBe(false);
    });

    it('sanitizeSafeUrl returns sanitized string or null', () => {
      expect(sanitizeSafeUrl('  https://example.com/demo  ')).toBe('https://example.com/demo');
      expect(sanitizeSafeUrl('javascript:malicious()')).toBeNull();
    });

    it('openSafeExternalUrl invokes window.open with noopener,noreferrer', () => {
      const openMock = vi.fn();
      vi.stubGlobal('window', { open: openMock });

      const opened = openSafeExternalUrl('https://github.com/adel');
      expect(opened).toBe(true);
      expect(openMock).toHaveBeenCalledWith('https://github.com/adel', '_blank', 'noopener,noreferrer');
    });

    it('openSafeExternalUrl refuses to open malicious URLs', () => {
      const openMock = vi.fn();
      vi.stubGlobal('window', { open: openMock });

      const opened = openSafeExternalUrl('javascript:alert(1)');
      expect(opened).toBe(false);
      expect(openMock).not.toHaveBeenCalled();
    });
  });

  describe('2. Input & Route Parameter Validation', () => {
    it('validates strictly formatted URL slugs', () => {
      expect(isValidSlug('neural-inference-engine')).toBe(true);
      expect(isValidSlug('vulkan-2026')).toBe(true);
      expect(isValidSlug('systems')).toBe(true);

      // Rejects uppercase, spaces, special chars, traversal
      expect(isValidSlug('Neural Inference')).toBe(false);
      expect(isValidSlug('vulkan_engine')).toBe(false);
      expect(isValidSlug('../secret-slug')).toBe(false);
      expect(isValidSlug('-leading-dash')).toBe(false);
      expect(isValidSlug('trailing-dash-')).toBe(false);
    });

    it('validates 3-digit and 6-digit hex color strings', () => {
      expect(isValidHexColor('#38bdf8')).toBe(true);
      expect(isValidHexColor('#0284c7')).toBe(true);
      expect(isValidHexColor('#fff')).toBe(true);

      expect(isValidHexColor('38bdf8')).toBe(false); // missing #
      expect(isValidHexColor('#xyz123')).toBe(false); // non-hex
      expect(isValidHexColor('rgb(0,0,0)')).toBe(false);
    });

    it('sanitizes storage filenames preventing path traversal', () => {
      expect(sanitizeStorageFileName('../../etc/passwd.png')).toBe('passwd.png');
      expect(sanitizeStorageFileName('malicious\\path\\file.glb')).toBe('file.glb');
      expect(sanitizeStorageFileName('valid-asset-2026.webp')).toBe('valid-asset-2026.webp');
      expect(sanitizeStorageFileName('')).toBe('asset');
    });
  });

  describe('3. Production Fail-Closed Authentication', () => {
    it('blocks automatic dev admin bypass when running in production environment', async () => {
      // Mock unconfigured production environment
      const originalIsConfigured = env.isConfigured;
      const originalIsProduction = env.isProduction;

      (env as { isConfigured: boolean }).isConfigured = false;
      (env as { isProduction: boolean }).isProduction = true;

      useAuthStore.setState({
        user: null,
        isAdmin: false,
        isLoading: true,
        isInitialized: false,
      });

      await useAuthStore.getState().initialize();

      // In production without credentials, it must FAIL CLOSED
      expect(useAuthStore.getState().isAdmin).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().authError).toContain('Production configuration error');

      // Attempting login must also fail closed
      const loginSuccess = await useAuthStore.getState().login('admin@test.com', 'pass');
      expect(loginSuccess).toBe(false);
      expect(useAuthStore.getState().isAdmin).toBe(false);

      // Restore environment flags
      (env as { isConfigured: boolean }).isConfigured = originalIsConfigured;
      (env as { isProduction: boolean }).isProduction = originalIsProduction;
    });
  });

  describe('4. Accessibility & Reduced Motion Defense', () => {
    it('automatically defaults to reduced_3d preset when user has prefers-reduced-motion', () => {
      vi.stubGlobal('window', {
        innerWidth: 1440,
        innerHeight: 900,
        devicePixelRatio: 1,
        matchMedia: vi.fn().mockImplementation((query: string) => {
          if (query.includes('prefers-reduced-motion')) {
            return { matches: true }; // User requested reduced motion
          }
          return { matches: false };
        }),
      });

      const capabilities = detectDeviceCapabilities();
      expect(capabilities.recommendedPreset).toBe('reduced_3d');
    });
  });
});
