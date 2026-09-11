import React, { useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { sampleCurveFrame } from '@/lib/splineMath';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { DISCIPLINES, ABOUT_PROFILE } from '@/data/aboutSkillsData';
import type { EngineeringDiscipline } from '@/types/skills';
import { JETBRAINS_MONO_FONT } from '@/constants/assets';

import { NeuralAttentionVis } from './NeuralAttentionVis';
import { BvhTreeVis } from './BvhTreeVis';
import { ShaderCrystalVis } from './ShaderCrystalVis';
import { ParticleSwarmVis } from './ParticleSwarmVis';
import { MemoryLanesVis } from './MemoryLanesVis';
import { EdgeMeshVis } from './EdgeMeshVis';

interface SystemsObservatoryProps {
  curve: THREE.CatmullRomCurve3;
}

export const SystemsObservatory: React.FC<SystemsObservatoryProps> = ({ curve }) => {
  // Positioned along the track before the terminal threshold
  const observatoryT = 0.885;
  const frame = useMemo(() => sampleCurveFrame(curve, observatoryT), [curve]);

  const selectedDiscipline = useJourneyStore((s) => s.selectedDiscipline);
  const selectDiscipline = useJourneyStore((s) => s.selectDiscipline);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isApproaching, setIsApproaching] = useState(false);

  // Proximity LOD: Skip rendering and updating complex visualizers when camera is distant (>16% track away)
  useFrame(() => {
    const progress = useJourneyStore.getState().currentProgress;
    const inRange = Math.abs(progress - observatoryT) <= 0.16;
    if (inRange !== isApproaching) {
      setIsApproaching(inRange);
    }
  });

  // Compute orientation transform along track tangent
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

  // Spatial arrangement of the 6 disciplines: 3 on left (-), 3 on right (+)
  const disciplinePlacements = useMemo(() => {
    return DISCIPLINES.map((discipline, idx) => {
      const isLeft = idx < 3;
      const subIdx = idx % 3; // 0, 1, 2
      const side = isLeft ? -1 : 1;
      const x = side * (4.8 + subIdx * 1.6);
      const z = (subIdx - 1) * 4.2;
      const y = 0.0;
      return {
        discipline,
        position: new THREE.Vector3(x, y, z),
      };
    });
  }, []);

  // Helper to render matching procedural 3D visualization
  const renderVisualization = (disc: EngineeringDiscipline, isHovered: boolean) => {
    switch (disc.visArchetype) {
      case 'bvh_tree':
        return <BvhTreeVis color={disc.color} isHovered={isHovered} />;
      case 'neural_attention':
        return <NeuralAttentionVis color={disc.color} isHovered={isHovered} />;
      case 'shader_crystal':
        return <ShaderCrystalVis color={disc.color} isHovered={isHovered} />;
      case 'particle_swarm':
        return <ParticleSwarmVis color={disc.color} isHovered={isHovered} />;
      case 'memory_lanes':
        return <MemoryLanesVis color={disc.color} isHovered={isHovered} />;
      case 'edge_mesh':
        return <EdgeMeshVis color={disc.color} isHovered={isHovered} />;
      default:
        return null;
    }
  };

  return (
    <group position={transform.position} quaternion={transform.quaternion}>
      {/* 1. Milled Dark Titanium Circular Observatory Dais */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[11.5, 12.0, 0.15, 48]} />
        <meshStandardMaterial
          color="#050508"
          roughness={0.3}
          metalness={0.92}
        />
      </mesh>

      {/* 2. Concentric Luminous Floor Seams */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.5, 6.55, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10.5, 10.54, 64]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.2} />
      </mesh>

      {/* 3. Overhead Observatory Canopy Arch */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 5.5, 0]}>
          <torusGeometry args={[8.5, 0.05, 8, 48, Math.PI]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>
        <Text
          position={[0, 5.8, 0]}
          fontSize={0.28}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          font={JETBRAINS_MONO_FONT}
        >
          [ SYSTEMS OBSERVATORY // ARCHITECTURAL CODEX ]
        </Text>
      </group>

      {/* 4. Central Engineering Philosophy Core Monolith */}
      <group position={[0, 0, 4.5]}>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[2.2, 2.4, 0.35]} />
          <meshStandardMaterial
            color="#08080f"
            roughness={0.2}
            metalness={0.95}
          />
        </mesh>
        {/* Glowing Monolith Border */}
        <lineSegments position={[0, 1.2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(2.22, 2.42, 0.36)]} />
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </lineSegments>

        <Text
          position={[0, 2.1, 0.2]}
          fontSize={0.11}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          font={JETBRAINS_MONO_FONT}
        >
          {ABOUT_PROFILE.role.toUpperCase()}
        </Text>
        <Text
          position={[0, 1.7, 0.2]}
          fontSize={0.18}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          font={JETBRAINS_MONO_FONT}
        >
          {ABOUT_PROFILE.name}
        </Text>
        <Text
          position={[0, 1.0, 0.2]}
          fontSize={0.075}
          maxWidth={1.9}
          textAlign="center"
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          lineHeight={1.35}
          font={JETBRAINS_MONO_FONT}
        >
          {ABOUT_PROFILE.coreStatement}
        </Text>
      </group>

      {/* 5. The 6 Engineering Discipline Pedestals & 3D Visualizations */}
      {disciplinePlacements.map(({ discipline, position }) => {
        const isHovered = hoveredId === discipline.id;
        const isSelected = selectedDiscipline === discipline.id;

        return (
          <group
            key={discipline.id}
            position={position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredId(discipline.id);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              if (hoveredId === discipline.id) setHoveredId(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectDiscipline(isSelected ? null : discipline.id);
            }}
          >
            {/* Hexagonal Titanium Pedestal Base */}
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.9, 1.05, 0.9, 6]} />
              <meshStandardMaterial
                color="#0a0a12"
                roughness={0.25}
                metalness={0.9}
              />
            </mesh>

            {/* Glowing Pedestal Collar */}
            <mesh position={[0, 0.91, 0]}>
              <cylinderGeometry args={[0.91, 0.91, 0.03, 6]} />
              <meshBasicMaterial
                color={discipline.color}
                transparent
                opacity={isHovered || isSelected ? 0.95 : 0.4}
              />
            </mesh>

            {/* Interactive Procedural 3D Visualization (Gated by Proximity LOD) */}
            {isApproaching && (
              <Float
                speed={isHovered ? 2.5 : 1.2}
                rotationIntensity={isHovered ? 0.6 : 0.25}
                floatIntensity={0.3}
              >
                <group position={[0, 2.1, 0]}>
                  {renderVisualization(discipline, isHovered || isSelected)}
                </group>
              </Float>
            )}

            {/* In-World Typography Badge */}
            <Text
              position={[0, 1.15, 0]}
              fontSize={0.09}
              color={discipline.color}
              anchorX="center"
              anchorY="middle"
              font={JETBRAINS_MONO_FONT}
            >
              {discipline.code}
            </Text>
            <Text
              position={[0, 0.98, 0]}
              fontSize={0.11}
              color="#f8fafc"
              anchorX="center"
              anchorY="middle"
              font={JETBRAINS_MONO_FONT}
            >
              {discipline.title.toUpperCase()}
            </Text>

            {/* Floating Selection / Hover Indicator Ring */}
            {(isHovered || isSelected) && (
              <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.2, 1.25, 32]} />
                <meshBasicMaterial
                  color={discipline.color}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};
