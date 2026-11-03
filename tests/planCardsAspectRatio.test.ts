import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Architectural Layout & Aspect Ratio Lock Tests
 * 
 * Prevents accidental layout regressions between:
 * 1. Landscape CAD Blueprints (/plans/store) -> strictly locked to 4:3 (aspect-[4/3])
 * 2. Tall Vertical Posters (/plans) -> strictly locked to 3:4 portrait (aspect-[3/4])
 * 3. PDF Extraction Canvas -> strictly locked to 4:3 (900x675)
 * 4. Full Modal Blueprint Viewer -> strictly locked to 4:3 (aspect-[4/3])
 */

describe('Plan Cards Aspect Ratio & Layout Lock', () => {
  const storeFilePath = path.resolve(__dirname, '../src/app/plans/store/page.tsx');
  const galleryFilePath = path.resolve(__dirname, '../src/features/plans/PlanGallery.tsx');
  const adminManagerFilePath = path.resolve(__dirname, '../src/components/admin/AdminPlansManager.tsx');
  const modalViewerFilePath = path.resolve(__dirname, '../src/components/plans/WatermarkedPlanViewer.tsx');

  it('strictly locks Drawing Store (/plans/store) cards to 4:3 aspect ratio and generous height', () => {
    const fileContent = fs.readFileSync(storeFilePath, 'utf-8');

    // 1. Must use aspect-[4/3]
    expect(fileContent).toContain('aspect-[4/3]');
    // 2. Must NEVER use aspect-video or 16:9 for store thumbnails (too shallow for squarish CAD plans)
    expect(fileContent).not.toMatch(/PlanCardThumbnail[\s\S]*?aspect-video/);
    expect(fileContent).not.toMatch(/PlanCardThumbnail[\s\S]*?aspect-\[16\/9\]/);

    // 3. Must enforce minimum height so blueprints never collapse vertically
    expect(fileContent).toContain('min-h-[240px]');
    expect(fileContent).toContain('sm:min-h-[265px]');

    // 4. Must use object-contain so blueprints are never cropped or clipped
    expect(fileContent).toContain('object-contain');

    // 5. Must retain 2.2x cursor-tracked hover zoom magnification
    expect(fileContent).toContain("'scale(2.2)'");
  });

  it('strictly locks House Plans Gallery (/plans) cards to 3:4 portrait aspect ratio', () => {
    const fileContent = fs.readFileSync(galleryFilePath, 'utf-8');

    // 1. Must use aspect-[3/4] for HoverZoomImage to fit tall vertical infographic posters (1536x2752)
    expect(fileContent).toContain('aspect-[3/4]');

    // 2. Must NEVER accidentally switch HoverZoomImage to landscape 4:3 or 16:9 (which would crop >60% of vertical graphics)
    expect(fileContent).not.toMatch(/HoverZoomImage[\s\S]*?aspect-\[4\/3\]/);
    expect(fileContent).not.toMatch(/HoverZoomImage[\s\S]*?aspect-video/);
    expect(fileContent).not.toMatch(/HoverZoomImage[\s\S]*?aspect-\[16\/9\]/);
  });

  it('strictly locks Admin PDF extraction canvas to 4:3 standard (900x675)', () => {
    const fileContent = fs.readFileSync(adminManagerFilePath, 'utf-8');

    // Target width and height must be 900x675 (exactly 4:3)
    expect(fileContent).toContain('const targetW = 900;');
    expect(fileContent).toContain('const targetH = 675;');

    // Ratio must be exactly 4:3 (900 / 675 = 1.333...)
    const widthMatch = fileContent.match(/targetW\s*=\s*(\d+)/);
    const heightMatch = fileContent.match(/targetH\s*=\s*(\d+)/);
    expect(widthMatch).not.toBeNull();
    expect(heightMatch).not.toBeNull();

    const w = parseInt(widthMatch![1], 10);
    const h = parseInt(heightMatch![1], 10);
    expect((w / h).toFixed(2)).toBe('1.33');
  });

  it('strictly locks Watermarked Plan Viewer modal to generous 4:3 surface', () => {
    const fileContent = fs.readFileSync(modalViewerFilePath, 'utf-8');

    // Modal viewport must contain aspect-[4/3]
    expect(fileContent).toContain('aspect-[4/3]');
    // Must contain max-h constraint for high-res blueprint inspection
    expect(fileContent).toContain('max-h-[64vh]');
  });

  it('verifies SEO sitemap and canonical metadata for /plans/store', () => {
    const sitemapContent = fs.readFileSync(path.resolve(__dirname, '../src/app/sitemap.ts'), 'utf-8');
    const layoutContent = fs.readFileSync(path.resolve(__dirname, '../src/app/plans/store/layout.tsx'), 'utf-8');

    // Sitemap must include /plans/store
    expect(sitemapContent).toContain('${BASE_URL}/plans/store');

    // Layout must export canonical metadata and CollectionPage schema
    expect(layoutContent).toContain('https://www.homedesignenglish.com/plans/store');
    expect(layoutContent).toContain('CollectionPage');
    expect(layoutContent).toContain('Store');
  });
});
