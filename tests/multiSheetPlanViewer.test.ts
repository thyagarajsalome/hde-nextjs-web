import { describe, it, expect } from 'vitest';
import { HousePlanRecord } from '../src/services/housePlanStoreService';

describe('Multi-Sheet Blueprint System Invariants', () => {
  it('supports single-page legacy house plan records without breaking', () => {
    const singlePlan: HousePlanRecord = {
      id: 'test-1',
      title: 'Compact 20x30 Floor Plan',
      area_sqft: 600,
      dimensions: '20x30',
      facing: 'East',
      floors: 'Ground Floor',
      bedrooms: 2,
      bathrooms: 2,
      parking: 'Bike',
      description: 'Single level plan',
      file_url: 'full-plans/sample.webp',
      pdf_url: 'pdf-plans/sample.pdf',
    };

    expect(singlePlan.file_url).toBe('full-plans/sample.webp');
    expect(singlePlan.preview_pages).toBeUndefined();
  });

  it('supports arbitrary multi-page architectural sets (Ground, First, Elevation, MEP, etc.)', () => {
    const multiSheetPlan: HousePlanRecord = {
      id: 'test-multi-1',
      title: '30x40 3 BHK Duplex Complete Pack',
      area_sqft: 1200,
      dimensions: '30x40',
      facing: 'North',
      floors: 'G+1',
      bedrooms: 3,
      bathrooms: 3,
      parking: '1 Car',
      description: 'Complete 3-sheet drawing set with ground floor, first floor and front elevation.',
      file_url: 'full-plans/ground-floor.webp',
      pdf_url: 'pdf-plans/complete-3-sheet-pack.pdf',
      preview_pages: [
        { title: 'Ground Floor Plan', url: 'full-plans/ground-floor.webp' },
        { title: 'First Floor Plan', url: 'full-plans/first-floor.webp' },
        { title: 'Front Architectural Elevation', url: 'full-plans/front-elevation.webp' },
      ],
      total_pages: 3,
    };

    expect(multiSheetPlan.preview_pages?.length).toBe(3);
    expect(multiSheetPlan.preview_pages?.[0]).toEqual({ title: 'Ground Floor Plan', url: 'full-plans/ground-floor.webp' });
    expect(multiSheetPlan.preview_pages?.[1]).toEqual({ title: 'First Floor Plan', url: 'full-plans/first-floor.webp' });
    expect(multiSheetPlan.preview_pages?.[2]).toEqual({ title: 'Front Architectural Elevation', url: 'full-plans/front-elevation.webp' });
  });

  it('supports plain string URL arrays for rapid multi-page entry', () => {
    const stringArrayPlan: HousePlanRecord = {
      id: 'test-str-1',
      title: '40x60 Villa Pack',
      area_sqft: 2400,
      dimensions: '40x60',
      facing: 'East',
      floors: 'G+2',
      bedrooms: 4,
      bathrooms: 4,
      parking: '2 Cars',
      description: 'Multi-sheet pack',
      file_url: 'full-plans/sheet1.webp',
      preview_pages: [
        'full-plans/sheet1.webp',
        'full-plans/sheet2.webp',
        'full-plans/sheet3.webp',
        'full-plans/sheet4.webp',
      ],
    };

    expect(stringArrayPlan.preview_pages?.length).toBe(4);
  });
});
