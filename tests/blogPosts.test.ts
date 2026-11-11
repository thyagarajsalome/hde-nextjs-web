import { describe, it, expect } from 'vitest';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '../src/lib/mdx';

describe('Blog Data & Functions', () => {
  it('returns all 30 posts without throwing filesystem errors', () => {
    const posts = getAllPosts();
    expect(posts.length).toBe(30);
    expect(posts[0]).toHaveProperty('slug');
    expect(posts[0]).toHaveProperty('meta');
    expect(posts[0]).toHaveProperty('content');
  });

  it('retrieves individual post by slug correctly', () => {
    const post = getPostBySlug('house-construction-cost-in-india-2026');
    expect(post).toBeDefined();
    expect(post.slug).toBe('house-construction-cost-in-india-2026');
    expect(post.meta.title).toBeTruthy();
    expect(post.meta.region).toBe('IN');
    expect(post.content.length).toBeGreaterThan(100);
    expect(post.html).toBeDefined();
    expect(post.html).toContain('<');
  });

  it('strictly isolates related posts by region', () => {
    const related = getRelatedPosts('house-construction-cost-in-india-2026', 3);
    expect(related.length).toBeGreaterThan(0);
    related.forEach((p) => {
      expect(['IN', 'Global']).toContain(p.meta.region);
    });
  });

  it('retrieves USA blog posts correctly', () => {
    const post = getPostBySlug('barndominium-cost-per-square-foot-guide-2026');
    expect(post.meta.region).toBe('US');
  });

  it('retrieves Dubai blog posts correctly', () => {
    const post = getPostBySlug('true-cost-of-buying-property-in-dubai-2026');
    expect(post.meta.region).toBe('AE');
  });
});
