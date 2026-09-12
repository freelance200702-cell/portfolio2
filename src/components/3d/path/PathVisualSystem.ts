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

  // Base roadway tone: Industrial dark graphite / deep basalt
  ctx.fillStyle = '#10141d';
  ctx.fillRect(0, 0, width, height);

  // Micro-aggregate noise texture
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 2)); // Subtle cool blue shift
  }
  ctx.putImageData(imgData, 0, 0);

  // Lateral expansion joints (precast modular slabs repeating along length)
  const slabCount = 8;
  const slabHeight = height / slabCount;

  for (let s = 0; s < slabCount; s++) {
    const y = s * slabHeight;

    // Dark recessed expansion seam
    ctx.strokeStyle = '#06080d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    // Subtle edge highlight adjacent to expansion joint (beveled slab edge catching light)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y + 3);
    ctx.lineTo(width, y + 3);
    ctx.stroke();
  }

  // Dual subtle tire track lanes (wear from navigation)
  const gradLeft = ctx.createLinearGradient(width * 0.15, 0, width * 0.38, 0);
  gradLeft.addColorStop(0, 'rgba(10, 14, 20, 0)');
  gradLeft.addColorStop(0.5, 'rgba(7, 9, 14, 0.45)');
  gradLeft.addColorStop(1, 'rgba(10, 14, 20, 0)');
  ctx.fillStyle = gradLeft;
  ctx.fillRect(width * 0.15, 0, width * 0.23, height);

  const gradRight = ctx.createLinearGradient(width * 0.62, 0, width * 0.85, 0);
  gradRight.addColorStop(0, 'rgba(10, 14, 20, 0)');
  gradRight.addColorStop(0.5, 'rgba(7, 9, 14, 0.45)');
  gradRight.addColorStop(1, 'rgba(10, 14, 20, 0)');
  ctx.fillStyle = gradRight;
  ctx.fillRect(width * 0.62, 0, width * 0.23, height);

  // Outer safety tactile rumble strip bands (along left and right edges)
  ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
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
