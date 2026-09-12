import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { sampleCurveFrame } from '@/lib/splineMath';

interface StructuralGuardrailProps {
  curve: THREE.CatmullRomCurve3;
  roadWidth: number;
  deckThickness: number;
  sampleCount: number;
}

/**
 * Structural Guardrail Visual Component:
 * Continuous cold-rolled steel W-beam safety guardrails mounted along the outer roadway perimeter.
 * Provides crisp geometric edge framing that clearly separates the physical road surface
 * from the surrounding landscape without glowing or reading as a neon wire.
 */
export const StructuralGuardrail: React.FC<StructuralGuardrailProps> = ({
  curve,
  roadWidth,
  deckThickness,
  sampleCount,
}) => {
  const halfWidth = roadWidth / 2;
  const railSamples = Math.round(sampleCount * 0.7);

  // Left & Right continuous extruded steel box beam barriers
  const { leftBeamGeom, rightBeamGeom } = useMemo(() => {
    const leftVerts: number[] = [];
    const rightVerts: number[] = [];
    const indices: number[] = [];
    const beamHeight = 0.14; // 14cm tall beam
    const beamThick = 0.05;  // 5cm thick profile
    const elevationAboveDeck = deckThickness / 2 + 0.32; // Centered at 32cm above deck

    for (let i = 0; i <= railSamples; i++) {
      const t = i / railSamples;
      const frame = sampleCurveFrame(curve, t);

      // Left beam profile (top-outer, top-inner, bottom-inner, bottom-outer)
      const lTopOuter = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth)
        .addScaledVector(frame.normal, elevationAboveDeck + beamHeight / 2);

      const lTopInner = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth + beamThick)
        .addScaledVector(frame.normal, elevationAboveDeck + beamHeight / 2);

      const lBotInner = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth + beamThick)
        .addScaledVector(frame.normal, elevationAboveDeck - beamHeight / 2);

      const lBotOuter = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth)
        .addScaledVector(frame.normal, elevationAboveDeck - beamHeight / 2);

      leftVerts.push(
        lTopOuter.x, lTopOuter.y, lTopOuter.z,
        lTopInner.x, lTopInner.y, lTopInner.z,
        lBotInner.x, lBotInner.y, lBotInner.z,
        lBotOuter.x, lBotOuter.y, lBotOuter.z
      );

      // Right beam profile
      const rTopInner = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth - beamThick)
        .addScaledVector(frame.normal, elevationAboveDeck + beamHeight / 2);

      const rTopOuter = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth)
        .addScaledVector(frame.normal, elevationAboveDeck + beamHeight / 2);

      const rBotOuter = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth)
        .addScaledVector(frame.normal, elevationAboveDeck - beamHeight / 2);

      const rBotInner = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth - beamThick)
        .addScaledVector(frame.normal, elevationAboveDeck - beamHeight / 2);

      rightVerts.push(
        rTopInner.x, rTopInner.y, rTopInner.z,
        rTopOuter.x, rTopOuter.y, rTopOuter.z,
        rBotOuter.x, rBotOuter.y, rBotOuter.z,
        rBotInner.x, rBotInner.y, rBotInner.z
      );

      if (i < railSamples) {
        const base = i * 4;
        // Top surface
        indices.push(base, base + 1, base + 4);
        indices.push(base + 1, base + 5, base + 4);

        // Inner vertical face (facing travelers)
        indices.push(base + 1, base + 2, base + 5);
        indices.push(base + 2, base + 6, base + 5);

        // Bottom face
        indices.push(base + 2, base + 3, base + 6);
        indices.push(base + 3, base + 7, base + 6);

        // Outer face
        indices.push(base + 3, base, base + 7);
        indices.push(base, base + 4, base + 7);
      }
    }

    const lGeom = new THREE.BufferGeometry();
    lGeom.setAttribute('position', new THREE.Float32BufferAttribute(leftVerts, 3));
    lGeom.setIndex(indices);
    lGeom.computeVertexNormals();

    const rGeom = new THREE.BufferGeometry();
    rGeom.setAttribute('position', new THREE.Float32BufferAttribute(rightVerts, 3));
    rGeom.setIndex(indices);
    rGeom.computeVertexNormals();

    return { leftBeamGeom: lGeom, rightBeamGeom: rGeom };
  }, [curve, railSamples, roadWidth, deckThickness, halfWidth]);

  useEffect(() => {
    return () => {
      leftBeamGeom.dispose();
      rightBeamGeom.dispose();
    };
  }, [leftBeamGeom, rightBeamGeom]);

  return (
    <group>
      {/* Left Galvanized Steel Guardrail */}
      <mesh geometry={leftBeamGeom} castShadow receiveShadow>
        <meshStandardMaterial
          color="#475569"
          roughness={0.35}
          metalness={0.88}
        />
      </mesh>

      {/* Right Galvanized Steel Guardrail */}
      <mesh geometry={rightBeamGeom} castShadow receiveShadow>
        <meshStandardMaterial
          color="#475569"
          roughness={0.35}
          metalness={0.88}
        />
      </mesh>
    </group>
  );
};
