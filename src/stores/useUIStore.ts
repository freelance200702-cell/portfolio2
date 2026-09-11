import { create } from 'zustand';
import type { ProjectCategory } from '@/types/project';
import {
  detectDeviceCapabilities,
  type DeviceTier,
  type QualityPreset,
  type DeviceCapabilities,
} from '@/lib/deviceDetection';

export type { QualityPreset, DeviceTier, DeviceCapabilities };

interface UIState {
  isHUDVisible: boolean;
  selectedCategory: ProjectCategory | 'all';
  qualityPreset: QualityPreset;
  deviceTier: DeviceTier;
  isTouchDevice: boolean;
  isNarrowViewport: boolean;
  isWebGLSupported: boolean;
  isReduced3D: boolean;
  isAudioPlaying: boolean;
  isDrawerOpen: boolean;
  isLoading: boolean;
  loadingProgress: number;

  // Actions
  toggleHUD: () => void;
  setCategory: (cat: ProjectCategory | 'all') => void;
  setQualityPreset: (preset: QualityPreset) => void;
  toggleReduced3D: () => void;
  refreshDeviceCapabilities: () => void;
  toggleAudio: () => void;
  setDrawerOpen: (open: boolean) => void;
  setLoading: (loading: boolean, progress?: number) => void;
}

const initialCaps = detectDeviceCapabilities();

export const useUIStore = create<UIState>((set, get) => ({
  isHUDVisible: true,
  selectedCategory: 'all',
  qualityPreset: initialCaps.recommendedPreset,
  deviceTier: initialCaps.tier,
  isTouchDevice: initialCaps.isTouch,
  isNarrowViewport: initialCaps.isNarrow,
  isWebGLSupported: initialCaps.supportsWebGL,
  isReduced3D: initialCaps.recommendedPreset === 'reduced_3d',
  isAudioPlaying: false,
  isDrawerOpen: false,
  isLoading: false,
  loadingProgress: 100,

  toggleHUD: () => set((state) => ({ isHUDVisible: !state.isHUDVisible })),
  setCategory: (cat) => set({ selectedCategory: cat }),
  setQualityPreset: (preset) =>
    set({ qualityPreset: preset, isReduced3D: preset === 'reduced_3d' }),
  toggleReduced3D: () => {
    const nextReduced = !get().isReduced3D;
    set({
      isReduced3D: nextReduced,
      qualityPreset: nextReduced ? 'reduced_3d' : 'balanced',
    });
  },
  refreshDeviceCapabilities: () => {
    const caps = detectDeviceCapabilities();
    set({
      deviceTier: caps.tier,
      isTouchDevice: caps.isTouch,
      isNarrowViewport: caps.isNarrow,
      isWebGLSupported: caps.supportsWebGL,
      isReduced3D: caps.recommendedPreset === 'reduced_3d' || get().isReduced3D,
    });
  },
  toggleAudio: () => set((state) => ({ isAudioPlaying: !state.isAudioPlaying })),
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setLoading: (loading, progress = 100) => set({ isLoading: loading, loadingProgress: progress }),
}));
