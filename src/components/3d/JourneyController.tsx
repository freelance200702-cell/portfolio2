import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { sampleCurveFrame, type CurveFrame, type ProjectPlacement } from '@/lib/splineMath';
import { DISCIPLINES } from '@/data/aboutSkillsData';

interface JourneyControllerProps {
  curve: THREE.CatmullRomCurve3;
  projectPlacements: ProjectPlacement[];
}

export const JourneyController: React.FC<JourneyControllerProps> = ({
  curve,
  projectPlacements,
}) => {
  const { camera, size } = useThree();

  const targetProgress = useJourneyStore((s) => s.targetProgress);
  const currentProgress = useJourneyStore((s) => s.currentProgress);
  const setCurrentProgress = useJourneyStore((s) => s.setCurrentProgress);
  const cameraMode = useJourneyStore((s) => s.cameraMode);
  const selectedProject = useJourneyStore((s) => s.selectedProject);
  const selectedDiscipline = useJourneyStore((s) => s.selectedDiscipline);

  // Position & Orientation Buffers
  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const smoothedLookAt = useRef(new THREE.Vector3(0, 1.5, 0));

  useFrame((_, delta) => {
    const isMobile = size.width < 768 || size.width < size.height;

    // Adjust camera FOV for mobile portrait screens so exhibits are never cut off
    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = isMobile ? 66 : 54;
      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 3, delta);
        camera.updateProjectionMatrix();
      }
    }

    // ------------------------------------------------------------------------
    // MODE 1: EXHIBIT INSPECTION FOCUS
    // ------------------------------------------------------------------------
    if (cameraMode === 'inspecting' && selectedProject) {
      const placement = projectPlacements.find((p) => p.project.id === selectedProject.id);
      if (placement) {
        // Symmetric framing: inspect from the road side towards the exhibit
        const sideDirection = (placement.lateralOffset ?? 0) >= 0 ? -1 : 1;
        const inspectOffset = isMobile
          ? new THREE.Vector3(0, 2.8, 6.2) // Mobile: elevated centered framing
          : new THREE.Vector3(sideDirection * 2.4, 2.2, 5.0); // Desktop: road-side 3/4 perspective

        targetCamPos.current.copy(placement.position).add(inspectOffset);
        targetLookAt.current.copy(placement.position).add(new THREE.Vector3(0, 1.8, 0));

        // Smooth cubic ease into inspection
        camera.position.lerp(targetCamPos.current, delta * 3.6);
        smoothedLookAt.current.lerp(targetLookAt.current, delta * 4.2);
        camera.lookAt(smoothedLookAt.current);

        // Level out any residual banking roll
        camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, 0, 5, delta);
        return;
      }
    }

    // ------------------------------------------------------------------------
    // MODE 2: OBSERVATORY DISCIPLINE INSPECTION FOCUS
    // ------------------------------------------------------------------------
    if (cameraMode === 'observatory') {
      const obsFrame = sampleCurveFrame(curve, 0.885);
      let focusPos = obsFrame.position.clone();
      let camOffset = isMobile
        ? new THREE.Vector3(0, 3.8, 8.5)
        : new THREE.Vector3(0, 3.4, 7.8);

      if (selectedDiscipline) {
        const discIdx = DISCIPLINES.findIndex((d) => d.id === selectedDiscipline);
        if (discIdx !== -1) {
          const isLeft = discIdx < 3;
          const subIdx = discIdx % 3;
          const side = isLeft ? -1 : 1;
          const localX = side * (4.8 + subIdx * 1.6);
          const localZ = (subIdx - 1) * 4.2;

          const discWorldPos = obsFrame.position
            .clone()
            .addScaledVector(obsFrame.binormal, localX)
            .addScaledVector(obsFrame.tangent, -localZ);

          focusPos = discWorldPos.add(new THREE.Vector3(0, 1.9, 0));
          camOffset = isMobile
            ? new THREE.Vector3(0, 2.8, 5.2)
            : new THREE.Vector3(-side * 2.2, 2.2, 4.4);
        }
      }

      targetCamPos.current.copy(focusPos).add(camOffset);
      targetLookAt.current.copy(focusPos);

      camera.position.lerp(targetCamPos.current, delta * 3.4);
      smoothedLookAt.current.lerp(targetLookAt.current, delta * 4.0);
      camera.lookAt(smoothedLookAt.current);
      camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, 0, 5, delta);
      return;
    }

    // ------------------------------------------------------------------------
    // MODE 3: CONTINUOUS 3D JOURNEY PROGRESSION
    // ------------------------------------------------------------------------
    // Controlled acceleration/deceleration physics
    const progressVelocity = Math.abs(targetProgress - currentProgress);
    // Smooth lambda: responsive when scrubbing, soft settling when stopping
    const smoothingFactor = progressVelocity > 0.08 ? 5.2 : 3.8;
    const nextProgress = THREE.MathUtils.damp(
      currentProgress,
      targetProgress,
      smoothingFactor,
      delta
    );
    setCurrentProgress(nextProgress);

    // Strict boundary clamping [0.0001, 0.9999]
    const clampedT = Math.max(0.0001, Math.min(0.9999, nextProgress));

    // Sample accurate spatial reference frame from the Catmull-Rom spline
    const frame: CurveFrame = sampleCurveFrame(curve, clampedT);

    // Camera height above track roadbed
    const eyeElevation = isMobile ? 1.9 : 1.6;
    const cameraPosition = frame.position
      .clone()
      .addScaledVector(frame.normal, eyeElevation);

    // Adaptive physical look-ahead: looks ~15m ahead along the actual roadbed regardless of total track length
    const curveLength = curve.getLength();
    const physicalLookAhead = isMobile ? 18.0 : 15.0;
    const lookAheadDelta = THREE.MathUtils.clamp(
      physicalLookAhead / Math.max(10, curveLength),
      0.012,
      0.075
    );

    const lookAheadT = Math.min(0.9999, clampedT + lookAheadDelta);
    const lookAheadFrame = sampleCurveFrame(curve, lookAheadT);
    const lookTarget = lookAheadFrame.position
      .clone()
      .addScaledVector(lookAheadFrame.normal, eyeElevation * 0.95);

    targetCamPos.current.copy(cameraPosition);
    targetLookAt.current.copy(lookTarget);

    // Fluid spatial interpolation
    camera.position.lerp(targetCamPos.current, 0.16);
    smoothedLookAt.current.lerp(targetLookAt.current, 0.22);
    camera.lookAt(smoothedLookAt.current);

    // Cinematic banking: roll camera smoothly into curve turns (clamped to prevent disorientation)
    const currentRoll = camera.rotation.z;
    const targetRoll = isMobile ? frame.bankAngle * 0.5 : frame.bankAngle;
    camera.rotation.z = THREE.MathUtils.damp(currentRoll, targetRoll, 3.2, delta);
  });

  return null;
};
