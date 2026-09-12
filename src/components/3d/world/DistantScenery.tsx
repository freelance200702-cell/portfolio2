import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '@/stores/useUIStore';
import { getCurveMetrics, sampleExtendedCurveFrame, sampleCurveFrame } from '@/lib/splineMath';

interface DistantSceneryProps {
  curve?: THREE.CatmullRomCurve3;
}

function hashFloat(seed: number): number {
  const x = Math.sin(seed * 157.31 + 419.83) * 43758.5453;
  return x - Math.floor(x);
}

export const DistantScenery: React.FC<DistantSceneryProps> = ({ curve }) => {
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  const monolithRef = useRef<THREE.InstancedMesh>(null);
  const beaconRef = useRef<THREE.InstancedMesh>(null);
  const towerRef = useRef<THREE.InstancedMesh>(null);
  const towerBeaconRef = useRef<THREE.InstancedMesh>(null);
  const mountainRef = useRef<THREE.InstancedMesh>(null);

  const beaconMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const towerBeaconMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Dynamic curve metrics
  const metrics = useMemo(() => {
    if (!curve) {
      return {
        startPoint: new THREE.Vector3(0, 1.6, 25),
        endPoint: new THREE.Vector3(0, 2.8, -366),
        minZ: -366,
        maxZ: 25,
        totalLength: 420,
      };
    }
    return getCurveMetrics(curve);
  }, [curve]);

  // Scalable journey bounds
  const totalLength = Math.max(10, metrics.totalLength);

  // 1. Dynamic Monoliths (Side Ridge Stelae + Horizon Colonnade)
  const monolithData = useMemo(() => {
    if (!curve) return [];
    const items = [];

    // Scale count proportionally to journey length
    const density = qualityPreset === 'mobile' ? 14 : qualityPreset === 'balanced' ? 24 : 36;
    const pairCount = Math.max(10, Math.round((totalLength / 380) * density));

    // A. Canyon Ridge Monolith Pairs along the journey and extended horizon
    // Spans from t = -0.12 (behind start) to t = 1.55 (deep beyond terminal threshold)
    const tStart = -0.12;
    const tEnd = 1.55;

    for (let i = 0; i < pairCount; i++) {
      const alpha = i / (pairCount - 1);
      const t = tStart + alpha * (tEnd - tStart);
      const frame = sampleExtendedCurveFrame(curve, t);

      // Left Ridge Monolith
      const h1 = hashFloat(i * 5.13 + 1.0);
      const h2 = hashFloat(i * 9.27 + 2.0);
      const h3 = hashFloat(i * 14.39 + 3.0);
      const rotL = Math.atan2(frame.tangent.x, frame.tangent.z) + (h1 - 0.5) * 0.5;

      const distL = 50 + h2 * 45; // 50m to 95m lateral from centerline
      const heightL = 34 + h3 * 65; // 34m to 99m tall
      const widthL = 4.5 + h1 * 4.5;
      const depthL = 5.5 + h2 * 4.5;

      const posL = frame.position
        .clone()
        .addScaledVector(frame.binormal, -distL)
        .setY(-0.6 + heightL * 0.5);

      const hasBeaconL = i % 2 === 0 || h3 > 0.65;
      items.push({ pos: posL, w: widthL, h: heightL, d: depthL, rotY: rotL, hasBeacon: hasBeaconL });

      // Right Ridge Monolith
      const h4 = hashFloat(i * 7.61 + 4.0);
      const h5 = hashFloat(i * 11.83 + 5.0);
      const h6 = hashFloat(i * 17.51 + 6.0);
      const rotR = Math.atan2(frame.tangent.x, frame.tangent.z) + (h4 - 0.5) * 0.5;

      const distR = 52 + h5 * 45;
      const heightR = 36 + h6 * 68;
      const widthR = 4.8 + h4 * 4.5;
      const depthR = 5.8 + h5 * 4.5;

      const posR = frame.position
        .clone()
        .addScaledVector(frame.binormal, distR)
        .setY(-0.6 + heightR * 0.5);

      const hasBeaconR = (i + 1) % 2 === 0 || h6 > 0.65;
      items.push({ pos: posR, w: widthR, h: heightR, d: depthR, rotY: rotR, hasBeacon: hasBeaconR });
    }

    // B. Monumental Horizon Vanishing Point Colonnade (Anchors distant horizon)
    const horizonColonnadeCount = qualityPreset === 'mobile' ? 6 : 12;
    for (let j = 0; j < horizonColonnadeCount; j++) {
      const hj1 = hashFloat(j * 13.7 + 55.0);
      const hj2 = hashFloat(j * 19.3 + 77.0);
      // Positioned 220m to 520m past the terminal threshold
      const horizonDist = 220 + (j % 4) * 75 + hj1 * 60;
      const tHorizon = 1.0 + horizonDist / totalLength;
      const frame = sampleExtendedCurveFrame(curve, tHorizon);

      const lateralOffset = ((j % 2 === 0 ? 1 : -1) * (26 + Math.floor(j / 2) * 22)) + (hj2 - 0.5) * 15;
      const height = 75 + hj1 * 60; // Grand 75m to 135m towers
      const width = 8.0 + hj2 * 5.0;
      const depth = 9.0 + hj1 * 5.0;
      const rotY = Math.atan2(frame.tangent.x, frame.tangent.z) + (hj1 - 0.5) * 0.4;

      const pos = frame.position
        .clone()
        .addScaledVector(frame.binormal, lateralOffset)
        .setY(-0.6 + height * 0.5);

      items.push({ pos, w: width, h: height, d: depth, rotY, hasBeacon: true });
    }

    return items;
  }, [curve, totalLength, qualityPreset]);

  // 2. Midground Transmission Relay Towers along the Canyon Rim
  const towerData = useMemo(() => {
    if (!curve) return [];
    const items = [];

    const density = qualityPreset === 'mobile' ? 12 : qualityPreset === 'balanced' ? 20 : 28;
    const towerCount = Math.max(8, Math.round((totalLength / 350) * density));

    const tStart = -0.08;
    const tEnd = 1.45;

    for (let i = 0; i < towerCount; i++) {
      const alpha = i / (towerCount - 1);
      const t = tStart + alpha * (tEnd - tStart);
      const frame = sampleExtendedCurveFrame(curve, t);

      const h = hashFloat(i * 11.23 + 9.0);
      const side = i % 2 === 0 ? 1 : -1;
      // Positioned along the midground rim bench
      const offset = side * (38.0 + (i % 3) * 4.5 + h * 3.0);
      const height = 22 + (i % 4) * 3.2 + h * 4.0;
      const rotY = Math.atan2(frame.tangent.x, frame.tangent.z) + (i * 0.35);

      const pos = frame.position
        .clone()
        .addScaledVector(frame.binormal, offset)
        .setY(-0.6 + height * 0.5);

      items.push({ pos, h: height, rotY });
    }

    return items;
  }, [curve, totalLength, qualityPreset]);

  // 3. Dynamic Overhead Infrastructure Traverse Spans (Skyway Arches)
  // Automatically distributed along the spline based on total journey length
  const archPlacements = useMemo(() => {
    if (!curve) return [];
    const items = [];

    // Place an arch approximately every 120m to 140m along the trajectory
    const numArches = Math.max(2, Math.min(6, Math.floor(totalLength / 125)));
    
    for (let i = 0; i < numArches; i++) {
      // Stagger arches along the active contemplation sections
      const t = 0.16 + (i / (numArches - 1 || 1)) * 0.65;
      const frame = sampleCurveFrame(curve, t);

      const rotMatrix = new THREE.Matrix4().makeBasis(
        frame.binormal,
        frame.normal,
        frame.tangent.clone().negate()
      );
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

      // Elevation above track
      const archPos = frame.position.clone().addScaledVector(frame.normal, 14.5 + (i % 2) * 1.5);
      const spanWidth = 78 + (i % 2) * 8;

      items.push({
        id: `arch-${i}`,
        position: archPos,
        quaternion,
        spanWidth,
      });
    }

    return items;
  }, [curve, totalLength]);

  // 4. Distant Silhouette Mountain Mesas (Horizon Enclosure)
  // Creates monumental background geological silhouettes at 450m–750m radii
  const mountainData = useMemo(() => {
    if (!curve) return [];
    const items = [];
    const count = qualityPreset === 'mobile' ? 18 : 32;

    const centerZ = (metrics.minZ + metrics.maxZ) * 0.5;
    const journeySpanZ = Math.abs(metrics.maxZ - metrics.minZ);
    const radiusX = 520;
    const radiusZ = Math.max(550, (journeySpanZ + 750) * 0.5);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const h = hashFloat(i * 17.41 + 101.0);
      const h2 = hashFloat(i * 29.13 + 202.0);

      // Distribute along an expansive perimeter surrounding the entire journey
      const x = Math.sin(angle) * (radiusX + (h - 0.5) * 120);
      const z = centerZ + Math.cos(angle) * (radiusZ + (h2 - 0.5) * 140);

      const height = 110 + h * 90; // 110m to 200m tall geological mountains
      const width = 160 + h2 * 120; // 160m to 280m wide monumental ridges
      const depth = 90 + h * 50;
      const rotY = angle + Math.PI * 0.5 + (h - 0.5) * 0.4;

      const pos = new THREE.Vector3(x, -0.6 + height * 0.5, z);
      items.push({ pos, width, height, depth, rotY });
    }

    return items;
  }, [curve, metrics, qualityPreset]);

  // Update InstancedMesh matrices
  useEffect(() => {
    const dummy = new THREE.Object3D();

    // 1. Monoliths & Beacons
    if (monolithRef.current && monolithData.length > 0) {
      monolithData.forEach((m, idx) => {
        dummy.position.copy(m.pos);
        dummy.scale.set(m.w, m.h, m.d);
        dummy.rotation.set(0, m.rotY, 0);
        dummy.updateMatrix();
        monolithRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      monolithRef.current.instanceMatrix.needsUpdate = true;
    }

    if (beaconRef.current && monolithData.length > 0) {
      monolithData.forEach((m, idx) => {
        if (m.hasBeacon) {
          dummy.position.set(m.pos.x, m.pos.y + m.h * 0.5 + 14, m.pos.z);
          dummy.scale.set(0.2, 28, 0.2);
        } else {
          dummy.scale.set(0, 0, 0);
        }
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        beaconRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      beaconRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Towers & Strobes
    if (towerRef.current && towerData.length > 0) {
      towerData.forEach((t, idx) => {
        dummy.position.copy(t.pos);
        dummy.scale.set(0.75, t.h, 0.75);
        dummy.rotation.set(0, t.rotY, 0);
        dummy.updateMatrix();
        towerRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      towerRef.current.instanceMatrix.needsUpdate = true;
    }

    if (towerBeaconRef.current && towerData.length > 0) {
      towerData.forEach((t, idx) => {
        dummy.position.set(t.pos.x, t.pos.y + t.h * 0.5 + 0.3, t.pos.z);
        dummy.scale.set(0.4, 0.4, 0.4);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        towerBeaconRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      towerBeaconRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Mountain Ridge Silhouettes
    if (mountainRef.current && mountainData.length > 0) {
      mountainData.forEach((md, idx) => {
        dummy.position.copy(md.pos);
        dummy.scale.set(md.width, md.height, md.depth);
        dummy.rotation.set(0, md.rotY, 0);
        dummy.updateMatrix();
        mountainRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      mountainRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [monolithData, towerData, mountainData]);

  // Subtle rhythmic harmonic beacon pulses
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (beaconMatRef.current) {
      beaconMatRef.current.opacity = 0.14 + Math.sin(time * 1.1) * 0.05;
    }
    if (towerBeaconMatRef.current) {
      const pulse = Math.pow(Math.sin(time * 2.2), 6.0);
      towerBeaconMatRef.current.opacity = 0.2 + pulse * 0.75;
    }
  });

  return (
    <group>
      {/* 1. Monumental Architectural Ridge Monoliths (Warm Stele) */}
      <instancedMesh
        ref={monolithRef}
        args={[undefined, undefined, monolithData.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#6b645b"
          roughness={0.72}
          metalness={0.06}
        />
      </instancedMesh>

      {/* 2. Atmospheric Vertical Light Beacons (Warm Champagne Celestial Guiding Beacons) */}
      <instancedMesh
        ref={beaconRef}
        args={[undefined, undefined, monolithData.length]}
      >
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshBasicMaterial
          ref={beaconMatRef}
          color="#fef3c7"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      {/* 3. Midground Transmission Relay Towers */}
      <instancedMesh
        ref={towerRef}
        args={[undefined, undefined, towerData.length]}
        castShadow
      >
        <cylinderGeometry args={[0.3, 1.2, 1, 6]} />
        <meshStandardMaterial
          color="#7c7368"
          roughness={0.65}
          metalness={0.12}
        />
      </instancedMesh>

      {/* 4. Pulsing Amber/Coral Aviation Strobes atop Relays */}
      <instancedMesh
        ref={towerBeaconRef}
        args={[undefined, undefined, towerData.length]}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          ref={towerBeaconMatRef}
          color="#fb923c"
          transparent
          opacity={0.7}
        />
      </instancedMesh>

      {/* 5. Distant Perimeter Mountain Mesas / Horizon Enclosure Ridges */}
      <instancedMesh
        ref={mountainRef}
        args={[undefined, undefined, mountainData.length]}
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#524b42"
          roughness={0.88}
          metalness={0.03}
        />
      </instancedMesh>

      {/* 6. Dynamic Overhead Infrastructure Traverse Spans (Skyway Arches) */}
      {archPlacements.map((arch) => (
        <group key={arch.id} position={arch.position} quaternion={arch.quaternion}>
          {/* Horizontal Truss Span (Ivory Precast Architectural Skyway) */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[arch.spanWidth, 1.3, 2.6]} />
            <meshStandardMaterial color="#ded9d0" roughness={0.65} metalness={0.05} />
          </mesh>
          {/* Underside Telemetry Luminaire */}
          <mesh position={[0, -0.7, 0]}>
            <boxGeometry args={[arch.spanWidth * 0.65, 0.06, 0.45]} />
            <meshBasicMaterial color="#fffbeb" transparent opacity={0.65} />
          </mesh>
          {/* Left Canyon Anchor Column */}
          <mesh position={[-arch.spanWidth * 0.48, -7.5, 0]} castShadow>
            <boxGeometry args={[2.2, 15, 2.6]} />
            <meshStandardMaterial color="#8c8479" roughness={0.7} metalness={0.05} />
          </mesh>
          {/* Right Canyon Anchor Column */}
          <mesh position={[arch.spanWidth * 0.48, -7.5, 0]} castShadow>
            <boxGeometry args={[2.2, 15, 2.6]} />
            <meshStandardMaterial color="#8c8479" roughness={0.7} metalness={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
