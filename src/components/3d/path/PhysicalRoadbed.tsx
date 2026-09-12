import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { sampleCurveFrame } from '@/lib/splineMath';
import { createRoadwayTextures } from './PathVisualSystem';

interface PhysicalRoadbedProps {
  curve: THREE.CatmullRomCurve3;
  roadWidth: number;
  deckThickness: number;
  sampleCount: number;
}

/**
 * Physical Roadbed Visual Component:
 * - Extruded PBR roadway deck with modular slabs, tire wear grooves, and aggregate roughness
 * - Chamfered architectural concrete curbs (45-degree angled safety verges)
 * - Under-deck structural keel spine providing depth and structural credibility
 * - Precision-spaced asphalt expansion joint seam lines
 */
export const PhysicalRoadbed: React.FC<PhysicalRoadbedProps> = ({
  curve,
  roadWidth,
  deckThickness,
  sampleCount,
}) => {
  // Generate PBR roadway textures with physical wear lanes and expansion joints
  const { diffuseMap, roughnessMap } = useMemo(() => {
    return createRoadwayTextures();
  }, []);

  // 1. Physical Roadbed Deck with accurate UV mapping for longitudinal texture tiling
  const deckGeometry = useMemo(() => {
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const halfWidth = roadWidth / 2;
    const totalLength = curve.getLength();
    // Texture repeats once every 12 meters
    const totalRepeats = Math.max(10, Math.round(totalLength / 12));

    for (let i = 0; i <= sampleCount; i++) {
      const t = i / sampleCount;
      const frame = sampleCurveFrame(curve, t);

      // Top surface
      const topLeft = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth)
        .addScaledVector(frame.normal, deckThickness / 2);

      const topRight = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth)
        .addScaledVector(frame.normal, deckThickness / 2);

      // Bottom surface
      const bottomLeft = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth)
        .addScaledVector(frame.normal, -deckThickness / 2);

      const bottomRight = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth)
        .addScaledVector(frame.normal, -deckThickness / 2);

      vertices.push(
        topLeft.x, topLeft.y, topLeft.z,
        topRight.x, topRight.y, topRight.z,
        bottomLeft.x, bottomLeft.y, bottomLeft.z,
        bottomRight.x, bottomRight.y, bottomRight.z
      );

      const vCoord = t * totalRepeats;
      uvs.push(0, vCoord, 1, vCoord, 0, vCoord, 1, vCoord);

      if (i < sampleCount) {
        const base = i * 4;
        // Top surface
        indices.push(base, base + 1, base + 4);
        indices.push(base + 1, base + 5, base + 4);

        // Left edge
        indices.push(base, base + 4, base + 2);
        indices.push(base + 4, base + 6, base + 2);

        // Right edge
        indices.push(base + 1, base + 3, base + 5);
        indices.push(base + 3, base + 7, base + 5);

        // Bottom under-deck surface (facing downward towards planetary floor)
        indices.push(base + 2, base + 6, base + 3);
        indices.push(base + 3, base + 6, base + 7);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [curve, sampleCount, roadWidth, deckThickness]);

  // 2. Continuous Angled Precast Curbs (Left & Right)
  // These create physical, non-glowing beveled boundaries that catch directional key light
  const { leftCurbGeom, rightCurbGeom } = useMemo(() => {
    const curbSamples = Math.round(sampleCount * 0.75);
    const leftVerts: number[] = [];
    const rightVerts: number[] = [];
    const curbIndices: number[] = [];
    const halfWidth = roadWidth / 2;
    const curbWidth = 0.16;
    const curbHeight = 0.08;

    for (let i = 0; i <= curbSamples; i++) {
      const t = i / curbSamples;
      const frame = sampleCurveFrame(curve, t);

      // Left curb profile (trapezoidal bevel)
      // Inner edge at deck top
      const lInner = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth + curbWidth)
        .addScaledVector(frame.normal, deckThickness / 2);
      // Outer top crest
      const lCrest = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth)
        .addScaledVector(frame.normal, deckThickness / 2 + curbHeight);
      // Outer drop
      const lDrop = frame.position
        .clone()
        .addScaledVector(frame.binormal, -halfWidth)
        .addScaledVector(frame.normal, -deckThickness / 2);

      leftVerts.push(
        lInner.x, lInner.y, lInner.z,
        lCrest.x, lCrest.y, lCrest.z,
        lDrop.x, lDrop.y, lDrop.z
      );

      // Right curb profile
      const rInner = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth - curbWidth)
        .addScaledVector(frame.normal, deckThickness / 2);
      const rCrest = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth)
        .addScaledVector(frame.normal, deckThickness / 2 + curbHeight);
      const rDrop = frame.position
        .clone()
        .addScaledVector(frame.binormal, halfWidth)
        .addScaledVector(frame.normal, -deckThickness / 2);

      rightVerts.push(
        rInner.x, rInner.y, rInner.z,
        rCrest.x, rCrest.y, rCrest.z,
        rDrop.x, rDrop.y, rDrop.z
      );

      if (i < curbSamples) {
        const base = i * 3;
        // Inner slope bevel
        curbIndices.push(base, base + 1, base + 3);
        curbIndices.push(base + 1, base + 4, base + 3);
        // Outer vertical drop
        curbIndices.push(base + 1, base + 2, base + 4);
        curbIndices.push(base + 2, base + 5, base + 4);
      }
    }

    const lGeom = new THREE.BufferGeometry();
    lGeom.setAttribute('position', new THREE.Float32BufferAttribute(leftVerts, 3));
    lGeom.setIndex(curbIndices);
    lGeom.computeVertexNormals();

    const rGeom = new THREE.BufferGeometry();
    rGeom.setAttribute('position', new THREE.Float32BufferAttribute(rightVerts, 3));
    rGeom.setIndex(curbIndices);
    rGeom.computeVertexNormals();

    return { leftCurbGeom: lGeom, rightCurbGeom: rGeom };
  }, [curve, sampleCount, roadWidth, deckThickness]);

  // 3. Central Under-Deck Structural Box Girder / Keel
  // Gives the elevated roadway substantial physical mass rather than a paper-thin ribbon
  const keelGeometry = useMemo(() => {
    const keelSamples = Math.round(sampleCount * 0.5);
    const keelVerts: number[] = [];
    const keelIndices: number[] = [];
    const keelHalfWidth = (roadWidth * 0.45) / 2; // 45% of roadbed width
    const keelDepth = 0.35; // Extends 35cm below deck

    for (let i = 0; i <= keelSamples; i++) {
      const t = i / keelSamples;
      const frame = sampleCurveFrame(curve, t);

      const topLeft = frame.position
        .clone()
        .addScaledVector(frame.binormal, -keelHalfWidth)
        .addScaledVector(frame.normal, -deckThickness / 2);

      const topRight = frame.position
        .clone()
        .addScaledVector(frame.binormal, keelHalfWidth)
        .addScaledVector(frame.normal, -deckThickness / 2);

      const bottomCenter = frame.position
        .clone()
        .addScaledVector(frame.normal, -deckThickness / 2 - keelDepth);

      keelVerts.push(
        topLeft.x, topLeft.y, topLeft.z,
        topRight.x, topRight.y, topRight.z,
        bottomCenter.x, bottomCenter.y, bottomCenter.z
      );

      if (i < keelSamples) {
        const base = i * 3;
        // Left keel facet
        keelIndices.push(base, base + 2, base + 3);
        keelIndices.push(base + 3, base + 2, base + 5);
        // Right keel facet
        keelIndices.push(base + 1, base + 4, base + 2);
        keelIndices.push(base + 2, base + 4, base + 5);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(keelVerts, 3));
    geom.setIndex(keelIndices);
    geom.computeVertexNormals();
    return geom;
  }, [curve, sampleCount, roadWidth, deckThickness]);

  // Clean up GPU buffers on unmount
  useEffect(() => {
    return () => {
      deckGeometry.dispose();
      leftCurbGeom.dispose();
      rightCurbGeom.dispose();
      keelGeometry.dispose();
      diffuseMap.dispose();
      roughnessMap.dispose();
    };
  }, [deckGeometry, leftCurbGeom, rightCurbGeom, keelGeometry, diffuseMap, roughnessMap]);

  return (
    <group>
      {/* 1. Navigable Warm Stone Roadbed Deck with Physical Surface Texture */}
      <mesh geometry={deckGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          map={diffuseMap}
          roughnessMap={roughnessMap}
          color="#ded8ce"
          roughness={0.72}
          metalness={0.03}
          bumpScale={0.02}
        />
      </mesh>

      {/* 2. Left Precast Architectural Curb (Restrained Charcoal Stone) */}
      <mesh geometry={leftCurbGeom} receiveShadow castShadow>
        <meshStandardMaterial
          color="#3b3734"
          roughness={0.65}
          metalness={0.08}
        />
      </mesh>

      {/* 3. Right Precast Architectural Curb (Restrained Charcoal Stone) */}
      <mesh geometry={rightCurbGeom} receiveShadow castShadow>
        <meshStandardMaterial
          color="#3b3734"
          roughness={0.65}
          metalness={0.08}
        />
      </mesh>

      {/* 4. Structural Under-Deck Box Girder (Sharp Structural Depth) */}
      <mesh geometry={keelGeometry} receiveShadow castShadow>
        <meshStandardMaterial
          color="#2c2825"
          roughness={0.78}
          metalness={0.08}
        />
      </mesh>
    </group>
  );
};
