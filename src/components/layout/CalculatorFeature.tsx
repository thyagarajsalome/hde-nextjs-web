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
import USAFlooringCalculator from "@/features/construction/USAFlooringCalculator";
import USAPlumbingCalculator from "@/features/construction/USAPlumbingCalculator";
import USAElectricalCalculator from "@/features/construction/USAElectricalCalculator";
import USARentVsBuyCalculator from "@/features/construction/USARentVsBuyCalculator";
import USASalaryCalculator from "@/features/construction/USASalaryCalculator";
import USAPropertyTaxCalculator from "@/features/construction/USAPropertyTaxCalculator";
import USARemodelROICalculator from "@/features/construction/USARemodelROICalculator";
import USAInteriorDesignCalculator from "@/features/construction/USAInteriorDesignCalculator";
import USAGardenBedCalculator from "@/features/construction/USAGardenBedCalculator";
import USAKitchenRemodelCalculator from "@/features/construction/USAKitchenRemodelCalculator";
import USAHomeAdditionCalculator from "@/features/construction/USAHomeAdditionCalculator";
import USASwimmingPoolCalculator from "@/features/construction/USASwimmingPoolCalculator";
import USAPickleballCalculator from "@/features/construction/USAPickleballCalculator";
import USAOutdoorKitchenCalculator from "@/features/construction/USAOutdoorKitchenCalculator";
import PaintVisualizer from "@/features/visualizer/PaintVisualizer";
import IndiaEMICalculator from "@/features/construction/IndiaEMICalculator";
import { useUser } from "@/context/UserContext";
import { useGSAPTabSwitch } from "@/hooks/useGSAP";
import { useRegion } from "@/context/RegionContext";

type CalculatorType = "construction" | "india-emi" | "interior" | "doors-windows" | "flooring" | "painting" | "plumbing" | "electrical" | "materials" | "usa-framing" | "usa-roofing" | "usa-accent-wall" | "usa-flooring" | "usa-plumbing" | "usa-electrical" | "usa-rent-vs-buy" | "usa-salary-calculator" | "usa-property-tax" | "usa-remodel-roi" | "usa-garden-bed" | "usa-interior-design" | "usa-kitchen-remodel" | "usa-home-addition" | "usa-swimming-pool" | "usa-pickleball-court" | "usa-outdoor-kitchen" | "visualizer";

interface CalculatorFeatureProps {
  forceRegion?: "US" | "IN";
  forceCalculator?: CalculatorType;
}

export default function CalculatorFeature({ forceRegion, forceCalculator }: CalculatorFeatureProps = {}) {
  const { hasPaid } = useUser();
  const { region, setRegion } = useRegion();
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>(forceCalculator || "construction");

  // Force region switch based on props (e.g. from pSEO pages)
  React.useEffect(() => {
    if (forceRegion && region !== forceRegion) {
      setRegion(forceRegion);
      // Auto-switch default calculator tab if they entered a US page
      if (forceRegion === 'US' && activeCalculator === 'construction' && !forceCalculator) {
        setActiveCalculator('usa-framing');
      }
    }
  }, [forceRegion, region, setRegion, activeCalculator, forceCalculator]);

  // Update active calculator if prop changes
  React.useEffect(() => {
    if (forceCalculator) {
      setActiveCalculator(forceCalculator);
    }
  }, [forceCalculator]);

  const renderCalculator = () => {
    switch (activeCalculator) {
      case "construction":  return <ConstructionCalculator />;
      case "india-emi":     return <IndiaEMICalculator />;
      case "usa-framing":   return <USAFramingCalculator />;
      case "usa-roofing":   return <USARoofingCalculator />;
      case "usa-accent-wall":   return <USAAccentWallCalculator />;
      case "usa-flooring":  return <USAFlooringCalculator />;
      case "usa-plumbing":  return <USAPlumbingCalculator />;
      case "usa-electrical":return <USAElectricalCalculator />;
      case "usa-rent-vs-buy":return <USARentVsBuyCalculator />;
      case "usa-salary-calculator": return <USASalaryCalculator />;
      case "usa-property-tax": return <USAPropertyTaxCalculator />;
      case "usa-remodel-roi": return <USARemodelROICalculator />;
      case "usa-garden-bed": return <USAGardenBedCalculator />;
      case "usa-interior-design": return <USAInteriorDesignCalculator />;
      case "usa-kitchen-remodel": return <USAKitchenRemodelCalculator />;
      case "usa-home-addition": return <USAHomeAdditionCalculator />;
      case "usa-swimming-pool": return <USASwimmingPoolCalculator />;
      case "usa-pickleball-court": return <USAPickleballCalculator />;
      case "usa-outdoor-kitchen": return <USAOutdoorKitchenCalculator />;
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

  // If UAE is selected, intercept and show a dedicated Dubai CTA
  if (region === 'AE') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl" id="tools">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 dark:text-zinc-100">
            Dubai Property <span className="text-primary">Calculator</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto dark:text-zinc-400">
            Planning to invest in Dubai? Calculate exact DLD fees, agent commissions, mortgage costs, and ROI.
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-950 p-10 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-zinc-800">
          <div className="text-6xl mb-6">🇦🇪</div>
          <h3 className="text-2xl font-bold mb-4 dark:text-zinc-100">Dedicated Dubai Investment Calculator</h3>
          <p className="text-gray-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
            Our UAE suite is tailored specifically for real estate buyers and investors in Dubai, providing accurate breakdowns of government fees, Oqood registration, and mortgage charges.
          </p>
          <a 
            href="/dubai-property/calculator" 
            className="inline-block bg-primary hover:bg-primary-hover text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-transform hover:-translate-y-1"
          >
            Open Dubai Calculator
          </a>
        </div>
      </div>
    );
  }

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

