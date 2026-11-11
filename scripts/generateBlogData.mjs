// scripts/generateBlogData.mjs
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const contentDir = path.join(rootDir, 'src/content/blog');
const outputFile = path.join(rootDir, 'src/data/blogData.ts');

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

function normalizeRegion(slug, rawRegion, content) {
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

function normalizeCategory(slug, rawCategory) {
  if (rawCategory && rawCategory.trim()) return rawCategory.trim();
  if (slug.includes('kitchen')) return 'Kitchen & Interior';
  if (slug.includes('bathroom')) return 'Bathroom & Remodel';
  if (slug.includes('loan') || slug.includes('emi') || slug.includes('salary')) return 'Home Loans & Finance';
  if (slug.includes('dubai') || slug.includes('rent-vs-buy') || slug.includes('property')) return 'Real Estate';
  if (slug.includes('pool') || slug.includes('pickleball')) return 'Luxury Upgrades';
  return 'Construction Guide';
}

async function generate() {
  if (!fs.existsSync(contentDir)) {
    console.error(`Content directory ${contentDir} does not exist.`);
    process.exit(1);
  }

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx'));
  console.log(`Found ${files.length} MDX blog posts.`);

  const posts = [];
  for (const filename of files) {
    const realSlug = filename.replace(/\.mdx$/, '');
    const filePath = path.join(contentDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    const region = normalizeRegion(realSlug, data.region, content);

    const isFlagship =
      realSlug === 'house-construction-cost-in-india-2026' ||
      realSlug === 'rent-vs-buy-a-house-in-2026' ||
      realSlug === 'true-cost-of-buying-property-in-dubai-2026';

    const normalizedMeta = {
      title: data.title || 'Guide',
      description: data.description || data.excerpt || '',
      excerpt: data.excerpt || data.description || '',
      date: data.date || 'Recent',
      author: data.author || 'HDE Editorial Team',
      category: normalizeCategory(realSlug, data.category),
      region,
      coverImage: data.coverImage || undefined,
      readingTime: `${minutes} min read`,
      featured: Boolean(data.featured || isFlagship),
    };

    // Pre-render markdown to HTML for instant, eval-free rendering in Edge/Cloudflare Workers
    const html = await marked.parse(content, { gfm: true, breaks: true });

    posts.push({
      slug: realSlug,
      meta: normalizedMeta,
      content,
      html,
    });
  }

  // Sort descending by date
  posts.sort((p1, p2) => (p1.meta.date > p2.meta.date ? -1 : 1));

  // Ensure target directory exists
  const targetDir = path.dirname(outputFile);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const fileContent = `// Generated automatically by scripts/generateBlogData.mjs - DO NOT EDIT MANUALLY
export interface BlogPostMeta {
  title: string;
  description: string;
  excerpt?: string;
  date: string;
  author: string;
  category: string;
  region: string;
  coverImage?: string;
  readingTime: string;
  featured?: boolean;
}

export interface BlogPost {
  slug: string;
  meta: BlogPostMeta;
  content: string;
  html: string;
}

export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(posts, null, 2)};

export const BLOG_POSTS_BY_SLUG: Record<string, BlogPost> = Object.fromEntries(
  BLOG_POSTS.map((post) => [post.slug, post])
);
`;

  fs.writeFileSync(outputFile, fileContent, 'utf8');
  console.log(`Successfully generated ${outputFile} with ${posts.length} posts and pre-rendered HTML.`);
}

generate();
