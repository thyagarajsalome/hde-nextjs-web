"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Region = 'IN' | 'US' | null;

interface RegionContextType {
  region: Region;
  setRegion: (r: Region) => void;
  isReady: boolean;
}

const RegionContext = createContext<RegionContextType>({
  region: null,
  setRegion: () => {},
  isReady: false,
});

export const RegionProvider = ({ children }: { children: React.ReactNode }) => {
  const [region, setRegionState] = useState<Region>(null);
  const [isReady, setIsReady] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hde_region') as Region;
    if (saved === 'IN' || saved === 'US') {
      setRegionState(saved);
    } else {
      // Auto-detect based on timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && (tz.startsWith('America/') || tz.startsWith('US/'))) {
          setRegionState('US');
          localStorage.setItem('hde_region', 'US');
        }
      } catch (e) {
        // Fallback to null if Intl is unsupported
      }
    }
    setIsReady(true);
  }, []);

  const setRegion = (r: Region) => {
    if (isReady && r && r !== region) {
      setToastMsg(r === 'US' ? "Switched to USA Mode 🇺🇸" : "Switched to India Mode 🇮🇳");
      setTimeout(() => setToastMsg(null), 3000);
    }

    setRegionState(r);
    if (r) {
      localStorage.setItem('hde_region', r);
    } else {
      localStorage.removeItem('hde_region');
    }
  };

  return (
    <RegionContext.Provider value={{ region, setRegion, isReady }}>
      {children}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 animate-fade-in-up">
          <i className="fas fa-check-circle text-green-400"></i>
          {toastMsg}
        </div>
      )}
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
