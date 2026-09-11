import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { sampleCurveFrame, type CurveFrame } from '@/lib/splineMath';
import type { Project } from '@/types/project';

interface CameraRigProps {
  curve: THREE.CatmullRomCurve3;
  projectPlacements: {
    project: Project;
    position: THREE.Vector3;
    tangent: THREE.Vector3;
    index: number;
  }[];
}

export const CameraRig: React.FC<CameraRigProps> = ({ curve, projectPlacements }) => {
  const { camera } = useThree();

  const targetProgress = useJourneyStore((s) => s.targetProgress);
  const currentProgress = useJourneyStore((s) => s.currentProgress);
  const setCurrentProgress = useJourneyStore((s) => s.setCurrentProgress);
  const cameraMode = useJourneyStore((s) => s.cameraMode);
  const selectedProject = useJourneyStore((s) => s.selectedProject);

  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3(0, 1.5, 0));

  useFrame((_, delta) => {
    // 1. INSPECTING MODE (User clicked a project node)
    if (cameraMode === 'inspecting' && selectedProject) {
      const placement = projectPlacements.find((p) => p.project.id === selectedProject.id);
      if (placement) {
        // Orbit position: positioned slightly in front, offset to the right, elevated
        targetCamPos.current.set(
          placement.position.x + 2.5,
          placement.position.y + 2.2,
          placement.position.z + 5.5
        );
        targetLookAt.current.set(
          placement.position.x,
          placement.position.y + 1.8,
          placement.position.z
        );

        camera.position.lerp(targetCamPos.current, delta * 3.5);
        currentLookAt.current.lerp(targetLookAt.current, delta * 4.0);
        camera.lookAt(currentLookAt.current);
        camera.rotation.z = THREE.MathUtils.damp(camera.rotation.z, 0, 4, delta);
        return;
      }
    }

    // 2. SPLINE JOURNEY MODE (Standard continuous travel)
    // Smooth progress interpolation
    const progress = THREE.MathUtils.damp(currentProgress, targetProgress, 4.2, delta);
    setCurrentProgress(progress);

    const clampedT = Math.max(0.0001, Math.min(0.9999, progress));
    const frame: CurveFrame = sampleCurveFrame(curve, clampedT);

    // Camera sits 1.6m above the track roadbed
    const eyeElevation = 1.6;
    const cameraPosition = frame.position
      .clone()
      .addScaledVector(frame.normal, eyeElevation);

    // Look-ahead target along curve
    const lookAheadDelta = 0.045;
    const lookAheadT = Math.min(0.9999, clampedT + lookAheadDelta);
    const lookAheadFrame = sampleCurveFrame(curve, lookAheadT);
    const lookTarget = lookAheadFrame.position
      .clone()
      .addScaledVector(lookAheadFrame.normal, eyeElevation * 0.9);

    targetCamPos.current.copy(cameraPosition);
    targetLookAt.current.copy(lookTarget);

    // Smooth lerp to camera coordinates
    camera.position.lerp(targetCamPos.current, 0.15);
    currentLookAt.current.lerp(targetLookAt.current, 0.2);
    camera.lookAt(currentLookAt.current);

    // Cinematic banking roll: tilt camera into turns
    const currentRoll = camera.rotation.z;
    camera.rotation.z = THREE.MathUtils.damp(currentRoll, frame.bankAngle, 3.5, delta);
  });

  return null;
};
