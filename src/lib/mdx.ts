import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPostMeta {
  title: string;
  description: string;
  excerpt?: string;
  date: string;
  author: string;
  category: string;
  region?: string;
  coverImage?: string;
  readingTime: string;
  featured?: boolean;
}

export interface BlogPost {
  slug: string;
  meta: BlogPostMeta;
  content: string;
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
  const fullPath = path.join(contentDirectory, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));

  const normalizedMeta: BlogPostMeta = {
    title: data.title || 'Guide',
    description: data.description || data.excerpt || '',
    excerpt: data.excerpt || data.description || '',
    date: data.date || 'Recent',
    author: data.author || 'HDE Editorial Team',
    category: normalizeCategory(realSlug, data.category),
    region: data.region,
    coverImage: data.coverImage,
    readingTime: `${minutes} min read`,
    featured: Boolean(data.featured || realSlug === 'house-construction-cost-in-india-2026'),
  };

  return { slug: realSlug, meta: normalizedMeta, content };
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(contentDirectory);
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => getPostBySlug(file))
    .sort((post1, post2) => (post1.meta.date > post2.meta.date ? -1 : 1));
  return posts;
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const currentPost = getPostBySlug(currentSlug);
  const all = getAllPosts().filter((p) => p.slug !== currentSlug);

  // Match same category or same region first
  const sameCategory = all.filter((p) => p.meta.category === currentPost.meta.category);
  const others = all.filter((p) => p.meta.category !== currentPost.meta.category);

  return [...sameCategory, ...others].slice(0, limit);
}