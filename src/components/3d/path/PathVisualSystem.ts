import * as THREE from 'three';

/**
 * Procedural PBR Shader Materials and Textures for the Navigable Viaduct Highway.
 * Reusable visual system strictly separated from spline mathematics.
 * Environment-safe: Handles both browser DOM and SSR/Node test environments.
 */

export interface PathVisualConfig {
  roadWidth: number;
  deckThickness: number;
  qualityPreset: 'mobile' | 'balanced' | 'cinematic';
}

/**
 * Creates high-detail procedural canvas textures for the physical roadbed:
 * - Segmented precast concrete/carbon roadway slabs
 * - Subtle longitudinal tire wear grooves
 * - Micro-aggregate asphalt/composite surface roughness
 * - Recessed expansion joints every 6m
 */
export function createDeckDiffuseCanvas(width = 1024, height = 1024): HTMLCanvasElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Base roadway tone: Refined warm architectural stone / ivory travertine
  ctx.fillStyle = '#dbd6cc';
  ctx.fillRect(0, 0, width, height);

  // Micro-aggregate noise texture
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise - 1));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise - 3)); // Subtle warm golden shift
  }
  ctx.putImageData(imgData, 0, 0);

  // Lateral expansion joints (precast modular slabs repeating along length)
  const slabCount = 8;
  const slabHeight = height / slabCount;

  for (let s = 0; s < slabCount; s++) {
    const y = s * slabHeight;

    // Recessed architectural expansion seam (warm stone shadow)
    ctx.strokeStyle = '#8c8479';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // Subtle beveled edge highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(width, y + 2);
    ctx.stroke();
  }

  // Dual subtle tire track lanes (gentle burnished stone wear)
  const gradLeft = ctx.createLinearGradient(width * 0.15, 0, width * 0.38, 0);
  gradLeft.addColorStop(0, 'rgba(120, 110, 100, 0)');
  gradLeft.addColorStop(0.5, 'rgba(100, 92, 84, 0.14)');
  gradLeft.addColorStop(1, 'rgba(120, 110, 100, 0)');
  ctx.fillStyle = gradLeft;
  ctx.fillRect(width * 0.15, 0, width * 0.23, height);

  const gradRight = ctx.createLinearGradient(width * 0.62, 0, width * 0.85, 0);
  gradRight.addColorStop(0, 'rgba(120, 110, 100, 0)');
  gradRight.addColorStop(0.5, 'rgba(100, 92, 84, 0.14)');
  gradRight.addColorStop(1, 'rgba(120, 110, 100, 0)');
  ctx.fillStyle = gradRight;
  ctx.fillRect(width * 0.62, 0, width * 0.23, height);

  // Outer safety tactile rumble strip bands (restrained warm charcoal / stone accent)
  ctx.fillStyle = 'rgba(75, 68, 62, 0.25)';
  ctx.fillRect(0, 0, width * 0.05, height);
  ctx.fillRect(width * 0.95, 0, width * 0.05, height);

  return canvas;
}

/**
 * Creates bump / roughness normal variation canvas for physical surface relief.
 */
export function createDeckRoughnessCanvas(width = 512, height = 512): HTMLCanvasElement | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Mid roughness base
  ctx.fillStyle = '#b0b0b0';
  ctx.fillRect(0, 0, width, height);

  // High roughness at edges and seams
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40;
    const val = Math.min(255, Math.max(0, 170 + noise));
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
  ctx.putImageData(imgData, 0, 0);

  // Polished tire wear paths (lower roughness = smoother reflection)
  ctx.fillStyle = 'rgba(80, 80, 80, 0.35)';
  ctx.fillRect(width * 0.18, 0, width * 0.20, height);
  ctx.fillRect(width * 0.62, 0, width * 0.20, height);

  return canvas;
}

/**
 * Fallback procedural DataTexture for SSR or headless environments.
 */
function createFallbackTexture(color: number): THREE.DataTexture {
  const size = 16;
  const data = new Uint8Array(size * size * 4);
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  for (let i = 0; i < size * size * 4; i += 4) {
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 45);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates ready-to-use Three.js textures with appropriate repeat and filtering.
 */
export function createRoadwayTextures(): {
  diffuseMap: THREE.Texture;
  roughnessMap: THREE.Texture;
} {
  const diffCanvas = createDeckDiffuseCanvas();
  const roughCanvas = createDeckRoughnessCanvas();

  if (!diffCanvas || !roughCanvas) {
    return {
      diffuseMap: createFallbackTexture(0x161c28),
      roughnessMap: createFallbackTexture(0x999999),
    };
  }

  const diffuseMap = new THREE.CanvasTexture(diffCanvas);
  diffuseMap.wrapS = THREE.RepeatWrapping;
  diffuseMap.wrapT = THREE.RepeatWrapping;
  diffuseMap.repeat.set(1, 45); // Repeats along the journey spline
  diffuseMap.anisotropy = 8;
  diffuseMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(1, 45);
  roughnessMap.anisotropy = 8;
  roughnessMap.needsUpdate = true;

  return { diffuseMap, roughnessMap };
}
