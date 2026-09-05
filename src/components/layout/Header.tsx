"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useRegion } from "../../context/RegionContext";

const REGIONS = [
  { code: 'IN', label: 'India', flag: 'in', short: 'IND' },
  { code: 'US', label: 'USA', flag: 'us', short: 'USA' },
  { code: 'AE', label: 'UAE', flag: 'ae', short: 'UAE' },
] as const;

const Header = () => {
  const { user, hasPaid, signOut } = useUser();
  const { region, setRegion } = useRegion();
  const navigate = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  const currentRegion = REGIONS.find(r => r.code === region) || REGIONS[0];
  const isDubaiRoute = pathname.includes('/dubai-property');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedOutsideDesktop = dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(target);
      const clickedOutsideMobileBtn = mobileButtonRef.current && !mobileButtonRef.current.contains(target);
      
      if (clickedOutsideDesktop && clickedOutsideMobile && clickedOutsideMobileBtn) {
        setRegionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRegionSelect = (code: 'IN' | 'US' | 'AE') => {
    setRegionDropdownOpen(false);
    setMenuOpen(false);
    if (code === 'AE') {
      setRegion('AE');
      navigate.push('/dubai-property');
    } else {
      setRegion(code);
      if (isDubaiRoute) {
        navigate.push('/');
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate.push("/signin");
    setMenuOpen(false);
  };

  // Determine active region for display
  const activeRegion = isDubaiRoute ? REGIONS[2] : currentRegion;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 shadow-sm transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-secondary dark:text-zinc-100 hover:text-primary transition-colors no-underline">
              <img src="/bg-logo.png" alt="HDE Logo" className="w-12 h-12 object-contain" />
              <span className="text-primary font-extrabold">HDE</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-6 text-sm">
            <Link href="/" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline whitespace-nowrap">Home</Link>
            
            {/* India-only links */}
            {activeRegion.code === 'IN' && (
              <>
                <Link href="/plans" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">House Plans</Link>
                <Link href="/app" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">HDE App</Link>
              </>
            )}

            {/* UAE-only links */}
            {activeRegion.code === 'AE' && (
              <>
                <Link href="/dubai-property" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">Dubai Property</Link>
                <Link href="/dubai-property/calculator" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">Cost Calculator</Link>
              </>
            )}

            {/* Prominent Dubai Property Link (visible across all modes for cross-selling & NRI traffic) */}
            {activeRegion.code !== 'AE' && (
              <Link 
                href="/dubai-property" 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all no-underline"
              >
                <span>🇦🇪</span>
                <span>Dubai Property</span>
                <span className="text-[9px] bg-primary text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">New</span>
              </Link>
            )}

            {/* Shared links */}
            <Link href="/visualizer" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">
              Paint Visualizer
            </Link>
            <Link href="/blog" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">Guides</Link>

            {user ? (
               <>
                <Link href="/dashboard" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">Dashboard</Link>
                {hasPaid && (
                  <span className="px-2 py-1 text-xs font-bold text-white dark:text-black bg-primary rounded-full">
                    PRO
                  </span>
                )}
                <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/signin" className="px-5 py-2 text-sm font-medium text-white dark:text-zinc-950 bg-primary rounded-full shadow-md hover:shadow-lg transition-all no-underline">
                Sign In
              </Link>
            )}
            
            {/* Region Selector — Amazon-style dropdown */}
            <div className="relative ml-4" ref={dropdownRef}>
              <button 
                onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 hover:border-primary dark:hover:border-primary transition-all cursor-pointer"
              >
                <img 
                  src={`https://flagcdn.com/w20/${activeRegion.flag}.png`} 
                  srcSet={`https://flagcdn.com/w40/${activeRegion.flag}.png 2x`} 
                  width="18" 
                  alt={activeRegion.label} 
                  className="rounded-sm" 
                />
                <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">{activeRegion.short}</span>
                <i className={`fas fa-chevron-down text-[10px] text-gray-400 transition-transform ${regionDropdownOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {regionDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Select Region</p>
                  </div>
                  {REGIONS.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => handleRegionSelect(r.code)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                        activeRegion.code === r.code 
                          ? 'bg-primary/5 dark:bg-primary/10 border-l-2 border-primary' 
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-800 border-l-2 border-transparent'
                      }`}
                    >
                      <img 
                        src={`https://flagcdn.com/w20/${r.flag}.png`} 
                        srcSet={`https://flagcdn.com/w40/${r.flag}.png 2x`} 
                        width="20" 
                        alt={r.label} 
                        className="rounded-sm shadow-sm" 
                      />
                      <div>
                        <p className={`text-sm font-semibold ${activeRegion.code === r.code ? 'text-primary' : 'text-gray-800 dark:text-zinc-200'}`}>
                          {r.label}
                        </p>
                      </div>
                      {activeRegion.code === r.code && (
                        <i className="fas fa-check text-primary ml-auto text-xs"></i>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="lg:hidden flex items-center gap-3">
            {/* Mobile region button */}
            <button 
              ref={mobileButtonRef}
              onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 cursor-pointer"
            >
              <img 
                src={`https://flagcdn.com/w20/${activeRegion.flag}.png`} 
                width="16" alt={activeRegion.label} className="rounded-sm" 
              />
              <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">{activeRegion.short}</span>
              <i className={`fas fa-chevron-down text-[9px] text-gray-400 transition-transform ${regionDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>

            <button aria-label="Toggle navigation menu" onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 dark:text-zinc-400 hover:text-primary focus:outline-none p-2 cursor-pointer">
              <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"} text-xl`} aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Region Dropdown (shared for mobile) */}
      {regionDropdownOpen && (
        <div ref={mobileDropdownRef} className="lg:hidden absolute right-4 top-14 w-52 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Select Region</p>
          </div>
          {REGIONS.map((r) => (
            <button
              key={r.code}
              onClick={() => handleRegionSelect(r.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                activeRegion.code === r.code 
                  ? 'bg-primary/5 dark:bg-primary/10 border-l-2 border-primary' 
                  : 'hover:bg-gray-50 dark:hover:bg-zinc-800 border-l-2 border-transparent'
              }`}
            >
              <img 
                src={`https://flagcdn.com/w20/${r.flag}.png`} 
                srcSet={`https://flagcdn.com/w40/${r.flag}.png 2x`} 
                width="20" alt={r.label} className="rounded-sm shadow-sm" 
              />
              <p className={`text-sm font-semibold ${activeRegion.code === r.code ? 'text-primary' : 'text-gray-800 dark:text-zinc-200'}`}>
                {r.label}
              </p>
              {activeRegion.code === r.code && (
                <i className="fas fa-check text-primary ml-auto text-xs"></i>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 absolute w-full left-0 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
              Home
            </Link>

            {/* India-only mobile links */}
            {activeRegion.code === 'IN' && (
              <>
                <Link href="/plans" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
                  House Plans
                </Link>
                <Link href="/app" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
                  HDE App
                </Link>
              </>
            )}

            {/* UAE-only mobile links */}
            {activeRegion.code === 'AE' && (
              <>
                <Link href="/dubai-property" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
                  Dubai Property
                </Link>
                <Link href="/dubai-property/calculator" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
                  Cost Calculator
                </Link>
              </>
            )}

            {/* Cross-selling Dubai Property on Mobile */}
            {activeRegion.code !== 'AE' && (
              <Link 
                href="/dubai-property" 
                className="flex items-center justify-between px-3 py-2 rounded-md text-base font-semibold text-amber-700 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 no-underline" 
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <span>🇦🇪</span>
                  Dubai Property
                </span>
                <span className="text-[10px] bg-primary text-white font-extrabold px-2 py-0.5 rounded-full uppercase">New</span>
              </Link>
            )}

            {/* Shared mobile links */}
            <Link href="/visualizer" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
              Paint Visualizer
            </Link>
            <Link href="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-800 no-underline" onClick={() => setMenuOpen(false)}>Guides</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer">
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/signin" className="block px-3 py-2 mt-4 text-center rounded-md text-base font-bold text-white dark:text-zinc-950 bg-primary no-underline" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
