"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { supabase } from "../../config/supabaseClient";
import { useRegion } from "../../context/RegionContext";

const Header = () => {
  const { user, hasPaid, signOut } = useUser();
  const { region, setRegion } = useRegion();
  const navigate = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate.push("/signin");
    setMenuOpen(false);
  };

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
            
            {/* Professional Directory Link (India Only) */}
            {region !== 'US' && (
              <Link href="/directory" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">Find Professionals</Link>
            )}
            
            {region !== 'US' && (
              <Link href="/plans" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">House Plans</Link>
            )}

            {region !== 'US' && (
              <Link href="/app" className="text-gray-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary font-medium transition-colors no-underline">HDE App</Link>
            )}
            
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
            
            {/* Region Selector */}
            <div className="flex bg-gray-100 dark:bg-zinc-900 rounded-full p-1 ml-4 shadow-inner">
              <button 
                onClick={() => setRegion('IN')}
                className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold transition-all ${region === 'IN' || !region ? 'bg-white dark:bg-zinc-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'}`}
              >
                <img src="https://flagcdn.com/w20/in.png" srcSet="https://flagcdn.com/w40/in.png 2x" width="16" alt="India" className="mr-1.5 rounded-sm" />
                IND
              </button>
              <button 
                onClick={() => setRegion('US')}
                className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold transition-all ${region === 'US' ? 'bg-white dark:bg-zinc-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'}`}
              >
                <img src="https://flagcdn.com/w20/us.png" srcSet="https://flagcdn.com/w40/us.png 2x" width="16" alt="USA" className="mr-1.5 rounded-sm" />
                USA
              </button>
            </div>
          </nav>

          <div className="lg:hidden flex items-center">
            <button aria-label="Toggle navigation menu" onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 dark:text-zinc-400 hover:text-primary focus:outline-none p-2 cursor-pointer">
              <i className={`fas ${menuOpen ? "fa-times" : "fa-bars"} text-xl`} aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 absolute w-full left-0 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
            {/* Mobile Region Selector */}
            <div className="flex bg-gray-100 dark:bg-zinc-900 rounded-full p-1 mb-4 shadow-inner">
              <button 
                onClick={() => { setRegion('IN'); setMenuOpen(false); }}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-full text-sm font-bold transition-all ${region === 'IN' || !region ? 'bg-white dark:bg-zinc-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'}`}
              >
                <img src="https://flagcdn.com/w20/in.png" srcSet="https://flagcdn.com/w40/in.png 2x" width="18" alt="India" className="mr-2 rounded-sm" />
                India
              </button>
              <button 
                onClick={() => { setRegion('US'); setMenuOpen(false); }}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-full text-sm font-bold transition-all ${region === 'US' ? 'bg-white dark:bg-zinc-700 shadow text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400'}`}
              >
                <img src="https://flagcdn.com/w20/us.png" srcSet="https://flagcdn.com/w40/us.png 2x" width="18" alt="USA" className="mr-2 rounded-sm" />
                USA
              </button>
            </div>

            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            {region !== 'US' && (
              <Link href="/directory" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
                Find Professionals
              </Link>
            )}
            {region !== 'US' && (
              <Link href="/plans" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
                House Plans
              </Link>
            )}
            {region !== 'US' && (
              <Link href="/app" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
                HDE App
              </Link>
            )}
            <Link href="/visualizer" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
              Paint Visualizer
            </Link>
            <Link href="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-zinc-900 no-underline" onClick={() => setMenuOpen(false)}>
              Guides
            </Link>
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
