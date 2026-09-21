import { getPostBySlug, getAllPosts, getRelatedPosts } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  try {
    const post = getPostBySlug(resolvedParams.slug);
    const desc = post.meta.description || post.meta.excerpt || 'Expert home construction and planning guide by HDE.';
    return {
      title: `${post.meta.title} | HDE`,
      description: desc,
      alternates: {
        canonical: `/blog/${resolvedParams.slug}`,
      },
      openGraph: {
        title: `${post.meta.title} | HDE`,
        description: desc,
        url: `/blog/${resolvedParams.slug}`,
        type: 'article',
        publishedTime: post.meta.date,
        authors: [post.meta.author],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.meta.title} | HDE`,
        description: desc,
      },
    };
  } catch (e) {
    return { title: 'Not Found | HDE' };
  }
}

function getContextualCTA(slug: string, category: string) {
  const s = slug.toLowerCase();
  const c = category.toLowerCase();

  if (s.includes('loan') || s.includes('emi') || c.includes('loan')) {
    return {
      title: 'Calculate Your Monthly Home Loan EMI',
      subtitle: 'Compare interest rates across SBI, HDFC, ICICI, and view year-wise amortization schedules free.',
      buttonText: 'Open Free Home Loan EMI Calculator',
      href: '/#india-emi',
      icon: 'fas fa-calculator',
    };
  }

  if (s.includes('kitchen') || c.includes('kitchen')) {
    return {
      title: 'Estimate Your Modular Kitchen Cost',
      subtitle: 'Browse 100+ verified modular kitchen layouts and get accurate running-foot pricing for your home.',
      buttonText: 'Explore Kitchen Designs & Estimator',
      href: '/gallery/kitchen-designs',
      icon: 'fas fa-kitchen-set',
    };
  }

  if (s.includes('bathroom') || c.includes('bathroom')) {
    return {
      title: 'Plan Your Bathroom Remodel Budget',
      subtitle: 'Calculate waterproofing, plumbing, tiles, and sanitaryware costs for standard and luxury bathrooms.',
      buttonText: 'View Bathroom Gallery & Costs',
      href: '/gallery/bathroom-designs',
      icon: 'fas fa-bath',
    };
  }

  if (s.includes('rent') || s.includes('buy') || s.includes('bangalore') || s.includes('property')) {
    return {
      title: 'Looking to Rent or Buy in Bangalore?',
      subtitle: 'Explore community-spotted properties, vacant homes, and direct owner listings on the referral board.',
      buttonText: 'Browse Bangalore Property Referrals',
      href: '/bangalore/referrals',
      icon: 'fas fa-handshake',
    };
  }

  return {
    title: 'Calculate Exact Construction Costs for Your Dream Home',
    subtitle: 'Get a free, instant city-specific cost estimate with material breakdowns (cement, steel, sand, labor).',
    buttonText: 'Launch Free Construction Calculator',
    href: '/',
    icon: 'fas fa-trowel-bricks',
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let post;
  try {
    post = getPostBySlug(resolvedParams.slug);
  } catch (e) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(resolvedParams.slug, 3);
  const cta = getContextualCTA(resolvedParams.slug, post.meta.category);

  // Structured Data (JSON-LD) for Google Search
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta.title,
    description: post.meta.description || post.meta.excerpt,
    author: {
      '@type': 'Person',
      name: post.meta.author || 'HDE Editorial Team',
    },
    datePublished: post.meta.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.homedesignenglish.com/blog/${resolvedParams.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Home Design English (HDE)',
      url: 'https://www.homedesignenglish.com',
    },
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8 flex-wrap">
          <Link href="/blog" className="hover:text-[#4165af] transition no-underline text-gray-600 flex items-center gap-1">
            <i className="fas fa-arrow-left text-[10px]"></i>
            <span>All Guides</span>
          </Link>
          <span>/</span>
          <span className="text-[#4165af] font-bold">{post.meta.category}</span>
        </div>

        {/* Article Header */}
        <header className="mb-10 text-center space-y-4 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-[#4165af]/10 text-[#4165af] rounded-full text-xs font-extrabold uppercase tracking-wider">
              {post.meta.category}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold flex items-center gap-1">
              <i className="far fa-clock text-[11px]"></i>
              {post.meta.readingTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
            {post.meta.title}
          </h1>

          {post.meta.description && (
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {post.meta.description}
            </p>
          )}

          <div className="flex items-center justify-center gap-3 text-xs text-slate-400 pt-2 border-t border-gray-100">
            <span><i className="far fa-calendar-alt mr-1.5"></i>{post.meta.date}</span>
            <span>&bull;</span>
            <span>By {post.meta.author}</span>
          </div>
        </header>

        {/* Article Body */}
        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="prose prose-base sm:prose-lg prose-indigo max-w-none text-slate-700 prose-headings:font-bold prose-headings:text-slate-900 prose-th:text-slate-900 prose-thead:bg-slate-100 prose-th:p-3.5 prose-td:p-3 prose-img:rounded-2xl prose-a:text-[#4165af] prose-a:font-semibold">
            <MDXRemote source={post.content} />
          </div>

          {/* Friendly Reminder Box */}
          <div className="mt-14 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <i className="fas fa-circle-info text-[#4165af]"></i>
              <span>Professional Advisory Reminder</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The guides and estimates published by HDE are provided for general educational and planning benchmarks. Construction rates, mortgage criteria, and property valuations vary across specific municipal zones and market conditions. Always verify technical drawings with a licensed structural engineer and finalize loan terms with your authorized lending institution.
            </p>
          </div>
        </div>

        {/* Contextual CTA Banner */}
        <div className="mt-10 bg-gradient-to-r from-[#1e3a5f] to-[#4165af] rounded-3xl p-6 sm:p-8 text-white text-center shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto text-xl">
            <i className={cta.icon}></i>
          </div>
          <div className="max-w-xl mx-auto space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {cta.title}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {cta.subtitle}
            </p>
          </div>
          <div>
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1e3a5f] font-extrabold text-xs sm:text-sm rounded-xl hover:bg-blue-50 transition shadow-sm no-underline"
            >
              <span>{cta.buttonText}</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
          </div>
        </div>

        {/* Related Guides Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-14 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <i className="fas fa-book-bookmark text-[#4165af]"></i>
                <span>Related Planning Guides</span>
              </h3>
              <Link href="/blog" className="text-xs font-bold text-[#4165af] hover:underline no-underline">
                View all guides &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all hover:-translate-y-0.5 no-underline flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#4165af] bg-blue-50 px-2 py-0.5 rounded">
                      {rel.meta.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#4165af] transition line-clamp-2 leading-snug">
                      {rel.meta.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {rel.meta.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 mt-3">
                    <span>{rel.meta.readingTime}</span>
                    <span className="font-bold text-[#4165af] group-hover:translate-x-0.5 transition-transform">
                      Read &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}