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
  const isDubaiRoute = pathname.includes('/dubai-property');

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
              The ultimate platform for construction cost estimation, real estate ROI analysis, material BOQ reports, and modern architectural house planning.
            </p>
            
            {/* Quick Links Horizontally */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1 text-sm font-medium pt-1">
              <Link href="/home-planning" className="text-primary font-semibold hover:underline">Home Planning Guide</Link>
              <span className="text-gray-300">|</span>
              <Link href="/blog" className="text-gray-500 hover:text-primary transition-colors no-underline">Blog & Guides</Link>
              <span className="text-gray-300">|</span>
              <Link href="/land-converter" className="text-gray-500 hover:text-primary transition-colors no-underline">Land Area Converter</Link>
              <span className="text-gray-300">|</span>
              <Link href="/about" className="text-gray-500 hover:text-primary transition-colors no-underline">About Us</Link>
              <span className="text-gray-300">|</span>
              <Link href="/contact" className="text-gray-500 hover:text-primary transition-colors no-underline">Contact Us</Link>
              <span className="text-gray-300">|</span>
              <Link href="/disclaimer" className="text-gray-500 hover:text-primary transition-colors no-underline">Disclaimer</Link>
              <span className="text-gray-300">|</span>
              <Link href="/privacy" className="text-gray-500 hover:text-primary transition-colors no-underline">Privacy Policy</Link>
              <span className="text-gray-300">|</span>
              <Link href="/terms" className="text-gray-500 hover:text-primary transition-colors no-underline">Terms of Service</Link>
            </div>

            {/* Design Galleries Quick Links */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1 text-xs font-medium pt-1 text-gray-500">
              <span className="text-gray-400 font-semibold uppercase tracking-wider">Galleries:</span>
              <Link href="/gallery/kitchen-designs" className="text-primary hover:underline font-semibold">Modular Kitchen Designs</Link>
              <span className="text-gray-300">&bull;</span>
              <Link href="/gallery/bathroom-designs" className="text-primary hover:underline font-semibold">Modern Bathroom Designs</Link>
              <span className="text-gray-300">&bull;</span>
              <Link href="/plans" className="text-gray-600 hover:text-primary transition-colors">Architectural House Plans</Link>
            </div>

            {/* Real Estate Quick Links (India Mode) */}
            {!isUSRoute && !isDubaiRoute && (
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-3 gap-y-1 text-xs font-medium pt-1 text-gray-500">
                <span className="text-gray-400 font-semibold uppercase tracking-wider">Real Estate:</span>
                <Link href="/bangalore/properties" className="text-primary hover:underline font-semibold">Bangalore Properties</Link>
                <span className="text-gray-300">&bull;</span>
                <Link href="/bangalore/post-property" className="text-gray-600 hover:text-primary transition-colors">Post Property Free</Link>
                <span className="text-gray-300">&bull;</span>
                <Link href="/bangalore/faq" className="text-gray-600 hover:text-primary transition-colors">Bangalore Property FAQ</Link>
              </div>
            )}
          </div>
        </div>

        {/* Regional Portals & Calculators Mesh (Always statically crawlable for Google bot) */}
        <div className="border-t border-gray-100 pt-5 mt-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* India Real Estate & Construction */}
            <div className="space-y-2">
              <p className="font-bold text-gray-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <span>🇮🇳</span>
                <span>India Construction &amp; Real Estate</span>
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-gray-500">
                <Link href="/bangalore/properties" className="hover:text-primary transition-colors">Bangalore Properties</Link>
                <span>&bull;</span>
                <Link href="/bangalore/house-for-rent-in-whitefield" className="hover:text-primary transition-colors">Whitefield Rent</Link>
                <span>&bull;</span>
                <Link href="/bangalore/house-for-rent-in-hsr-layout" className="hover:text-primary transition-colors">HSR Layout</Link>
                <span>&bull;</span>
                <Link href="/bangalore/house-for-rent-in-indiranagar" className="hover:text-primary transition-colors">Indiranagar</Link>
                <span>&bull;</span>
                <Link href="/bangalore/house-for-rent-in-electronic-city" className="hover:text-primary transition-colors">Electronic City</Link>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-gray-500 pt-1">
                <Link href="/cost/construction-in-bengaluru" className="hover:text-primary transition-colors">Bengaluru Rates</Link>
                <span>&bull;</span>
                <Link href="/cost/construction-in-mumbai" className="hover:text-primary transition-colors">Mumbai</Link>
                <span>&bull;</span>
                <Link href="/cost/construction-in-delhi-ncr" className="hover:text-primary transition-colors">Delhi NCR</Link>
                <span>&bull;</span>
                <Link href="/cost/construction-in-hyderabad" className="hover:text-primary transition-colors">Hyderabad</Link>
                <span>&bull;</span>
                <Link href="/cost/construction-in-chennai" className="hover:text-primary transition-colors">Chennai</Link>
                <span>&bull;</span>
                <Link href="/cost/construction-in-pune" className="hover:text-primary transition-colors">Pune</Link>
              </div>
            </div>

            {/* USA Real Estate Calculators */}
            <div className="space-y-2">
              <p className="font-bold text-gray-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <span>🇺🇸</span>
                <span>USA Real Estate Tools</span>
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-gray-500">
                <Link href="/real-estate/texas" className="hover:text-primary font-semibold">Texas Hub</Link>
                <span>&bull;</span>
                <Link href="/real-estate/florida" className="hover:text-primary font-semibold">Florida Hub</Link>
                <span>&bull;</span>
                <Link href="/real-estate/california" className="hover:text-primary font-semibold">California Hub</Link>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-gray-500 pt-1">
                <Link href="/real-estate/rent-vs-buy-in-austin-texas" className="hover:text-primary transition-colors">Austin</Link>
                <span>&bull;</span>
                <Link href="/real-estate/property-tax-in-dallas-texas" className="hover:text-primary transition-colors">Dallas</Link>
                <span>&bull;</span>
                <Link href="/real-estate/salary-needed-to-buy-in-houston-texas" className="hover:text-primary transition-colors">Houston</Link>
                <span>&bull;</span>
                <Link href="/real-estate/rent-vs-buy-in-los-angeles-california" className="hover:text-primary transition-colors">Los Angeles</Link>
                <span>&bull;</span>
                <Link href="/real-estate/property-tax-in-chicago-illinois" className="hover:text-primary transition-colors">Chicago</Link>
                <span>&bull;</span>
                <Link href="/real-estate/salary-needed-to-buy-in-miami-florida" className="hover:text-primary transition-colors">Miami</Link>
                <span>&bull;</span>
                <Link href="/real-estate/rent-vs-buy-in-seattle-washington" className="hover:text-primary transition-colors">Seattle</Link>
              </div>
            </div>

            {/* Dubai Property Guides */}
            <div className="space-y-2">
              <p className="font-bold text-gray-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <span>🇦🇪</span>
                <span>Dubai Property Advisor</span>
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-gray-500">
                <Link href="/dubai-property" className="hover:text-primary font-semibold">Dubai Overview</Link>
                <span>&bull;</span>
                <Link href="/dubai-property/calculator" className="hover:text-primary font-semibold">Buying Cost Calculator</Link>
                <span>&bull;</span>
                <Link href="/dubai-property/partners" className="hover:text-primary font-semibold">Partner Agents</Link>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-gray-500 pt-1">
                <Link href="/dubai-property/areas/dubai-marina" className="hover:text-primary transition-colors">Dubai Marina</Link>
                <span>&bull;</span>
                <Link href="/dubai-property/areas/downtown-dubai" className="hover:text-primary transition-colors">Downtown Dubai</Link>
                <span>&bull;</span>
                <Link href="/dubai-property/areas/business-bay" className="hover:text-primary transition-colors">Business Bay</Link>
                <span>&bull;</span>
                <Link href="/dubai-property/areas/jvc" className="hover:text-primary transition-colors">JVC</Link>
                <span>&bull;</span>
                <Link href="/dubai-property/areas/palm-jumeirah" className="hover:text-primary transition-colors">Palm Jumeirah</Link>
                <span>&bull;</span>
                <Link href="/dubai-property/areas/dubai-hills" className="hover:text-primary transition-colors">Dubai Hills</Link>
              </div>
            </div>
          </div>
        </div>

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
