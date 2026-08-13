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
  | "usa-framing";

export default function CalculatorFeature() {
  const { hasPaid } = useUser();
  const { region } = useRegion();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>("construction");

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "construction":  return <ConstructionCalculator />;
      case "usa-framing":   return <USAFramingCalculator />;
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
      {/* Service Disclaimer Notice */}
      <div className="mb-6 flex items-start gap-4 px-5 py-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-sm backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 mt-0.5">
          <i className="fas fa-info-circle text-base"></i>
        </span>
        <div className="space-y-1">
          <h5 className="font-semibold text-amber-900 leading-tight">HDE Budget & Estimation Notice</h5>
          <p className="text-amber-800/90 leading-relaxed font-medium">
            Home Design English (HDE) is strictly an **estimation and budgeting platform**. We provide calculations, material list forecasts, and planning tools. HDE is **not** a construction developer, contractor, or builder, and does not execute or take liability for physical house construction.
          </p>
        </div>
      </div>

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