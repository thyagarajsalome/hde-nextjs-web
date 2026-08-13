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
  | "usa-framing" | "usa-roofing";

export default function CalculatorFeature() {
  const { hasPaid } = useUser();
  const { region } = useRegion();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("construction");

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "construction":  return <ConstructionCalculator />;
      case "usa-framing":   return <USAFramingCalculator />;
      case "usa-roofing":   return <USARoofingCalculator />;
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
