// src/data/usaFlooringVisualizer.ts

export type FlooringRoomKey = "livingroom" | "kitchen";

export type FlooringCalcCategory =
  | "lvp"
  | "laminate"
  | "hardwood"
  | "engineered"
  | "tile"
  | "carpet";

export type FlooringMaterialKey =
  | "original-gray"
  | "honey-oak"
  | "herringbone-walnut"
  | "stone-tile"
  | "lvp-weathered"
  | "slate-stone"
  | "charcoal-carpet"
  | "slate-blue-carpet"
  | "warm-beige-carpet"
  | "white-marble-tile"
  | "gray-porcelain-tile"
  | "patterned-ceramic-tile"
  | "checkerboard-tile"
  | "terracotta-tile";

export interface FlooringMaterialInfo {
  label: string;
  calcType?: FlooringCalcCategory;
  typicalInstalledCost: string;
}

export interface FlooringRoomConfig {
  key: FlooringRoomKey;
  label: string;
  materials: readonly FlooringMaterialKey[];
}

export const BASE_FLOOR_KEY: FlooringMaterialKey = "original-gray";

const DEFAULT_R2_PUBLIC_URL = "https://pub-b20d9352722b43219ceb523a3a0c89d5.r2.dev";

export function getFlooringAssetsBaseUrl(): string {
  const configured =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL
      : undefined;
  const root = (configured || DEFAULT_R2_PUBLIC_URL).replace(/\/+$/, "");
  return `${root}/flooring-viz/pictures`;
}

export const FLOORING_MATERIALS: Record<FlooringMaterialKey, FlooringMaterialInfo> = {
  "original-gray": {
    label: "Original Gray",
    typicalInstalledCost: "Base Reference",
  },
  "honey-oak": {
    label: "Honey Oak",
    calcType: "hardwood",
    typicalInstalledCost: "$8 – $12 / sq.ft",
  },
  "herringbone-walnut": {
    label: "Herringbone Walnut",
    calcType: "engineered",
    typicalInstalledCost: "$7 – $11 / sq.ft",
  },
  "stone-tile": {
    label: "Stone Tile",
    calcType: "tile",
    typicalInstalledCost: "$6 – $9 / sq.ft",
  },
  "lvp-weathered": {
    label: "LVP Weathered",
    calcType: "lvp",
    typicalInstalledCost: "$5 – $7 / sq.ft",
  },
  "slate-stone": {
    label: "Slate Stone",
    calcType: "tile",
    typicalInstalledCost: "$6 – $10 / sq.ft",
  },
  "charcoal-carpet": {
    label: "Charcoal Carpet",
    calcType: "carpet",
    typicalInstalledCost: "$3.50 – $5 / sq.ft",
  },
  "slate-blue-carpet": {
    label: "Slate Blue Carpet",
    calcType: "carpet",
    typicalInstalledCost: "$3.50 – $5 / sq.ft",
  },
  "warm-beige-carpet": {
    label: "Warm Beige Carpet",
    calcType: "carpet",
    typicalInstalledCost: "$3.50 – $5 / sq.ft",
  },
  "white-marble-tile": {
    label: "White Marble Tile",
    calcType: "tile",
    typicalInstalledCost: "$7 – $12 / sq.ft",
  },
  "gray-porcelain-tile": {
    label: "Gray Porcelain Tile",
    calcType: "tile",
    typicalInstalledCost: "$6 – $9 / sq.ft",
  },
  "patterned-ceramic-tile": {
    label: "Patterned Ceramic Tile",
    calcType: "tile",
    typicalInstalledCost: "$6 – $10 / sq.ft",
  },
  "checkerboard-tile": {
    label: "Checkerboard Tile",
    calcType: "tile",
    typicalInstalledCost: "$6 – $9 / sq.ft",
  },
  "terracotta-tile": {
    label: "Terracotta Tile",
    calcType: "tile",
    typicalInstalledCost: "$6 – $10 / sq.ft",
  },
};

export const FLOORING_ROOMS: Record<FlooringRoomKey, FlooringRoomConfig> = {
  livingroom: {
    key: "livingroom",
    label: "Living Room",
    materials: [
      "original-gray",
      "honey-oak",
      "herringbone-walnut",
      "stone-tile",
      "lvp-weathered",
      "slate-stone",
      "charcoal-carpet",
      "slate-blue-carpet",
      "warm-beige-carpet",
      "white-marble-tile",
      "gray-porcelain-tile",
      "patterned-ceramic-tile",
    ],
  },
  kitchen: {
    key: "kitchen",
    label: "Kitchen",
    materials: [
      "original-gray",
      "honey-oak",
      "stone-tile",
      "slate-stone",
      "white-marble-tile",
      "patterned-ceramic-tile",
      "checkerboard-tile",
      "terracotta-tile",
    ],
  },
};

export function getFlooringFullUrl(
  roomKey: FlooringRoomKey,
  floorKey: FlooringMaterialKey
): string {
  return `${getFlooringAssetsBaseUrl()}/${roomKey}/${floorKey}.webp`;
}

export function getFlooringThumbUrl(
  roomKey: FlooringRoomKey,
  floorKey: FlooringMaterialKey
): string {
  return `${getFlooringAssetsBaseUrl()}/${roomKey}/thumbs/${floorKey}.webp`;
}
