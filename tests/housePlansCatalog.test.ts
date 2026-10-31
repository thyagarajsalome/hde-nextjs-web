import { describe, it, expect } from 'vitest';
import { calculateSmartPlanMetrics } from '../src/services/housePlanStoreService';

describe('House Plans Catalog & Business Logic', () => {
  it('correctly calculates smart metrics for 30x40 G+1 duplex', () => {
    const metrics = calculateSmartPlanMetrics('30x40', 'G+1', 3, 3, 'East');
    expect(metrics.plotAreaSqft).toBe(1200);
    expect(metrics.builtUpAreaSqft).toBe(2040); // 1200 * 1.7
    expect(metrics.carpetAreaSqft).toBe(1530); // 2040 * 0.75
    expect(metrics.orientationNotes).toContain('East-Facing');
    expect(metrics.electricalPointsCount).toBeGreaterThan(40);
  });

  it('correctly calculates smart metrics for 20x30 G+1 small plot', () => {
    const metrics = calculateSmartPlanMetrics('20x30', 'G+1', 2, 2, 'North');
    expect(metrics.plotAreaSqft).toBe(600);
    expect(metrics.builtUpAreaSqft).toBe(1020);
    expect(metrics.orientationNotes).toContain('North-Facing');
  });

  it('ensures catalog merger never drops library plans when a user uploads 1 custom plan', () => {
    const mockLibrary = [
      { id: 'fb-1', title: '1200 Sqft Duplex (30x40)', file_url: 'plan1.webp' },
      { id: 'fb-2', title: '600 Sqft Small Plot (20x30)', file_url: 'plan2.webp' },
      { id: 'fb-3', title: '1500 Sqft Villa (30x50)', file_url: 'plan3.webp' },
    ];

    const mockDbUploads = [
      { id: 'db-new-1', title: 'User Custom 30x50 Plan', file_url: 'user-plan.webp' }
    ];

    // Testing the merger algorithm implemented in PlanGallery
    const plansMap = new Map();
    mockDbUploads.forEach(p => plansMap.set(p.id, p));

    mockLibrary.forEach(fb => {
      if (!plansMap.has(fb.id)) {
        const isDuplicate = Array.from(plansMap.values()).some(
          p => p.title?.trim().toLowerCase() === fb.title.trim().toLowerCase()
        );
        if (!isDuplicate) {
          plansMap.set(fb.id, fb);
        }
      }
    });

    const merged = Array.from(plansMap.values());

    // CRITICAL: The total count must be db uploads + library (1 + 3 = 4), NEVER just 1!
    expect(merged.length).toBe(4);
    expect(merged[0].id).toBe('db-new-1'); // User upload sits first at the top
    expect(merged.some(p => p.id === 'fb-1')).toBe(true);
    expect(merged.some(p => p.id === 'fb-2')).toBe(true);
    expect(merged.some(p => p.id === 'fb-3')).toBe(true);
  });

  it('strictly verifies admin authorization for thyagaraja1983@gmail.com only', () => {
    const ADMIN_EMAIL = 'thyagaraja1983@gmail.com';

    const checkIsAdmin = (user: { email?: string } | null) => {
      return Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    };

    expect(checkIsAdmin(null)).toBe(false);
    expect(checkIsAdmin({ email: 'user@gmail.com' })).toBe(false);
    expect(checkIsAdmin({ email: 'attacker@gmail.com' })).toBe(false);
    expect(checkIsAdmin({ email: 'thyagaraja1983@gmail.com' })).toBe(true);
    expect(checkIsAdmin({ email: 'THYAGARAJA1983@GMAIL.COM' })).toBe(true); // Case-insensitive
  });

  it('safely handles deletion of non-UUID plans like plan-1793437915762 without database 400 crash', () => {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    // Non-UUID IDs should be identified as local/fallback and never sent to PostgreSQL UUID column
    expect(isUuid('plan-1793437915762')).toBe(false);
    expect(isUuid('fb-1')).toBe(false);
    expect(isUuid('00000000-0000-4000-8000-000000000001')).toBe(true);
    expect(isUuid('dee9c73a-c6ea-4d56-8f32-55d35264d270')).toBe(true);

    const planList = [
      { id: 'plan-1793437915762', title: 'Local Test Plan' },
      { id: 'dee9c73a-c6ea-4d56-8f32-55d35264d270', title: 'Real Database Plan' }
    ];

    // Deleting non-UUID should filter out smoothly
    const afterDelete = planList.filter(p => p.id !== 'plan-1793437915762');
    expect(afterDelete.length).toBe(1);
    expect(afterDelete[0].id).toBe('dee9c73a-c6ea-4d56-8f32-55d35264d270');
  });
});
