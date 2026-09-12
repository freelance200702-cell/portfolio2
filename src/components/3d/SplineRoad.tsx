import React, { useMemo } from 'react';
import type { Project } from '@/types/project';
import { useUIStore } from '@/stores/useUIStore';
import { generateSplineCurve } from '@/lib/splineMath';
import { PhysicalRoadbed } from './path/PhysicalRoadbed';
import { StructuralGuardrail } from './path/StructuralGuardrail';
import { RoadwayAppurtenances } from './path/RoadwayAppurtenances';
import { RecessedCurbGuides } from './path/RecessedCurbGuides';

interface SplineRoadProps {
  projects: Project[];
}

/**
 * SplineRoad: Navigable Physical Viaduct Highway
 * Redesigned from a glowing wire/laser into a physical engineering route through the world.
 *
 * Modular Path Visual System:
 * 1. PhysicalRoadbed: PBR asphalt/basalt deck with aggregate roughness, tire lanes, modular expansion joints, precast curbs, and box girder keel
 * 2. StructuralGuardrail: Continuous steel W-beam safety barriers framing the edges
 * 3. RoadwayAppurtenances: Concrete viaduct piers, steel stanchions, matte traffic centerlines, flush retroreflectors
 * 4. RecessedCurbGuides: Low-energy recessed curb path luminaires casting subtle downlight
 *
 * Preserves 100% of underlying spline math, dynamic project count, and journey camera logic.
 */
export const SplineRoad: React.FC<SplineRoadProps> = ({ projects }) => {
  const curve = useMemo(() => generateSplineCurve(projects), [projects]);
  const qualityPreset = useUIStore((s) => s.qualityPreset);

  const ROAD_WIDTH = 2.8;
  const DECK_THICKNESS = 0.16;

  // Adaptive geometry density scaled by device tier and qualityPreset
  const sampleCount = useMemo(() => {
    const totalLength = curve.getLength();
    const density = qualityPreset === 'mobile' ? 0.75 : qualityPreset === 'balanced' ? 1.1 : 1.5;
    const minSamples = qualityPreset === 'mobile' ? 120 : 240;
    const maxSamples = qualityPreset === 'mobile' ? 500 : 1200;
    return Math.max(minSamples, Math.min(maxSamples, Math.round(totalLength * density)));
  }, [curve, qualityPreset]);

  return (
    <group>
      {/* 1. Physical Navigable Roadbed Surface (Deck, Precast Curbs & Under-Deck Box Girder) */}
      <PhysicalRoadbed
        curve={curve}
        roadWidth={ROAD_WIDTH}
        deckThickness={DECK_THICKNESS}
        sampleCount={sampleCount}
      />

      {/* 2. Structural Steel Safety Guardrails (Crisp, Non-Glowing Geometric Edge Separation) */}
      <StructuralGuardrail
        curve={curve}
        roadWidth={ROAD_WIDTH}
        deckThickness={DECK_THICKNESS}
        sampleCount={sampleCount}
      />

      {/* 3. Roadway Appurtenances (Reinforced Piers, Centerline Paint, Retroreflective Studs, Stanchions) */}
      <RoadwayAppurtenances
        curve={curve}
        roadWidth={ROAD_WIDTH}
        deckThickness={DECK_THICKNESS}
      />

      {/* 4. Recessed Downward Curb Guidance Luminaires (Controlled Scale & Night Contrast) */}
      <RecessedCurbGuides
        curve={curve}
        roadWidth={ROAD_WIDTH}
        deckThickness={DECK_THICKNESS}
      />
    </group>
  );
};
