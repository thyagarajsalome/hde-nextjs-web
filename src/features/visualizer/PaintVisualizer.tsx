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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-extrabold text-secondary dark:text-zinc-100 tracking-tight">
          Virtual Paint Visualizer
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 font-medium">
          Visualize 500+ premium paint colors instantly on interior and exterior walls.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Visualization Area */}
        <div className="lg:col-span-8 relative bg-gray-100 dark:bg-zinc-950 flex flex-col justify-between">
          
          {/* Room Selector Navbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700">
            {ROOM_CONFIGS.map(room => (
              <button
                key={room.id}
                onClick={() => {
                  setCurrentRoom(room);
                  setCurrentColor(null);
                }}
                className={\px-4 py-2 rounded-full text-sm font-bold transition-all \\}
              >
                {room.label}
              </button>
            ))}
          </div>

          {/* Image Container */}
          <div className="relative w-full aspect-[4/3] flex-grow">
            {/* Base Room Image */}
            <img 
              src={\\/base.jpg\}
              alt="Base Room"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Color Overlay */}
            {currentColor && (
              <img 
                src={\\/\.jpg\}
                alt="Color Overlay"
                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply transition-opacity duration-300"
              />
            )}
          </div>
          
          {/* Bottom Details Panel */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 flex justify-between items-center">
            {currentColor ? (
              <div className="flex gap-4 items-center">
                <div 
                  className="w-12 h-12 rounded-full shadow-inner border border-gray-200"
                  style={{ backgroundColor: colors[currentColor] }}
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {rgbStringToHex(colors[currentColor])}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {activeCategory} Category • {currentRoom.label}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 font-medium text-sm flex items-center gap-2">
                <i className="fas fa-paint-brush"></i> Select a color to visualize
              </div>
            )}
            
            <button 
              onClick={() => setCurrentColor(null)}
              className="p-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-bold text-sm"
              disabled={!currentColor}
            >
              <i className="fas fa-undo"></i> Reset
            </button>
          </div>
        </div>

        {/* Right Side: Color Picker */}
        <div className="lg:col-span-4 flex flex-col border-l border-gray-200 dark:border-zinc-800 max-h-[800px] overflow-hidden">
          {/* Categories Tab */}
          <div className="flex flex-wrap p-4 gap-2 bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-800">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={\px-3 py-1.5 rounded-lg text-xs font-bold transition-all border \\}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Color Grid */}
          <div className="p-4 flex-grow overflow-y-auto">
            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {availableColors.map(colorId => (
                <button
                  key={colorId}
                  onClick={() => setCurrentColor(colorId)}
                  className={\spect-square rounded-full transition-transform hover:scale-110 shadow-sm border-2 \\}
                  style={{ backgroundColor: colors[colorId] }}
                  title={\Color \\}
                />
              ))}
            </div>
            {availableColors.length === 0 && (
              <p className="text-center text-gray-500 mt-10">No colors found in this category.</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}