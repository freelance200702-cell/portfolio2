import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useUIStore } from '@/stores/useUIStore';

// Vertex shader passing local position so the horizon stays permanently level with traveler's eye
const skyVertexShader = `
  varying vec3 vLocalPosition;
  void main() {
    vLocalPosition = position;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader creating a rich cinematic horizon gradient
const skyFragmentShader = `
  uniform vec3 uZenithColor;
  uniform vec3 uMidColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uNadirColor;
  varying vec3 vLocalPosition;

  void main() {
    vec3 dir = normalize(vLocalPosition);
    float elevation = dir.y; // -1.0 to 1.0

    vec3 finalColor;
    if (elevation > 0.0) {
      // Atmospheric sky above horizon: blend from horizon glow through mid-sky to zenith
      float t = pow(elevation, 0.45); // Soft exponential curve for realistic atmospheric band
      vec3 skyAtmosphere = mix(uHorizonColor, uZenithColor, t);
      // Extra luminous glow near the horizon line
      float horizonHaze = exp(-elevation * 10.0);
      finalColor = mix(skyAtmosphere, uHorizonColor, horizonHaze * 0.55);
    } else {
      // Subtle ground horizon reflection below horizontal plane
      float t = clamp(-elevation * 4.0, 0.0, 1.0);
      finalColor = mix(uHorizonColor * 0.65, uNadirColor, t);
    }

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const AtmosphericSky: React.FC = () => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);
  const skyGroupRef = useRef<THREE.Group>(null);

  const uniforms = useMemo(
    () => ({
      uZenithColor: { value: new THREE.Color('#060b18') },   // Deep celestial indigo
      uMidColor: { value: new THREE.Color('#142238') },      // Mid-sky slate
      uHorizonColor: { value: new THREE.Color('#2c4060') },  // Luminous twilight titanium horizon
      uNadirColor: { value: new THREE.Color('#090e1a') },    // Ground nadir
    }),
    []
  );

  const starCount = useMemo(() => {
    if (qualityPreset === 'mobile') return 300;
    if (qualityPreset === 'balanced') return 800;
    return 1600;
  }, [qualityPreset]);

  // Keep the celestial dome centered on the camera throughout the 300m journey
  useFrame(({ camera }) => {
    if (skyGroupRef.current) {
      skyGroupRef.current.position.copy(camera.position);
    }
  });

  return (
    <group ref={skyGroupRef}>
      {/* 1. Large-Scale Inverted Celestial Atmospheric Dome */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[500, 32, 16]} />
        <shaderMaterial
          vertexShader={skyVertexShader}
          fragmentShader={skyFragmentShader}
          uniforms={uniforms}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Delicate Celestial Starfield embedded in high atmosphere */}
      <Stars
        key={`stars-${starCount}`}
        radius={280}
        depth={80}
        count={starCount}
        factor={2.5}
        saturation={0.05}
        fade
        speed={0.2}
      />
    </group>
  );
};
