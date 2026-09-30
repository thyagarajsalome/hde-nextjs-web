import { describe, it, expect } from 'vitest';
import {
  BANGALORE_LOCALITIES,
  BANGALORE_ZONES,
  LOCALITY_TRANSIT_PROFILES,
  ZONE_TRANSIT_DEFAULTS,
  getBangaloreLocalitiesByZone,
} from '../src/data/bangaloreLocalities';

describe('Bangalore Localities & Regional Zone Integrity', () => {
  it('contains valid and complete locality records', () => {
    expect(BANGALORE_LOCALITIES.length).toBeGreaterThanOrEqual(30);

    BANGALORE_LOCALITIES.forEach((loc) => {
      expect(loc.id).toMatch(/^loc-[a-z0-9-]+$/);
      expect(loc.name).toBeTruthy();
      expect(loc.slug).toBeTruthy();
      expect(BANGALORE_ZONES).toContain(loc.zone);
      expect(loc.pincode).toMatch(/^56\d{4}$/);
    });
  });

  it('guarantees that all user-requested missing areas exist in North Bangalore', () => {
    const slugs = BANGALORE_LOCALITIES.map((l) => l.slug);
    expect(slugs).toContain('rajankunte');
    expect(slugs).toContain('puttenahalli-yelahanka');
    expect(slugs).toContain('yelahanka-old-town');
    expect(slugs).toContain('yelahanka-new-town');
    expect(slugs).toContain('jakkur');
    expect(slugs).toContain('sahakarnagar');
    expect(slugs).toContain('vidyaranyapura');
  });

  it('provides verified transit distance profiles for every locality without nulls or negatives', () => {
    BANGALORE_LOCALITIES.forEach((loc) => {
      const profile = LOCALITY_TRANSIT_PROFILES[loc.id];
      expect(profile, `Missing transit profile for ${loc.name} (${loc.id})`).toBeDefined();
      expect(profile.airportKm).toBeGreaterThan(0);
      expect(profile.metroKm).toBeGreaterThanOrEqual(0);
      expect(profile.railwayKm).toBeGreaterThan(0);
      expect(profile.techParkKm).toBeGreaterThan(0);
      expect(profile.metroName).toBeTruthy();
      expect(profile.railwayName).toBeTruthy();
      expect(profile.techParkName).toBeTruthy();
    });
  });

  it('provides complete zone-level default transit profiles for "Others" custom area input', () => {
    BANGALORE_ZONES.forEach((zone) => {
      const defaults = ZONE_TRANSIT_DEFAULTS[zone];
      expect(defaults, `Missing zone defaults for ${zone}`).toBeDefined();
      expect(defaults.airportKm).toBeGreaterThan(5);
      expect(defaults.metroKm).toBeGreaterThanOrEqual(0.5);
      expect(defaults.railwayKm).toBeGreaterThan(0.5);
      expect(defaults.techParkKm).toBeGreaterThan(0.5);
    });

    // North Bangalore should be significantly closer to KIA Airport than South Bangalore
    expect(ZONE_TRANSIT_DEFAULTS['North Bangalore'].airportKm).toBeLessThan(
      ZONE_TRANSIT_DEFAULTS['South Bangalore'].airportKm
    );
  });

  it('correctly partitions all localities by zone with zero loss or duplication', () => {
    const partitioned = getBangaloreLocalitiesByZone();
    let totalCount = 0;
    const seenIds = new Set<string>();

    BANGALORE_ZONES.forEach((zone) => {
      const list = partitioned[zone];
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);

      list.forEach((loc) => {
        expect(loc.zone).toBe(zone);
        expect(seenIds.has(loc.id)).toBe(false);
        seenIds.add(loc.id);
        totalCount++;
      });
    });

    expect(totalCount).toBe(BANGALORE_LOCALITIES.length);
  });
});
