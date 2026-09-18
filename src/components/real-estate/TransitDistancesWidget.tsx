// src/components/real-estate/TransitDistancesWidget.tsx
import React from "react";
import { PropertyConnectivity } from "@/types/realEstate";

export default function TransitDistancesWidget({
  connectivity,
  compact = false,
}: {
  connectivity?: PropertyConnectivity;
  compact?: boolean;
}) {
  if (!connectivity || Object.keys(connectivity).length === 0) {
    return null;
  }

  const items = [
    connectivity.airport_km !== undefined && {
      icon: "fas fa-plane-departure text-sky-600",
      label: "Airport",
      value: `${connectivity.airport_km} km`,
      sub: "Kempegowda Int'l Airport",
    },
    connectivity.metro_bus_km !== undefined && {
      icon: "fas fa-subway text-purple-600",
      label: "Metro / Bus",
      value: `${connectivity.metro_bus_km} km`,
      sub: connectivity.metro_bus_stop_name || "Nearest Station",
    },
    connectivity.railway_km !== undefined && {
      icon: "fas fa-train text-amber-600",
      label: "Railway",
      value: `${connectivity.railway_km} km`,
      sub: connectivity.railway_station_name || "Nearest Station",
    },
    connectivity.mall_km !== undefined && {
      icon: "fas fa-bag-shopping text-rose-600",
      label: "Malls",
      value: `${connectivity.mall_km} km`,
      sub: connectivity.famous_mall_name || "Shopping Center",
    },
    connectivity.tech_park_km !== undefined && {
      icon: "fas fa-laptop-code text-indigo-600",
      label: "Tech Park",
      value: `${connectivity.tech_park_km} km`,
      sub: connectivity.tech_park_name || "IT Corridor",
    },
    connectivity.landmark_km !== undefined && {
      icon: "fas fa-location-dot text-emerald-600",
      label: "Landmark",
      value: `${connectivity.landmark_km} km`,
      sub: connectivity.tourist_landmark_name || "Key Spot",
    },
  ].filter(Boolean) as { icon: string; label: string; value: string; sub: string }[];

  if (items.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600 pt-2">
        {items.slice(0, 3).map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-lg"
          >
            <i className={`${item.icon} text-[10px]`}></i>
            <span className="font-medium text-gray-700">{item.value}</span>
            <span className="text-gray-400 font-light">to {item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-50/70 rounded-2xl p-5 border border-gray-200/80">
      <div className="flex items-center gap-2 mb-4">
        <i className="fas fa-route text-primary text-base"></i>
        <h4 className="text-sm font-extrabold text-secondary uppercase tracking-wider">
          Transit &amp; Key Distances
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
              <i className={item.icon}></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-gray-900">{item.value}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">{item.label}</span>
              </div>
              <p className="text-[11px] text-gray-500 truncate leading-snug mt-0.5">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
