import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BLOG_POSTS, BLOG_POSTS_BY_SLUG } from '../data/blogData';

const contentDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPostMeta {
  title: string;
  description: string;
  excerpt?: string;
  date: string;
  author: string;
  category: string;
  region: string; // 'IN' | 'US' | 'AE' | 'Global'
  coverImage?: string;
  readingTime: string;
  featured?: boolean;
}

export interface BlogPost {
  slug: string;
  meta: BlogPostMeta;
  content: string;
  html?: string;
}

const US_SLUGS = new Set([
  'backyard-pickleball-court-construction-cost',
  'bathroom-remodel-cost-breakdown-2026',
  'bathroom-remodel-costs-vs-roi',
  'board-and-batten-accent-wall-calculator',
  'home-addition-contractors-cost',
  'home-depot-carpet-installation-cost-vs-local',
  'how-much-salary-do-you-need-to-buy-a-house-in-2026',
  'kitchen-renovation-costs-guide',
  'outdoor-kitchen-roi-and-costs',
  'rent-vs-buy-a-house-in-2026',
  'roofing-shingles-cost-calculator-estimator',
  'swimming-pool-construction-costs',
]);

const AE_SLUGS = new Set([
  'true-cost-of-buying-property-in-dubai-2026',
]);

function normalizeRegion(slug: string, rawRegion?: string, content?: string): string {
  if (rawRegion) {
    const r = rawRegion.trim().toUpperCase();
    if (r === 'US' || r === 'USA') return 'US';
    if (r === 'AE' || r === 'UAE' || r === 'DUBAI') return 'AE';
    if (r === 'IN' || r === 'INDIA') return 'IN';
    if (r === 'GLOBAL') return 'Global';
  }

  if (US_SLUGS.has(slug)) return 'US';
  if (AE_SLUGS.has(slug) || slug.includes('dubai')) return 'AE';

  if (content && content.includes('$') && !content.includes('₹') && !content.includes('Rs') && !content.includes('Lakh')) {
    return 'US';
  }

  return 'IN';
}

function normalizeCategory(slug: string, rawCategory?: string): string {
  if (rawCategory && rawCategory.trim()) return rawCategory.trim();
  if (slug.includes('kitchen')) return 'Kitchen & Interior';
  if (slug.includes('bathroom')) return 'Bathroom & Remodel';
  if (slug.includes('loan') || slug.includes('emi') || slug.includes('salary')) return 'Home Loans & Finance';
  if (slug.includes('dubai') || slug.includes('rent-vs-buy') || slug.includes('property')) return 'Real Estate';
  if (slug.includes('pool') || slug.includes('pickleball')) return 'Luxury Upgrades';
  return 'Construction Guide';
}

export function getPostBySlug(slug: string): BlogPost {
  const realSlug = slug.replace(/\.mdx$/, '');

  // 1. Check pre-bundled blog data (instant in-memory, safe for Cloudflare Workers)
  if (BLOG_POSTS_BY_SLUG && BLOG_POSTS_BY_SLUG[realSlug]) {
    return BLOG_POSTS_BY_SLUG[realSlug];
  }

  // 2. Fallback to filesystem (in local dev if file added without rebuild)
  try {
    if (typeof fs !== 'undefined' && fs.existsSync) {
      const fullPath = path.join(contentDirectory, `${realSlug}.mdx`);
      if (fs.existsSync(fullPath)) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        const region = normalizeRegion(realSlug, data.region, content);

        const isFlagship =
          realSlug === 'house-construction-cost-in-india-2026' ||
          realSlug === 'rent-vs-buy-a-house-in-2026' ||
          realSlug === 'true-cost-of-buying-property-in-dubai-2026';

        const normalizedMeta: BlogPostMeta = {
          title: data.title || 'Guide',
          description: data.description || data.excerpt || '',
          excerpt: data.excerpt || data.description || '',
          date: data.date || 'Recent',
          author: data.author || 'HDE Editorial Team',
          category: normalizeCategory(realSlug, data.category),
          region,
          coverImage: data.coverImage,
          readingTime: `${minutes} min read`,
          featured: Boolean(data.featured || isFlagship),
        };

        return { slug: realSlug, meta: normalizedMeta, content };
      }
    }
  } catch (err) {
    console.warn(`Filesystem read failed for ${realSlug}:`, err);
  }

  throw new Error(`Blog post not found: ${realSlug}`);
}

export function getAllPosts(): BlogPost[] {
  // In development, attempt to read live from disk for hot reload if directory exists
  if (process.env.NODE_ENV === 'development') {
    try {
      if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(contentDirectory)) {
        const files = fs.readdirSync(contentDirectory);
        if (files && files.length > 0) {
          return files
            .filter((file) => file.endsWith('.mdx'))
            .map((file) => getPostBySlug(file))
            .sort((post1, post2) => (post1.meta.date > post2.meta.date ? -1 : 1));
        }
      }
    } catch {
      // Fall through to pre-bundled posts
    }
  }

  // In production / Cloudflare Workers runtime, always use pre-bundled data
  if (BLOG_POSTS && BLOG_POSTS.length > 0) {
    return BLOG_POSTS;
  }

  return [];
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const currentPost = getPostBySlug(currentSlug);
  const currentRegion = currentPost.meta.region;

  // Strict region isolation: NEVER mix India, USA, or Dubai articles in related posts
  const all = getAllPosts().filter((p) => {
    if (p.slug === currentSlug) return false;
    if (p.meta.region === 'Global') return true;
    return p.meta.region === currentRegion;
  });

  // Match same category first, then others within the same region
  const sameCategory = all.filter((p) => p.meta.category === currentPost.meta.category);
  const others = all.filter((p) => p.meta.category !== currentPost.meta.category);

  return [...sameCategory, ...others].slice(0, limit);
}