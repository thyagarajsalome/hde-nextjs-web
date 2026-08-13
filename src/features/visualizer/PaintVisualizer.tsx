"use client";
import React, { useState, useMemo } from 'react';
import { colors, getCategorizedColors, CATEGORIES, rgbStringToHex } from './colors';

const ROOM_CONFIGS = [
  { id: 'livingroom', label: 'Living Room', basePath: '/paint-visualizer/images-livingroom' },
  { id: 'kitchen', label: 'Kitchen', basePath: '/paint-visualizer/images-kitchen' },
  { id: 'bedroom', label: 'Bedroom', basePath: '/paint-visualizer/images-bedroom' },
  { id: 'exterior', label: 'Exterior', basePath: '/paint-visualizer/images-exterior' }
];

export default function PaintVisualizer() {
  const [currentRoom, setCurrentRoom] = useState(ROOM_CONFIGS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('Red');
  const [currentColor, setCurrentColor] = useState<string | null>(null);

  const categorizedColors = useMemo(() => getCategorizedColors(), []);
  const availableColors = categorizedColors[activeCategory] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-secondary dark:text-zinc-100 tracking-tight">
          Virtual Paint Visualizer
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 font-medium text-sm lg:text-base max-w-2xl mx-auto">
          Visualize 500+ premium paint colors instantly on interior and exterior walls.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 flex-col lg:flex-row">
        
        {/* Left Side: Visualization Area */}
        <div className="lg:col-span-8 bg-gray-100 dark:bg-zinc-950 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-zinc-800 relative">
          
          {/* Room Selector Navbar */}
          <div className="p-4 flex justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-zinc-800 z-10">
            <div className="flex gap-1 lg:gap-2 flex-wrap justify-center">
              {ROOM_CONFIGS.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    setCurrentRoom(room);
                    setCurrentColor(null);
                  }}
                  className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-bold transition-all ${
                    currentRoom.id === room.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {room.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Container */}
          <div className="relative w-full flex-grow flex items-center justify-center bg-zinc-200 dark:bg-zinc-950 min-h-[300px] lg:min-h-[500px]">
            {/* Base Room Image */}
            <img 
              src={`${currentRoom.basePath}/base.jpg`}
              alt="Base Room"
              className="absolute inset-0 w-full h-full object-contain"
            />
            
            {/* Color Overlay */}
            {currentColor && (
              <img 
                src={`${currentRoom.basePath}/${currentColor}.jpg`}
                alt="Color Overlay"
                className="absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
              />
            )}
          </div>
          
          {/* Bottom Details Panel */}
          <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center z-10">
            {currentColor ? (
              <div className="flex gap-3 lg:gap-4 items-center">
                <div 
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full shadow-inner border border-gray-200"
                  style={{ backgroundColor: colors[currentColor] }}
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {rgbStringToHex(colors[currentColor])}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {activeCategory} • {currentRoom.label}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 font-medium text-xs lg:text-sm flex items-center gap-2">
                <i className="fas fa-paint-brush"></i> Select a color to visualize
              </div>
            )}
            
            <button 
              onClick={() => setCurrentColor(null)}
              className="px-3 py-1.5 lg:px-4 lg:py-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-xl transition-colors font-bold text-xs lg:text-sm"
              disabled={!currentColor}
            >
              <i className="fas fa-undo mr-1 lg:mr-2"></i> Reset
            </button>
          </div>
        </div>

        {/* Right Side: Color Picker */}
        <div className="lg:col-span-4 flex flex-col h-[400px] lg:h-[700px]">
          {/* Categories Tab */}
          <div className="flex flex-wrap p-3 gap-1.5 bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg text-[10px] lg:text-xs font-bold transition-all border ${
                  activeCategory === cat
                    ? 'bg-gray-800 border-gray-800 text-white dark:bg-white dark:border-white dark:text-zinc-900'
                    : 'bg-white border-gray-200 text-gray-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 hover:border-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Color Grid */}
          <div className="p-4 flex-grow overflow-y-auto">
            <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-6 xl:grid-cols-8 gap-2 lg:gap-3">
              {availableColors.map(colorId => (
                <button
                  key={colorId}
                  onClick={() => setCurrentColor(colorId)}
                  className={`aspect-square rounded-full transition-transform hover:scale-110 shadow-sm border-2 ${
                    currentColor === colorId ? 'border-primary ring-2 ring-primary/50 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: colors[colorId] }}
                  title={`Color ${colorId}`}
                />
              ))}
            </div>
            {availableColors.length === 0 && (
              <p className="text-center text-gray-500 mt-10 text-sm">No colors found in this category.</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}