import React, { useMemo } from 'react';
import { useJourneyStore } from '@/stores/useJourneyStore';
import { generateSplineCurve, calculateProjectPlacements } from '@/lib/splineMath';
import { SplineRoad } from './SplineRoad';
import { ProjectLandmark } from './landmarks/ProjectLandmark';
import { AtmosphericSky } from './world/AtmosphericSky';
import { AtmosphericLighting } from './world/AtmosphericLighting';
import { TerrainLandscape } from './world/TerrainLandscape';
import { DistantScenery } from './world/DistantScenery';
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
      {/* 1. Atmospheric Lighting & Aerial Fog */}
      <AtmosphericLighting />

      {/* 2. Celestial Sky Dome & Atmospheric Horizon Gradient */}
      <AtmosphericSky />

      {/* 3. Foundational Planetary Bedrock & Canyon Terraces */}
      <TerrainLandscape curve={curve} />

      {/* 4. Distant Architectural Monoliths & Telemetry Beacons */}
      <DistantScenery curve={curve} />

      {/* 5. Departure Threshold Launch Promenade & Framing Portal (t = 0) */}
      <DepartureThreshold />

      {/* 6. Multi-layered Illuminated Viaduct Highway */}
      <SplineRoad projects={projects} />

      {/* 7. Proximity-Awakened Architectural Project Exhibit Landmarks */}
      {projectPlacements.map(({ project, position, tangent, index, t, rotationY }) => (
        <ProjectLandmark
          key={project.id}
          project={project}
          position={position}
          tangent={tangent}
          index={index}
          t={t}
          rotationY={rotationY}
        />
      ))}

      {/* 8. Systems Observatory (About & Engineering Disciplines Pavilion at t = 0.885) */}
      <SystemsObservatory curve={curve} />

      {/* 9. Terminal Threshold (Ending Section at t = 0.965) */}
      <TerminalThreshold curve={curve} />

      {/* 10. Unified JourneyController (Spline physics, banking roll, exhibit inspection) */}
      <JourneyController curve={curve} projectPlacements={projectPlacements} />
    </>
  );
};
