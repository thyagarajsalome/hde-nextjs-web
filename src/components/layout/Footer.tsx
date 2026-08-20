"use client";
// src/components/layout/Footer.tsx
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRegion } from "../../context/RegionContext";

export default function Footer() {
  const { region } = useRegion();
  const pathname = usePathname() || "";
  const isUSRoute = region === 'US' || pathname.includes('/real-estate/') || ['texas', 'california', 'new-york', 'florida', 'illinois', 'arizona', 'washington', 'pennsylvania', 'north-carolina'].some(state => pathname.includes(state));

  return (
    <footer className="footer bg-white border-t border-gray-100 pt-8 pb-4">
      <div className="container mx-auto px-4">
        
        {/* Main Footer Row */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-6">
          
          {/* Left Side: Brand & Quick Links */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <Link href="/" className="flex items-center justify-center md:justify-start gap-2 text-xl font-bold text-secondary hover:text-primary transition-colors no-underline">
              <img src="/bg-logo.png" alt="HDE Logo" className="w-10 h-10 object-contain" />
              <span className="text-primary uppercase tracking-tighter font-extrabold text-2xl">HDE</span>
            </Link>
            <p className="text-gray-500 text-sm max-w-md mx-auto md:mx-0">
              India's leading platform for construction cost estimation, material BOQ reports, and modern architectural house planning.
            </p>
            
            {/* Quick Links Horizontally */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1 text-sm font-medium pt-1">
              <Link href="/blog" className="text-gray-500 hover:text-primary transition-colors no-underline">Blog & Guides</Link>
              <span className="text-gray-300">|</span>
              <Link href="/contact" className="text-gray-500 hover:text-primary transition-colors no-underline">Contact Us</Link>
              <span className="text-gray-300">|</span>
              <Link href="/disclaimer" className="text-gray-500 hover:text-primary transition-colors no-underline">Disclaimer</Link>
              <span className="text-gray-300">|</span>
              <Link href="/privacy" className="text-gray-500 hover:text-primary transition-colors no-underline">Privacy Policy</Link>
              <span className="text-gray-300">|</span>
              <Link href="/terms" className="text-gray-500 hover:text-primary transition-colors no-underline">Terms of Service</Link>
            </div>
          </div>

          {/* Right Side: Play Store Badges */}
          <div className="flex flex-col items-center md:items-end shrink-0 w-full md:w-auto">
            <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Get Our Mobile Apps</h4>
            <div className="flex flex-wrap md:flex-col gap-2 justify-center">
             
              <a 
                href="https://play.google.com/store/apps/details?id=com.aihomedecorator.twa&pcampaignid=web_share" 
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black hover:scale-[1.02] transition-all border border-gray-700 w-44 text-left no-underline"
              >
                <i className="fab fa-google-play text-lg text-green-400 font-bold"></i>
                <div>
                  <p className="text-[10px] text-gray-300 leading-tight">Get it on</p>
                  <p className="text-xs font-bold mt-0.5">AI Decorator</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* City links - compact (India Only) */}
        {!isUSRoute ? (
          <div className="border-t border-gray-100 pt-4 mt-4 mb-4">
            <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-widest text-center">House Construction Costs By City</h4>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 text-sm font-medium">
              <Link href="/cost/construction-in-mumbai" className="text-gray-500 hover:text-primary transition-colors no-underline">Mumbai</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/cost/construction-in-bengaluru" className="text-gray-500 hover:text-primary transition-colors no-underline">Bengaluru</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/cost/construction-in-delhi-ncr" className="text-gray-500 hover:text-primary transition-colors no-underline">Delhi NCR</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/cost/construction-in-chennai" className="text-gray-500 hover:text-primary transition-colors no-underline">Chennai</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/cost/construction-in-hyderabad" className="text-gray-500 hover:text-primary transition-colors no-underline">Hyderabad</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/cost/construction-in-pune" className="text-gray-500 hover:text-primary transition-colors no-underline">Pune</Link>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 pt-4 mt-4 mb-4">
            <h4 className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-widest text-center">Real Estate Calculators By City</h4>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 text-sm font-medium">
              <Link href="/real-estate/rent-vs-buy-in-austin-texas" className="text-gray-500 hover:text-primary transition-colors no-underline">Austin</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/real-estate/property-tax-in-dallas-texas" className="text-gray-500 hover:text-primary transition-colors no-underline">Dallas</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/real-estate/salary-needed-to-buy-in-houston-texas" className="text-gray-500 hover:text-primary transition-colors no-underline">Houston</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/real-estate/rent-vs-buy-in-los-angeles-california" className="text-gray-500 hover:text-primary transition-colors no-underline">Los Angeles</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/real-estate/property-tax-in-chicago-illinois" className="text-gray-500 hover:text-primary transition-colors no-underline">Chicago</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/real-estate/salary-needed-to-buy-in-miami-florida" className="text-gray-500 hover:text-primary transition-colors no-underline">Miami</Link>
              <span className="hidden md:inline text-gray-300">|</span>
              <Link href="/real-estate/rent-vs-buy-in-new-york-city" className="text-gray-500 hover:text-primary transition-colors no-underline">New York</Link>
            </div>
          </div>
        )}

        {/* Disclaimer & Copyright */}
        <div className="border-t border-gray-100 pt-4 text-center max-w-4xl mx-auto">
          <p className="text-gray-400 text-[10px] leading-relaxed mb-2">
            Disclaimer: Home Design English (HDE) is an independent budget calculation and estimation platform. All rates, material quantities, and cost estimates provided are approximate projections for general guidance only. HDE does not provide building contractor services, architectural supervision, or physical construction works. Users should verify final quotes and structural designs with licensed local builders and engineers before commencing actual construction.
          </p>
          <p className="text-gray-400 text-xs font-medium">
            &copy; 2026 Home Design English (HDE). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
