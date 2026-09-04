"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

type Region = 'IN' | 'US' | 'AE' | null;

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
    const initRegion = async () => {
      const saved = localStorage.getItem('hde_region') as Region;
      if (saved === 'IN' || saved === 'US' || saved === 'AE') {
        setRegionState(saved);
        setIsReady(true);
        return;
      }

      try {
        // Auto-detect based on Vercel IP Geolocation
        const res = await fetch('/api/geo');
        const data = await res.json();
        
        if (data.country === 'US') {
          setRegionState('US');
          localStorage.setItem('hde_region', 'US');
        } else if (data.country === 'AE') {
          setRegionState('AE');
          localStorage.setItem('hde_region', 'AE');
        } else {
          // Default all other traffic (including India) to IN
          setRegionState('IN');
          localStorage.setItem('hde_region', 'IN');
        }
      } catch (e) {
        // Fallback to IN if the API fails
        setRegionState('IN');
        localStorage.setItem('hde_region', 'IN');
      }
      setIsReady(true);
    };

    initRegion();
  }, []);

  const setRegion = (r: Region) => {
    if (isReady && r && r !== region) {
      const msgs: Record<string, string> = {
        'US': "Switched to USA Mode 🇺🇸",
        'IN': "Switched to India Mode 🇮🇳",
        'AE': "Switched to UAE Mode 🇦🇪",
      };
      setToastMsg(msgs[r] || "Region changed");
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
