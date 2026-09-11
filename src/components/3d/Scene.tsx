import React, { useMemo } from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { generateSplineCurve, calculateProjectPlacements } from '@/lib/splineMath';
import { SplineRoad } from './SplineRoad';
import { ProjectNode } from './ProjectNode';
import { Environment } from './Environment';
import { JourneyController } from './JourneyController';
import { DepartureThreshold } from './DepartureThreshold';
import { SystemsObservatory } from './SystemsObservatory/SystemsObservatory';
import { TerminalThreshold } from './TerminalThreshold';

export const Scene: React.FC = () => {
  const projects = useJourneyStore((s) => s.projects);
  const curve = useMemo(() => generateSplineCurve(projects), [projects]);

  // Deterministic collision-free project exhibit placements with adaptive spacing & orientation
  const projectPlacements = useMemo(
    () => calculateProjectPlacements(projects, curve),
    [projects, curve]
  );

  return (
    <>
      {/* 1. Atmospheric Environment & Horizon Grid */}
      <Environment />

      {/* 2. Departure Threshold (Physical 3D origin at t = 0) */}
      <DepartureThreshold />

      {/* 3. Reusable JourneyController (adaptive look-ahead, spline physics, banking, inspection) */}
      <JourneyController curve={curve} projectPlacements={projectPlacements} />

      {/* 4. Multi-layered Illuminated Spline Road */}
      <SplineRoad projects={projects} />

      {/* 5. Proximity-Awakened Architectural Project Exhibits */}
      {projectPlacements.map(({ project, position, tangent, index, t, rotationY }) => (
        <ProjectNode
          key={project.id}
          project={project}
          position={position}
          tangent={tangent}
          index={index}
          t={t}
          rotationY={rotationY}
        />
      ))}

      {/* 6. Systems Observatory (About & Engineering Disciplines Pavilion at t = 0.885) */}
      <SystemsObservatory curve={curve} />

      {/* 7. Terminal Threshold (Ending Section at t = 0.965) */}
      <TerminalThreshold curve={curve} />
    </>
  );
};
