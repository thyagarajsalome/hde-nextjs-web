import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Interactive Plan Visualizer Assets & Stage Invariants', () => {
  const publicDir = path.resolve(__dirname, '../public/images/interactive-plan');

  const EXPECTED_ASSETS = [
    '01_walls-1.webp',
    '02_openings-1.webp',
    '03_flooring-1.webp',
    '04_furniture-1.webp',
    '05_kitchen-1.webp',
    '06_bathroom-1.webp',
    '08_full-plan-1.webp',
    '09_3d-render.webp',
  ];

  it('contains all 8 required webp assets on disk in public directory', () => {
    expect(fs.existsSync(publicDir)).toBe(true);

    for (const assetName of EXPECTED_ASSETS) {
      const assetPath = path.join(publicDir, assetName);
      expect(fs.existsSync(assetPath)).toBe(true);
      const stat = fs.statSync(assetPath);
      expect(stat.size).toBeGreaterThan(1000); // must be valid non-empty image
    }
  });

  it('verifies all 2D architectural stages and final 3D render exist', () => {
    const files = fs.readdirSync(publicDir);
    expect(files).toContain('01_walls-1.webp');
    expect(files).toContain('02_openings-1.webp');
    expect(files).toContain('03_flooring-1.webp');
    expect(files).toContain('04_furniture-1.webp');
    expect(files).toContain('05_kitchen-1.webp');
    expect(files).toContain('06_bathroom-1.webp');
    expect(files).toContain('08_full-plan-1.webp');
    expect(files).toContain('09_3d-render.webp');
  });
});
