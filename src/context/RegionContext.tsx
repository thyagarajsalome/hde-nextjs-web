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

  useEffect(() => {
    const saved = localStorage.getItem('hde_region') as Region;
    if (saved === 'IN' || saved === 'US') {
      setRegionState(saved);
    }
    setIsReady(true);
  }, []);

  const setRegion = (r: Region) => {
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
    </RegionContext.Provider>
  );
};

export const useRegion = () => useContext(RegionContext);
