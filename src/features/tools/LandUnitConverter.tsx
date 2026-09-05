'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { LAND_UNITS, convertUnits } from '@/data/landUnits';

interface LandUnitConverterProps {
  initialFrom?: string;
  initialTo?: string;
  initialValue?: number;
  showAllUnitsTable?: boolean;
}

export default function LandUnitConverter({
  initialFrom = 'gunta',
  initialTo = 'sqft',
  initialValue = 1,
  showAllUnitsTable = true,
}: LandUnitConverterProps) {
  const [fromUnit, setFromUnit] = useState<string>(initialFrom);
  const [toUnit, setToUnit] = useState<string>(initialTo);
  const [inputValue, setInputValue] = useState<string>(initialValue.toString());

  const numValue = useMemo(() => {
    const parsed = parseFloat(inputValue);
    return isNaN(parsed) ? 0 : parsed;
  }, [inputValue]);

  const convertedValue = useMemo(() => {
    return convertUnits(numValue, fromUnit, toUnit);
  }, [numValue, fromUnit, toUnit]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handlePreset = (val: number) => {
    setInputValue(val.toString());
  };

  const fromObj = LAND_UNITS[fromUnit] || LAND_UNITS.gunta;
  const toObj = LAND_UNITS[toUnit] || LAND_UNITS.sqft;

  // Format number cleanly
  const formatNum = (n: number) => {
    if (n === 0) return '0';
    if (n >= 1000) {
      return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(n);
    }
    return Number(n.toFixed(4)).toString();
  };

  // Convert to equivalent in all major units
  const allConversions = useMemo(() => {
    const majorKeys = ['sqft', 'gunta', 'bigha', 'cent', 'ground', 'gaj', 'acre', 'sqm'];
    return majorKeys.map(key => {
      const u = LAND_UNITS[key];
      const val = convertUnits(numValue, fromUnit, key);
      return {
        unit: u,
        value: val
      };
    });
  }, [numValue, fromUnit]);

  // Sqft equivalent for construction estimator CTA
  const sqftEquivalent = useMemo(() => {
    return convertUnits(numValue, fromUnit, 'sqft');
  }, [numValue, fromUnit]);

  return (
    <div className="w-full space-y-6">
      {/* Interactive Converter Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Instant Land Measurement Tool
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
              {fromObj.name} to {toObj.name} Calculator
            </h2>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-gray-400 font-medium">Formula Ratio</span>
            <div className="text-xs font-bold text-slate-700">
              1 {fromObj.name} = {formatNum(convertUnits(1, fromUnit, toUnit))} {toObj.plural}
            </div>
          </div>
        </div>

        {/* Converter Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* FROM Input */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              From: Value & Unit
            </label>
            <div className="flex rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary overflow-hidden bg-gray-50/50">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="1"
                min="0"
                step="any"
                autoComplete="off"
                className="w-full px-4 py-3.5 bg-transparent font-black text-xl text-slate-900 focus:outline-none"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="bg-gray-100/90 border-l border-gray-200 px-3 py-3.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[140px]"
              >
                {Object.values(LAND_UNITS).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              {fromObj.region}
            </div>
          </div>

          {/* SWAP Button */}
          <div className="md:col-span-2 flex justify-center py-2 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className="w-12 h-12 rounded-full bg-secondary text-white hover:bg-primary transition shadow-md flex items-center justify-center text-base cursor-pointer transform active:scale-95"
              title="Swap units"
            >
              <i className="fas fa-exchange-alt"></i>
            </button>
          </div>

          {/* TO Output */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
              To: Converted Result
            </label>
            <div className="flex rounded-xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">
              <div className="w-full px-4 py-3.5 font-black text-xl text-emerald-900 truncate">
                {formatNum(convertedValue)}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="bg-emerald-100/60 border-l border-emerald-200 px-3 py-3.5 text-xs font-bold text-emerald-900 focus:outline-none cursor-pointer max-w-[140px]"
              >
                {Object.values(LAND_UNITS).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-gray-400 truncate">
              {toObj.region}
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 mr-1">Quick Presets:</span>
          {[1, 2, 5, 10, 20, 50, 100].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handlePreset(val)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                numValue === val
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {val} {fromObj.name}
            </button>
          ))}
        </div>

        {/* Primary Dynamic Answer Box */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-slate-900 to-secondary text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-300 font-medium">Conversion Summary</div>
            <div className="text-lg sm:text-xl font-extrabold mt-0.5">
              <span className="text-primary">{formatNum(numValue)} {fromObj.name}</span> = <span className="text-emerald-400">{formatNum(convertedValue)} {toObj.plural}</span>
            </div>
          </div>

          {sqftEquivalent > 0 && (
            <Link
              href="/cost/construction-in-bengaluru"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md transition flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-hard-hat"></i>
              <span>Estimate Construction on {Math.round(sqftEquivalent).toLocaleString()} sq ft →</span>
            </Link>
          )}
        </div>
      </div>

      {/* Multi-Unit Instant Breakdown Grid */}
      {showAllUnitsTable && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <i className="fas fa-th-list text-primary"></i>
            <span>{formatNum(numValue)} {fromObj.name} in All Common Indian Units</span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Instant equivalencies across North, South, and Central Indian land records.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allConversions.map(({ unit, value }) => {
              const isCurrent = unit.id === fromUnit;
              return (
                <div
                  key={unit.id}
                  className={`p-3.5 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-primary/5 border-primary ring-1 ring-primary'
                      : 'bg-gray-50/70 border-gray-150 hover:bg-white'
                  }`}
                >
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">
                    {unit.name}
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1 truncate">
                    {formatNum(value)}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-0.5">
                    {unit.symbol}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
