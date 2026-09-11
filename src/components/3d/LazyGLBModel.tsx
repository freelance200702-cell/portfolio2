import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export interface LazyGLBModelProps {
  url: string;
  primaryColor?: string;
  secondaryColor?: string;
  hovered?: boolean;
  isSelected?: boolean;
}

/**
 * Procedural fallback rendered while custom GLB model is downloading,
 * or permanently if the remote 3D asset fails to load or parse.
 */
export const ProceduralPolyhedronFallback: React.FC<{
  primaryColor?: string;
  secondaryColor?: string;
  hovered?: boolean;
}> = ({ primaryColor = '#38bdf8', secondaryColor = '#818cf8', hovered = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.6;
      meshRef.current.rotation.x += delta * 0.3;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.75;
      innerRef.current.rotation.z += delta * 0.35;
    }
  });

  return (
    <group>
      {/* Outer Faceted Obsidian Polyhedron */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[hovered ? 1.2 : 1.05, 0]} />
        <meshStandardMaterial
          color="#0a0f1d"
          emissive={primaryColor}
          emissiveIntensity={hovered ? 1.5 : 0.6}
          roughness={0.12}
          metalness={0.92}
          transparent
          opacity={0.94}
        />
      </mesh>

      {/* Inner Precision Wireframe Lattice */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshBasicMaterial
          color={secondaryColor}
          wireframe
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
};

interface ModelMeshProps {
  url: string;
  primaryColor?: string;
  hovered?: boolean;
  isSelected?: boolean;
}

/**
 * Loads, normalizes, centers, and animates the GLTF model.
 */
const ModelMesh: React.FC<ModelMeshProps> = ({
  url,
  primaryColor = '#38bdf8',
  hovered = false,
  isSelected = false,
}) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Deep clone and normalize geometry bounds
  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Offset so geometric center is positioned at (0, 0, 0)
    clone.position.sub(center);

    // Scale so maximum bounding dimension fits comfortably within ~2.2 units
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const targetScale = 2.2 / maxDim;
    clone.scale.setScalar(targetScale);

    // Configure shadows and ensure material consistency
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  // Clean up cloned GPU resources when unmounting or changing models
  useEffect(() => {
    return () => {
      normalizedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
    };
  }, [normalizedScene]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const speed = isSelected ? 1.25 : hovered ? 0.95 : 0.45;
      groupRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
      <pointLight
        color={primaryColor}
        intensity={hovered || isSelected ? 2.5 : 1.2}
        distance={6}
        decay={2}
      />
    </group>
  );
};

interface GLBErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface GLBErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches any R3F texture or GLTF parsing errors without crashing the main 3D Canvas.
 */
class GLBErrorBoundary extends React.Component<GLBErrorBoundaryProps, GLBErrorBoundaryState> {
  constructor(props: GLBErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): GLBErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn(
      '[LazyGLBModel] Asset loading error caught; displaying procedural quantum polyhedron fallback.',
      error,
      errorInfo
    );
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Resilient, lazy-loaded GLTF/GLB component with Suspense and ErrorBoundary protection.
 */
export const LazyGLBModel: React.FC<LazyGLBModelProps> = ({
  url,
  primaryColor = '#38bdf8',
  secondaryColor = '#818cf8',
  hovered = false,
  isSelected = false,
}) => {
  const fallbackUI = (
    <ProceduralPolyhedronFallback
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      hovered={hovered}
    />
  );

  // If no URL or blank string, render standard procedural artifact immediately
  if (!url || !url.trim()) {
    return fallbackUI;
  }

  return (
    <GLBErrorBoundary fallback={fallbackUI}>
      <React.Suspense fallback={fallbackUI}>
        <ModelMesh
          url={url}
          primaryColor={primaryColor}
          hovered={hovered}
          isSelected={isSelected}
        />
      </React.Suspense>
    </GLBErrorBoundary>
  );
};
