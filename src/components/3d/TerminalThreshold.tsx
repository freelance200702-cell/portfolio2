import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { sampleCurveFrame } from '@/lib/splineMath';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { JETBRAINS_MONO_FONT } from '@/constants/assets';

interface TerminalThresholdProps {
  curve: THREE.CatmullRomCurve3;
}

export const TerminalThreshold: React.FC<TerminalThresholdProps> = ({ curve }) => {
  const terminalT = 0.965;
  const frame = useMemo(() => sampleCurveFrame(curve, terminalT), [curve]);

  const setTargetProgress = useJourneyStore((s) => s.setTargetProgress);

  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  // Orientation matrix to align portal perpendicular to track tangent
  const transform = useMemo(() => {
    const matrix = new THREE.Matrix4();
    const rotMatrix = new THREE.Matrix4().makeBasis(
      frame.binormal,
      frame.normal,
      frame.tangent.clone().negate()
    );
    matrix.multiply(rotMatrix);
    matrix.setPosition(frame.position);

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);

    return { position, quaternion };
  }, [frame]);

  useFrame((_, delta) => {
    const currentProgress = useJourneyStore.getState().currentProgress;
    // Activate terminal glow as traveler approaches (starts awakening at 85%)
    const proximity = Math.max(0, Math.min(1, (currentProgress - 0.85) / 0.1));

    if (glowRef.current) {
      const targetOpacity = hovered ? 0.95 : 0.4 + proximity * 0.45;
      glowRef.current.opacity = THREE.MathUtils.damp(
        glowRef.current.opacity,
        targetOpacity,
        3.5,
        delta
      );
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.25;
    }

    if (beaconRef.current) {
      const beaconMat = beaconRef.current.material as THREE.MeshBasicMaterial;
      if (beaconMat) {
        beaconMat.opacity = THREE.MathUtils.damp(
          beaconMat.opacity,
          0.05 + proximity * 0.2,
          3.0,
          delta
        );
      }
    }
  });

  return (
    <group position={transform.position} quaternion={transform.quaternion}>
      {/* 1. Vertical Atmospheric Terminus Beacon */}
      <mesh ref={beaconRef} position={[0, 12, 0]}>
        <cylinderGeometry args={[0.08, 0.45, 24, 16]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Heavy Architectural Portal Pylons (Left & Right) */}
      <group position={[0, 0, 0]}>
        {/* Left Heavy Titanium Monolith */}
        <mesh position={[-3.6, 2.5, 0]}>
          <boxGeometry args={[0.9, 5.2, 1.2]} />
          <meshStandardMaterial
            color="#09090f"
            roughness={0.25}
            metalness={0.92}
          />
        </mesh>

        {/* Right Heavy Titanium Monolith */}
        <mesh position={[3.6, 2.5, 0]}>
          <boxGeometry args={[0.9, 5.2, 1.2]} />
          <meshStandardMaterial
            color="#09090f"
            roughness={0.25}
            metalness={0.92}
          />
        </mesh>

        {/* Overhead Monolithic Lintel Beam */}
        <mesh position={[0, 5.0, 0]}>
          <boxGeometry args={[8.2, 0.5, 1.25]} />
          <meshStandardMaterial
            color="#07070c"
            roughness={0.22}
            metalness={0.95}
          />
        </mesh>

        {/* Recessed Glowing Laser Seams */}
        <mesh position={[-3.1, 2.5, 0]}>
          <boxGeometry args={[0.04, 5.0, 1.22]} />
          <meshBasicMaterial
            ref={glowRef}
            color="#38bdf8"
            transparent
            opacity={0.4}
          />
        </mesh>
        <mesh position={[3.1, 2.5, 0]}>
          <boxGeometry args={[0.04, 5.0, 1.22]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.4}
          />
        </mesh>
        <mesh position={[0, 4.7, 0]}>
          <boxGeometry args={[8.0, 0.04, 1.22]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

      {/* 3. Floating Holographic Portal Aperture Rings */}
      <group ref={ringRef} position={[0, 2.6, 0]}>
        <mesh>
          <torusGeometry args={[2.8, 0.02, 16, 64]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.35}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <torusGeometry args={[3.0, 0.015, 12, 48]} />
          <meshBasicMaterial
            color="#818cf8"
            transparent
            opacity={0.25}
          />
        </mesh>
      </group>

      {/* 4. In-World Architectural Completion Telemetry */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={[0, 3.4, 0.4]}>
          <Text
            position={[0, 0.7, 0]}
            fontSize={0.22}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
            font={JETBRAINS_MONO_FONT}
          >
            [ EXPEDITION TERMINUS // COMPLETE ]
          </Text>

          <Text
            position={[0, 0.35, 0]}
            fontSize={0.36}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={7.0}
            textAlign="center"
          >
            ALL ARCHITECTURAL EXHIBITS EXPLORED
          </Text>

          <Text
            position={[0, -0.05, 0]}
            fontSize={0.18}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
            font={JETBRAINS_MONO_FONT}
          >
            THANK YOU FOR TRAVERSING MY 3D EXPEDITION
          </Text>

          {/* Interactive Return-to-Start CTA Button */}
          <group
            position={[0, -0.65, 0.1]}
            onClick={(e) => {
              e.stopPropagation();
              setTargetProgress(0);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = 'auto';
            }}
          >
            <mesh>
              <planeGeometry args={[3.6, 0.42]} />
              <meshBasicMaterial
                color={hovered ? '#38bdf8' : '#0a0a14'}
                transparent
                opacity={0.9}
              />
            </mesh>
            <Text
              position={[0, 0, 0.02]}
              fontSize={0.15}
              color={hovered ? '#05050a' : '#e2e8f0'}
              anchorX="center"
              anchorY="middle"
              font={JETBRAINS_MONO_FONT}
            >
              [ ↺ REVERSE TRAJECTORY // RETURN TO START ]
            </Text>
          </group>
        </group>
      </Float>
    </group>
  );
};
