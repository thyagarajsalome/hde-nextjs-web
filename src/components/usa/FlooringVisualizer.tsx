"use client";

import React, { useState, useRef, useCallback, useEffect, useId } from "react";
import Link from "next/link";
import {
  BASE_FLOOR_KEY,
  FLOORING_MATERIALS,
  FLOORING_ROOMS,
  FlooringCalcCategory,
  FlooringMaterialKey,
  FlooringRoomKey,
  getFlooringFullUrl,
  getFlooringThumbUrl,
} from "@/data/usaFlooringVisualizer";

interface FlooringVisualizerProps {
  compact?: boolean;
  onApplyMaterial?: (calcType: FlooringCalcCategory, label: string) => void;
}

const ROOM_KEYS: FlooringRoomKey[] = ["livingroom", "kitchen"];

export default function FlooringVisualizer({
  compact = false,
  onApplyMaterial,
}: FlooringVisualizerProps) {
  const baseId = useId();
  const [currentRoom, setCurrentRoom] = useState<FlooringRoomKey>("livingroom");
  const [currentFloor, setCurrentFloor] = useState<FlooringMaterialKey>(BASE_FLOOR_KEY);
  const [activeLayer, setActiveLayer] = useState<"a" | "b" | null>(null);
  const [layerASrc, setLayerASrc] = useState<string>("");
  const [layerBSrc, setLayerBSrc] = useState<string>("");
  const [layerAState, setLayerAState] = useState<"hidden" | "ready" | "underlay" | "visible">("hidden");
  const [layerBState, setLayerBState] = useState<"hidden" | "ready" | "underlay" | "visible">("hidden");
  const [isLoadingFloor, setIsLoadingFloor] = useState<boolean>(false);

  const loadedSrcsRef = useRef<Set<string>>(new Set());
  const inFlightLoadsRef = useRef<Map<string, Promise<void>>>(new Map());
  const requestCounterRef = useRef<number>(0);
  const tabRefs = useRef<Record<FlooringRoomKey, HTMLButtonElement | null>>({
    livingroom: null,
    kitchen: null,
  });

  const preloadUrl = useCallback((src: string): Promise<void> => {
    if (!src || loadedSrcsRef.current.has(src)) {
      return Promise.resolve();
    }
    const existing = inFlightLoadsRef.current.get(src);
    if (existing) return existing;

    const promise = new Promise<void>((resolve) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;

      const finish = () => {
        loadedSrcsRef.current.add(src);
        inFlightLoadsRef.current.delete(src);
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(resolve);
        } else {
          resolve();
        }
      };

      if (img.complete) {
        finish();
      } else {
        img.addEventListener("load", finish, { once: true });
        img.addEventListener(
          "error",
          () => {
            inFlightLoadsRef.current.delete(src);
            resolve();
          },
          { once: true }
        );
      }
    });

    inFlightLoadsRef.current.set(src, promise);
    return promise;
  }, []);

  const preloadRoomAssets = useCallback(
    (roomKey: FlooringRoomKey) => {
      FLOORING_ROOMS[roomKey].materials.forEach((floorKey) => {
        preloadUrl(getFlooringFullUrl(roomKey, floorKey));
      });
    },
    [preloadUrl]
  );

  // Warm initial room assets after mount without blocking first paint
  useEffect(() => {
    const timer = window.setTimeout(() => {
      preloadRoomAssets(currentRoom);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [currentRoom, preloadRoomAssets]);

  const applyFloorOverlay = useCallback(
    async (roomKey: FlooringRoomKey, floorKey: FlooringMaterialKey, forceRender = false) => {
      const room = FLOORING_ROOMS[roomKey];
      if (!room || !room.materials.includes(floorKey)) return;
      if (!forceRender && floorKey === currentFloor && roomKey === currentRoom) return;

      const reqId = ++requestCounterRef.current;
      setCurrentFloor(floorKey);

      if (floorKey === BASE_FLOOR_KEY) {
        setLayerAState("hidden");
        setLayerBState("hidden");
        setActiveLayer(null);
        setIsLoadingFloor(false);
        return;
      }

      const targetSrc = getFlooringFullUrl(roomKey, floorKey);
      if (!loadedSrcsRef.current.has(targetSrc)) {
        setIsLoadingFloor(true);
      }
      await preloadUrl(targetSrc);
      if (reqId !== requestCounterRef.current) return;
      setIsLoadingFloor(false);

      const nextLayer: "a" | "b" = activeLayer === "a" ? "b" : "a";

      if (nextLayer === "a") {
        if (activeLayer === "b") setLayerBState("underlay");
        setLayerASrc(targetSrc);
        setLayerAState("ready");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (reqId !== requestCounterRef.current) return;
            setLayerAState("visible");
            setActiveLayer("a");
          });
        });
      } else {
        if (activeLayer === "a") setLayerAState("underlay");
        setLayerBSrc(targetSrc);
        setLayerBState("ready");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (reqId !== requestCounterRef.current) return;
            setLayerBState("visible");
            setActiveLayer("b");
          });
        });
      }
    },
    [activeLayer, currentFloor, currentRoom, preloadUrl]
  );

  const handleRoomSwitch = useCallback(
    async (roomKey: FlooringRoomKey, shouldFocusTab = false) => {
      if (roomKey === currentRoom) return;
      const reqId = ++requestCounterRef.current;
      setCurrentRoom(roomKey);

      if (shouldFocusTab) {
        tabRefs.current[roomKey]?.focus();
      }

      const room = FLOORING_ROOMS[roomKey];
      const nextFloor = room.materials.includes(currentFloor) ? currentFloor : BASE_FLOOR_KEY;

      // Reset layers cleanly while switching base room
      setLayerAState("hidden");
      setLayerBState("hidden");
      setActiveLayer(null);
      setCurrentFloor(nextFloor);

      if (nextFloor !== BASE_FLOOR_KEY) {
        const baseSrc = getFlooringFullUrl(roomKey, BASE_FLOOR_KEY);
        await preloadUrl(baseSrc);
        if (reqId !== requestCounterRef.current) return;
        await applyFloorOverlay(roomKey, nextFloor, true);
      }
    },
    [applyFloorOverlay, currentFloor, currentRoom, preloadUrl]
  );

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIdx = ROOM_KEYS.indexOf(currentRoom);
    if (currentIdx === -1) return;

    let nextIdx: number | null = null;
    if (event.key === "ArrowRight") nextIdx = (currentIdx + 1) % ROOM_KEYS.length;
    else if (event.key === "ArrowLeft")
      nextIdx = (currentIdx - 1 + ROOM_KEYS.length) % ROOM_KEYS.length;
    else if (event.key === "Home") nextIdx = 0;
    else if (event.key === "End") nextIdx = ROOM_KEYS.length - 1;

    if (nextIdx !== null) {
      event.preventDefault();
      handleRoomSwitch(ROOM_KEYS[nextIdx], true);
    }
  };

  const roomConfig = FLOORING_ROOMS[currentRoom];
  const materialInfo = FLOORING_MATERIALS[currentFloor];
  const baseLayerSrc = getFlooringFullUrl(currentRoom, BASE_FLOOR_KEY);

  return (
    <div className="w-full">
      {/* Room Category Tabs */}
      <div
        className="flex items-center justify-center sm:justify-start gap-2 mb-4 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Room categories"
        onKeyDown={handleTabKeyDown}
      >
        {ROOM_KEYS.map((key) => {
          const isSelected = currentRoom === key;
          const room = FLOORING_ROOMS[key];
          return (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[key] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${key}`}
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleRoomSwitch(key)}
              onPointerEnter={() => preloadUrl(getFlooringFullUrl(key, BASE_FLOOR_KEY))}
              className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[44px] active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none ${
                isSelected
                  ? "bg-[#0f2042] text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              <i
                className={`fas ${key === "livingroom" ? "fa-couch" : "fa-utensils"} mr-2 text-xs ${
                  isSelected ? "text-[#c5a059]" : "text-slate-400"
                }`}
              ></i>
              <span>{room.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Visualizer Container */}
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${currentRoom}`}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden"
      >
        {/* Interactive Room Viewport Stack (1600x1195 natural aspect ratio) */}
        <div className="relative w-full aspect-[1600/1195] bg-slate-200 overflow-hidden select-none">
          <img
            src={baseLayerSrc}
            alt={`${roomConfig.label} with ${materialInfo.label} floor`}
            width={1600}
            height={1195}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover z-[1]"
          />

          {layerASrc && (
            <img
              src={layerASrc}
              alt=""
              aria-hidden="true"
              width={1600}
              height={1195}
              decoding="async"
              hidden={layerAState === "hidden"}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-400 ease-in-out motion-reduce:transition-none ${
                layerAState === "visible"
                  ? "opacity-100 z-[3]"
                  : layerAState === "underlay"
                  ? "opacity-100 z-[2]"
                  : "opacity-0 z-[1]"
              }`}
            />
          )}

          {layerBSrc && (
            <img
              src={layerBSrc}
              alt=""
              aria-hidden="true"
              width={1600}
              height={1195}
              decoding="async"
              hidden={layerBState === "hidden"}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-400 ease-in-out motion-reduce:transition-none ${
                layerBState === "visible"
                  ? "opacity-100 z-[3]"
                  : layerBState === "underlay"
                  ? "opacity-100 z-[2]"
                  : "opacity-0 z-[1]"
              }`}
            />
          )}

          {/* Top-left floating material badge */}
          <div className="absolute top-3 left-3 z-[4] flex items-center gap-2 bg-slate-950/75 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs shadow-sm">
            <span className="font-semibold">{materialInfo.label}</span>
            <span className="text-slate-300 text-[11px]">• {materialInfo.typicalInstalledCost}</span>
            {isLoadingFloor && <i className="fas fa-circle-notch fa-spin text-[#c5a059] text-xs"></i>}
          </div>

          {/* Bottom-right HDE Studio brand stamp covering image corner watermark across all viewports */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 right-0 z-[4] min-w-[11%] min-h-[12%] px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-tl-xl bg-white border-t border-l border-slate-200 shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 pointer-events-none select-none"
          >
            <img
              src="/bg-logo.png"
              alt=""
              width={24}
              height={24}
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain shrink-0"
            />
            <div className="leading-none">
              <span className="block text-[10px] sm:text-xs font-extrabold tracking-tight text-[#0f2042]">
                HDE
              </span>
              <span className="hidden sm:block text-[9px] font-semibold text-slate-500">
                Floor Studio
              </span>
            </div>
          </div>
        </div>

        {/* Material Swatches Control Bar */}
        <section className={compact ? "p-4 sm:p-5 border-t border-slate-100" : "p-5 sm:p-6 border-t border-slate-100"}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose Your Floor Material
              </h3>
              <p className="text-xs text-slate-600 mt-0.5" aria-live="polite">
                {roomConfig.label} — Selected: <strong className="text-slate-900">{materialInfo.label}</strong>
              </p>
            </div>

            {materialInfo.calcType && (
              onApplyMaterial ? (
                <button
                  type="button"
                  onClick={() => onApplyMaterial(materialInfo.calcType!, materialInfo.label)}
                  className="px-3.5 py-2 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fas fa-calculator text-[#c5a059]"></i>
                  <span>Estimate Cost for {materialInfo.label}</span>
                </button>
              ) : (
                <Link
                  href="/?region=US&calc=usa-flooring#tools"
                  className="px-3.5 py-2 rounded-xl bg-[#0f2042] hover:bg-[#1a3360] text-white text-xs font-bold transition-colors flex items-center gap-1.5 no-underline"
                >
                  <i className="fas fa-calculator text-[#c5a059]"></i>
                  <span>Calculate Cost for {materialInfo.label} →</span>
                </Link>
              )
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3">
            {roomConfig.materials.map((floorKey) => {
              const isSelected = currentFloor === floorKey;
              const info = FLOORING_MATERIALS[floorKey];
              return (
                <button
                  key={floorKey}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => applyFloorOverlay(currentRoom, floorKey)}
                  onPointerEnter={() => preloadUrl(getFlooringFullUrl(currentRoom, floorKey))}
                  onFocus={() => preloadUrl(getFlooringFullUrl(currentRoom, floorKey))}
                  className={`flex flex-col items-center gap-1.5 p-1.5 sm:p-2 rounded-xl border-2 text-center transition-all cursor-pointer active:scale-[0.97] motion-reduce:transition-none motion-reduce:transform-none ${
                    isSelected
                      ? "border-[#0f2042] bg-blue-50/60 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-400 hover:-translate-y-0.5"
                  }`}
                >
                  <img
                    src={getFlooringThumbUrl(currentRoom, floorKey)}
                    alt=""
                    width={320}
                    height={168}
                    decoding="async"
                    loading={floorKey === BASE_FLOOR_KEY ? "eager" : "lazy"}
                    className="w-full h-11 sm:h-14 rounded-lg object-cover bg-slate-100"
                  />
                  <span className="text-[11px] sm:text-xs font-medium text-slate-800 leading-tight">
                    {info.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
