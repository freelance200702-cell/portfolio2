import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import { Scene } from './Scene';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useUIStore } from '@/stores/useUIStore';
import { AccessiblePortfolioView } from '../ui/AccessiblePortfolioView';

interface CanvasContainerProps {
  className?: string;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({ className }) => {
  const isReduced3D = useUIStore((s) => s.isReduced3D);
  const isWebGLSupported = useUIStore((s) => s.isWebGLSupported);
  const qualityPreset = useUIStore((s) => s.qualityPreset);
  const deviceTier = useUIStore((s) => s.deviceTier);

  // Dynamic DPR bounds to prevent thermal throttling on high-DPI mobile devices
  const dprBounds = useMemo<[number, number]>(() => {
    if (qualityPreset === 'mobile' || deviceTier === 'mobile') {
      return [1, 1.35];
    }
    if (qualityPreset === 'balanced' || deviceTier === 'tablet') {
      return [1, 1.5];
    }
    return [1, 2.0];
  }, [qualityPreset, deviceTier]);

  // Graceful Reduced-3D Fallback: Instant 2D stream if user or hardware requested
  if (isReduced3D || !isWebGLSupported) {
    return <AccessiblePortfolioView />;
  }

  return (
    <div className={className || 'fixed inset-0 pointer-events-auto z-0'}>
      <ErrorBoundary fallback={<AccessiblePortfolioView />}>
        <Canvas
          camera={{
            position: [0, 2.5, 26],
            fov: 54,
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: qualityPreset !== 'mobile',
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
          }}
          dpr={dprBounds}
          onCreated={({ gl }) => {
            // Handle catastrophic context loss gracefully without crashing
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              useUIStore.getState().setQualityPreset('reduced_3d');
            });
          }}
        >
          <color attach="background" args={['#06080e']} />

          <Suspense fallback={null}>
            <Scene />
            <AdaptiveDpr pixelated />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};
