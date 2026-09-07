import { describe, it, expect } from 'vitest';

function parseUsaRealEstateSlug(slug: string) {
  if (!slug) return null;
  const match = slug.match(
    /^(rent-vs-buy|property-tax|salary-needed-to-buy|remodel-roi|kitchen-remodel|home-addition|swimming-pool-cost|pickleball-court-cost|outdoor-kitchen-cost)-in-(.+)$/
  );
  if (!match) return null;
  return {
    toolType: match[1],
    citySlug: match[2],
  };
}

function parseIndiaCostSlug(slug: string) {
  if (!slug) return null;
  const match = slug.match(
    /^(construction|interior-design|flooring|painting|home-loan-emi|building-material-cost)-in-(.+)$/
  );
  if (!match) return null;
  return {
    toolType: match[1],
    citySlug: match[2],
  };
}

describe('SEO Routing & Slug Parsers', () => {
  it('correctly parses all 9 USA Real Estate pSEO route patterns', () => {
    const tools = [
      'rent-vs-buy',
      'property-tax',
      'salary-needed-to-buy',
      'remodel-roi',
      'kitchen-remodel',
      'home-addition',
      'swimming-pool-cost',
      'pickleball-court-cost',
      'outdoor-kitchen-cost',
    ];

    tools.forEach((tool) => {
      const slug = `${tool}-in-austin-texas`;
      const parsed = parseUsaRealEstateSlug(slug);
      expect(parsed).not.toBeNull();
      expect(parsed?.toolType).toBe(tool);
      expect(parsed?.citySlug).toBe('austin-texas');
    });
  });

  it('correctly parses all 6 India Cost & EMI pSEO route patterns', () => {
    const indiaTools = [
      'construction',
      'interior-design',
      'flooring',
      'painting',
      'home-loan-emi',
      'building-material-cost',
    ];

    indiaTools.forEach((tool) => {
      const slug = `${tool}-in-mumbai`;
      const parsed = parseIndiaCostSlug(slug);
      expect(parsed).not.toBeNull();
      expect(parsed?.toolType).toBe(tool);
      expect(parsed?.citySlug).toBe('mumbai');
    });
  });

  it('returns null for invalid or malicious slug formats', () => {
    expect(parseUsaRealEstateSlug('invalid-slug')).toBeNull();
    expect(parseUsaRealEstateSlug('')).toBeNull();
    expect(parseIndiaCostSlug('unknown-in-mumbai')).toBeNull();
  });
});
