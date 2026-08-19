"use client";

import React, { useState } from "react";
import CalculatorTabs from "@/features/construction/CalculatorTabs";
import ConstructionCalculator from "@/features/construction/ConstructionCalculator";
import FlooringCalculator from "@/features/construction/FlooringCalculator";
import PaintingCalculator from "@/features/construction/PaintingCalculator";
import PlumbingCalculator from "@/features/construction/PlumbingCalculator";
import ElectricalCalculator from "@/features/construction/ElectricalCalculator";
import InteriorCalculator from "@/features/construction/InteriorCalculator";
import DoorsWindowsCalculator from "@/features/construction/DoorsWindowsCalculator";
import MaterialQuantityCalculator from "@/features/construction/MaterialQuantityCalculator";
import USAFramingCalculator from "@/features/construction/USAFramingCalculator";
import USARoofingCalculator from "@/features/construction/USARoofingCalculator";
import USAAccentWallCalculator from "@/features/construction/USAAccentWallCalculator";
import PaintVisualizer from "@/features/visualizer/PaintVisualizer";
import { useUser } from "@/context/UserContext";
import { useGSAPTabSwitch } from "@/hooks/useGSAP";
import { useRegion } from "@/context/RegionContext";

type CalculatorType =
  | "construction"
  | "interior"
  | "doors-windows"
  | "flooring"
  | "painting"
  | "plumbing"
  | "electrical"
  | "materials"
  | "usa-framing" | "usa-roofing" | "usa-accent-wall" | "visualizer";

interface CalculatorFeatureProps {
  forceRegion?: "US" | "IN";
}

export default function CalculatorFeature({ forceRegion }: CalculatorFeatureProps = {}) {
  const { hasPaid } = useUser();
  const { region, setRegion } = useRegion();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("construction");

  // Force region switch based on props (e.g. from pSEO pages)
  React.useEffect(() => {
    if (forceRegion && region !== forceRegion) {
      setRegion(forceRegion);
      // Auto-switch default calculator tab if they entered a US page
      if (forceRegion === 'US' && activeCalculator === 'construction') {
        setActiveCalculator('usa-framing');
      }
    }
  }, [forceRegion, region, setRegion, activeCalculator]);

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "construction":  return <ConstructionCalculator />;
      case "usa-framing":   return <USAFramingCalculator />;
      case "usa-roofing":   return <USARoofingCalculator />;
      case "usa-accent-wall":   return <USAAccentWallCalculator />;
      case "visualizer":    return <PaintVisualizer />;
      case "materials":     return <MaterialQuantityCalculator />;
      case "interior":      return <InteriorCalculator hasPaid={hasPaid} />;
      case "doors-windows": return <DoorsWindowsCalculator hasPaid={hasPaid} />;
      case "flooring":      return <FlooringCalculator />;
      case "painting":      return <PaintingCalculator />;
      case "plumbing":      return <PlumbingCalculator />;
      case "electrical":    return <ElectricalCalculator />;
      default:              return region === 'US' ? <USAFramingCalculator /> : <ConstructionCalculator />;
    }
  };

  const { panelRef } = useGSAPTabSwitch(activeCalculator);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" id="tools">
      <CalculatorTabs 
        activeCalculator={activeCalculator} 
        setActiveCalculator={setActiveCalculator} 
        hasPaid={hasPaid}
      />

      <div ref={panelRef} className="mt-8 min-h-[600px]">
        {renderCalculator()}
      </div>
    </div>
  );
}

