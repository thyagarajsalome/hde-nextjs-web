import { describe, it, expect } from "vitest";
import {
  BASE_FLOOR_KEY,
  FLOORING_MATERIALS,
  FLOORING_ROOMS,
  getFlooringAssetsBaseUrl,
  getFlooringFullUrl,
  getFlooringThumbUrl,
} from "../src/data/usaFlooringVisualizer";

describe("USA Flooring Visualizer Config & Cloudflare R2 Assets", () => {
  it("uses Cloudflare R2 storage base URL without local filesystem paths", () => {
    const base = getFlooringAssetsBaseUrl();
    expect(base).toMatch(/^https:\/\/.+\/flooring-viz\/pictures$/);
    expect(base).toContain("r2.dev/flooring-viz/pictures");
  });

  it("defines Living Room and Kitchen with valid materials starting with the base floor", () => {
    expect(FLOORING_ROOMS.livingroom.materials[0]).toBe(BASE_FLOOR_KEY);
    expect(FLOORING_ROOMS.kitchen.materials[0]).toBe(BASE_FLOOR_KEY);
    expect(FLOORING_ROOMS.livingroom.materials.length).toBe(12);
    expect(FLOORING_ROOMS.kitchen.materials.length).toBe(8);
  });

  it("maps every room material to metadata and valid R2 webp full/thumb URLs", () => {
    Object.values(FLOORING_ROOMS).forEach((room) => {
      room.materials.forEach((mat) => {
        const info = FLOORING_MATERIALS[mat];
        expect(info, `Missing material definition for ${mat}`).toBeDefined();
        expect(info.label.length).toBeGreaterThan(2);

        const fullUrl = getFlooringFullUrl(room.key, mat);
        const thumbUrl = getFlooringThumbUrl(room.key, mat);
        expect(fullUrl).toBe(
          `${getFlooringAssetsBaseUrl()}/${room.key}/${mat}.webp`
        );
        expect(thumbUrl).toBe(
          `${getFlooringAssetsBaseUrl()}/${room.key}/thumbs/${mat}.webp`
        );
      });
    });
  });
});
