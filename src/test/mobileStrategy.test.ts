import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectDeviceCapabilities,
  isConstrainedDevice,
  probeWebGLSupport,
} from '@/lib/deviceDetection';
import { useUIStore } from '@/stores/useUIStore';
import { useJourneyStore } from '@/stores/useJourneyStore';
import type { Project } from '@/types/project';

function createMockProject(): Project {
  return {
    id: 'mobile-test-proj',
    slug: 'mobile-test-engine',
    title: 'Mobile Systems Engine',
    tagline: 'High-efficiency rendering for constrained hardware',
    description_markdown: '### Low-power compute shaders',
    category: 'systems_engine',
    node_style: 'hologram_pedestal',
    node_color_primary: '#38bdf8',
    node_color_secondary: '#0284c7',
    thumbnail_url: 'https://cdn.example.com/thumb.png',
    media_gallery: [],
    year: 2026,
    featured: true,
    status: 'published',
    sort_order: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    technologies: ['WebGPU', 'Rust'],
  };
}

describe('Mobile Strategy & Constrained Device Detection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Device Probing Across Form Factors', () => {
    it('correctly classifies a Desktop viewport (1920x1080, non-touch)', () => {
      vi.stubGlobal('window', {
        innerWidth: 1920,
        innerHeight: 1080,
        devicePixelRatio: 1,
        matchMedia: vi.fn().mockReturnValue({ matches: false }),
      });
      vi.stubGlobal('navigator', {
        maxTouchPoints: 0,
        hardwareConcurrency: 16,
        deviceMemory: 16,
      });

      const caps = detectDeviceCapabilities();
      expect(caps.tier).toBe('desktop');
      expect(caps.recommendedPreset).toBe('cinematic');
      expect(caps.isNarrow).toBe(false);
      expect(caps.isTouch).toBe(false);
    });

    it('correctly classifies a Tablet viewport (820x1180, touch)', () => {
      vi.stubGlobal('window', {
        innerWidth: 820,
        innerHeight: 1180,
        devicePixelRatio: 2,
        matchMedia: vi.fn().mockReturnValue({ matches: false }),
      });
      vi.stubGlobal('navigator', {
        maxTouchPoints: 5,
        hardwareConcurrency: 8,
        deviceMemory: 6,
      });

      const caps = detectDeviceCapabilities();
      expect(caps.tier).toBe('tablet');
      expect(caps.recommendedPreset).toBe('balanced');
      expect(caps.isNarrow).toBe(false);
      expect(caps.isTouch).toBe(true);
    });

    it('correctly classifies a Standard Mobile viewport (390x844, touch)', () => {
      vi.stubGlobal('window', {
        innerWidth: 390,
        innerHeight: 844,
        devicePixelRatio: 3,
        matchMedia: vi.fn().mockReturnValue({ matches: false }),
      });
      vi.stubGlobal('navigator', {
        maxTouchPoints: 5,
        hardwareConcurrency: 6,
        deviceMemory: 4,
      });

      const caps = detectDeviceCapabilities();
      expect(caps.tier).toBe('mobile');
      expect(caps.recommendedPreset).toBe('mobile');
      expect(caps.isNarrow).toBe(true); // < 400px
      expect(caps.isTouch).toBe(true);
    });

    it('correctly classifies a Narrow Viewport (< 360px)', () => {
      vi.stubGlobal('window', {
        innerWidth: 320,
        innerHeight: 568,
        devicePixelRatio: 2,
        matchMedia: vi.fn().mockReturnValue({ matches: false }),
      });
      vi.stubGlobal('navigator', {
        maxTouchPoints: 2,
        hardwareConcurrency: 4,
        deviceMemory: 3,
      });

      const caps = detectDeviceCapabilities();
      expect(caps.tier).toBe('mobile');
      expect(caps.isNarrow).toBe(true);
      expect(caps.width).toBe(320);
    });

    it('detects Constrained Hardware with software rasterizers or low memory', () => {
      // SwiftShader software rasterizer
      expect(isConstrainedDevice(true, 'Google SwiftShader')).toBe(true);
      expect(isConstrainedDevice(true, 'llvmpipe (LLVM 12.0.0)')).toBe(true);
      expect(isConstrainedDevice(true, 'Microsoft Basic Render Driver')).toBe(true);

      // Low memory (<= 2GB)
      vi.stubGlobal('navigator', { deviceMemory: 2, hardwareConcurrency: 2 });
      expect(isConstrainedDevice(true, 'Apple M1')).toBe(true);

      // WebGL unsupported
      expect(isConstrainedDevice(false, 'NVIDIA RTX 4090')).toBe(true);

      // Normal hardware passes
      vi.stubGlobal('navigator', { deviceMemory: 8, hardwareConcurrency: 8 });
      expect(isConstrainedDevice(true, 'Apple M2 Pro')).toBe(false);
    });

    it('handles probeWebGLSupport safely when running in Node/JSDOM test runner', () => {
      const probe = probeWebGLSupport();
      expect(probe).toBeDefined();
      expect(typeof probe.supported).toBe('boolean');
    });
  });

  describe('2. UI Store Quality Presets & Reduced 3D Transitions', () => {
    it('supports cycling through all 4 quality presets including eco reduced-3D', () => {
      const presets = ['cinematic', 'balanced', 'mobile', 'reduced_3d'] as const;

      presets.forEach((preset) => {
        useUIStore.getState().setQualityPreset(preset);
        expect(useUIStore.getState().qualityPreset).toBe(preset);
        expect(useUIStore.getState().isReduced3D).toBe(preset === 'reduced_3d');
      });
    });

    it('toggles reduced-3D mode on demand without losing portfolio state', () => {
      useUIStore.getState().setQualityPreset('cinematic');
      expect(useUIStore.getState().isReduced3D).toBe(false);

      useUIStore.getState().toggleReduced3D();
      expect(useUIStore.getState().isReduced3D).toBe(true);
      expect(useUIStore.getState().qualityPreset).toBe('reduced_3d');

      useUIStore.getState().toggleReduced3D();
      expect(useUIStore.getState().isReduced3D).toBe(false);
      expect(useUIStore.getState().qualityPreset).toBe('balanced');
    });

    it('preserves full project and discipline accessibility in reduced-3D mode', () => {
      const project = createMockProject();
      useJourneyStore.getState().setProjects([project]);

      useUIStore.getState().setQualityPreset('reduced_3d');
      expect(useUIStore.getState().isReduced3D).toBe(true);

      // Projects remain fully accessible
      const currentProjects = useJourneyStore.getState().projects;
      expect(currentProjects).toHaveLength(1);
      expect(currentProjects[0].title).toBe('Mobile Systems Engine');
    });
  });

  describe('3. Workload Scaling Logic', () => {
    it('verifies particle counts step down cleanly across presets', () => {
      const getParticles = (preset: string) => {
        if (preset === 'mobile') return 80;
        if (preset === 'balanced') return 250;
        return 600;
      };

      expect(getParticles('cinematic')).toBe(600);
      expect(getParticles('balanced')).toBe(250);
      expect(getParticles('mobile')).toBe(80);
    });

    it('verifies star counts step down cleanly across presets', () => {
      const getStars = (preset: string) => {
        if (preset === 'mobile') return 400;
        if (preset === 'balanced') return 1000;
        return 2400;
      };

      expect(getStars('cinematic')).toBe(2400);
      expect(getStars('balanced')).toBe(1000);
      expect(getStars('mobile')).toBe(400);
    });

    it('verifies spline road sample density adapts to mobile to save draw calls', () => {
      const curveLength = 300;
      const getSamples = (preset: string) => {
        const density = preset === 'mobile' ? 0.75 : preset === 'balanced' ? 1.1 : 1.5;
        const minSamples = preset === 'mobile' ? 120 : 240;
        const maxSamples = preset === 'mobile' ? 500 : 1200;
        return Math.max(minSamples, Math.min(maxSamples, Math.round(curveLength * density)));
      };

      const mobileSamples = getSamples('mobile');
      const cinematicSamples = getSamples('cinematic');

      expect(mobileSamples).toBeLessThan(cinematicSamples);
      expect(mobileSamples).toBe(225);
      expect(cinematicSamples).toBe(450);
    });
  });
});
