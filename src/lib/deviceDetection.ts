export type DeviceTier = 'desktop' | 'tablet' | 'mobile' | 'constrained';
export type QualityPreset = 'cinematic' | 'balanced' | 'mobile' | 'reduced_3d';

export interface DeviceCapabilities {
  tier: DeviceTier;
  recommendedPreset: QualityPreset;
  isTouch: boolean;
  isNarrow: boolean; // width < 400px
  width: number;
  height: number;
  pixelRatio: number;
  supportsWebGL: boolean;
  prefersReducedMotion: boolean;
  gpuRenderer?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
}

/**
 * Probes WebGL context creation and extracts renderer info safely without crashing.
 */
export function probeWebGLSupport(): { supported: boolean; renderer?: string } {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { supported: true };
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      return { supported: false };
    }

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : undefined;

    return { supported: true, renderer };
  } catch {
    return { supported: false };
  }
}

/**
 * Detects whether the current device is constrained (e.g. software rasterizer, low RAM, or missing WebGL).
 */
export function isConstrainedDevice(webglSupported: boolean, renderer?: string): boolean {
  if (!webglSupported) return true;

  if (typeof navigator !== 'undefined') {
    // navigator.deviceMemory in GB (if available in modern Chromium)
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (memory !== undefined && memory <= 2) {
      return true;
    }

    // Single-core or low-thread CPUs
    if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2) {
      return true;
    }
  }

  // Detect software renderers like SwiftShader or LLVMpipe
  if (renderer) {
    const lower = renderer.toLowerCase();
    if (
      lower.includes('swiftshader') ||
      lower.includes('llvmpipe') ||
      lower.includes('software rasterizer') ||
      lower.includes('basic render')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluates current device capabilities and determines the optimal quality tier.
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const isClient = typeof window !== 'undefined';
  const width = isClient ? window.innerWidth : 1920;
  const height = isClient ? window.innerHeight : 1080;
  const pixelRatio = isClient ? window.devicePixelRatio || 1 : 1;

  const isTouch =
    isClient &&
    (Boolean('ontouchstart' in window) ||
      (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0));

  const isNarrow = width < 400;

  const prefersReducedMotion =
    isClient &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { supported: supportsWebGL, renderer: gpuRenderer } = probeWebGLSupport();
  const constrained = isConstrainedDevice(supportsWebGL, gpuRenderer);

  let tier: DeviceTier = 'desktop';
  let recommendedPreset: QualityPreset = 'cinematic';

  if (!supportsWebGL || constrained) {
    tier = 'constrained';
    recommendedPreset = 'reduced_3d';
  } else if (width < 768) {
    tier = 'mobile';
    recommendedPreset = prefersReducedMotion ? 'reduced_3d' : 'mobile';
  } else if (width < 1024) {
    tier = 'tablet';
    recommendedPreset = prefersReducedMotion ? 'reduced_3d' : 'balanced';
  } else {
    tier = 'desktop';
    recommendedPreset = prefersReducedMotion ? 'reduced_3d' : 'cinematic';
  }

  return {
    tier,
    recommendedPreset,
    isTouch,
    isNarrow,
    width,
    height,
    pixelRatio,
    supportsWebGL,
    prefersReducedMotion,
    gpuRenderer,
    hardwareConcurrency: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined,
    deviceMemory: typeof navigator !== 'undefined' ? (navigator as unknown as { deviceMemory?: number }).deviceMemory : undefined,
  };
}
