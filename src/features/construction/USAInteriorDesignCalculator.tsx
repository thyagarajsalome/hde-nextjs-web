'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Chart from '@/components/ui/Chart';
import { useProjectActions } from '@/hooks/useProjectActions';

export default function USAInteriorDesignCalculator() {
  const [roomType, setRoomType] = useState('Living Room');
  const [quality, setQuality] = useState('Mid-Range');
  const [sqft, setSqft] = useState(250);

  const { isSaving, saveProject } = useProjectActions('usa-interior-design');

  const calculateCosts = () => {
    let baseRate = 0;
    
    // Base rate per sqft for furniture and decor
    if (quality === 'Budget') baseRate = 25;
    else if (quality === 'Mid-Range') baseRate = 50;
    else if (quality === 'Luxury') baseRate = 120;

    // Room multipliers
    let multiplier = 1.0;
    if (roomType === 'Kitchen') multiplier = 1.5;
    if (roomType === 'Full Home') multiplier = 0.8; // bulk discount effect

    const furniture = sqft * baseRate * multiplier;
    const paint = sqft * 3; // $3 per sqft for paint/wallpaper
    const lighting = sqft * 5 * (quality === 'Luxury' ? 2 : 1);
    const totalBeforeFees = furniture + paint + lighting;
    const designerFees = totalBeforeFees * 0.15; // 15% standard fee
    const grandTotal = totalBeforeFees + designerFees;

    return {
      furniture,
      paint,
      lighting,
      designerFees,
      grandTotal
    };
  };

  const results = calculateCosts();

  const chartData = {
    'Furniture & Decor': results.furniture,
    'Paint/Wallcoverings': results.paint,
    'Lighting': results.lighting,
    'Designer Fees': results.designerFees
  };

  const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Interior Design Budget Estimator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-primary focus:border-primary"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="Living Room">Living Room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Full Home">Full Home</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Level</label>
              <select
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-primary focus:border-primary"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
              >
                <option value="Budget">Budget (IKEA, Target)</option>
                <option value="Mid-Range">Mid-Range (West Elm, CB2)</option>
                <option value="Luxury">Luxury (Custom, RH)</option>
              </select>
            </div>
            <Input
              label="Square Footage"
              type="number"
              value={sqft}
              onChange={(e: any) => setSqft(Number(e.target.value))}
            />
          </div>

          <div className="bg-primary-50 p-6 rounded-lg text-center mb-6 border border-primary-100">
            <p className="text-sm text-primary-600 font-bold uppercase tracking-wide mb-1">Estimated Budget</p>
            <p className="text-5xl font-black text-primary-900">{formatCurrency(results.grandTotal)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Furniture & Decor</span>
                  <span className="font-medium">{formatCurrency(results.furniture)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Paint & Wallcoverings</span>
                  <span className="font-medium">{formatCurrency(results.paint)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Lighting & Fixtures</span>
                  <span className="font-medium">{formatCurrency(results.lighting)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Professional Designer Fees (15%)</span>
                  <span className="font-medium">{formatCurrency(results.designerFees)}</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex justify-center">
              <Chart data={chartData} colors={chartColors} />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => saveProject({ type: 'usa-interior-design', results, sqft, quality, roomType }, results.grandTotal)}
              disabled={isSaving}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-600 transition disabled:opacity-50"
            >
              <i className="fas fa-save mr-2"></i>
              {isSaving ? 'Saving...' : 'Save Design Budget'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
