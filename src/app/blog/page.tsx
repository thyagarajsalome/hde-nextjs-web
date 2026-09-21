import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';
import BlogListClient from './BlogListClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Construction, Interior & Real Estate Guides | HDE',
  description: 'Expert guides on house construction costs, modular kitchens, home loan EMI calculations, and property planning in India.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Construction, Interior & Real Estate Guides | HDE',
    description: 'Expert guides on house construction costs, modular kitchens, home loan EMI calculations, and property planning in India.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200/80 pt-12 pb-14 shadow-2xs">
        <div className="container mx-auto px-4 max-w-6xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4165af] text-xs font-bold uppercase tracking-wider border border-blue-100">
            <i className="fas fa-book-open"></i>
            <span>Knowledge Hub &bull; 2026 Guides</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Construction, Interior &amp; Real Estate Guides
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Data-backed breakdowns, city-wise material rates, loan strategies, and practical building advice to help you build or buy your dream home with zero guesswork.
          </p>

          {/* Quick Tool Navigation Chips */}
          <div className="pt-3 flex items-center justify-center gap-2.5 flex-wrap text-xs font-bold">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition no-underline border border-slate-200"
            >
              <i className="fas fa-trowel-bricks text-[#4165af]"></i>
              <span>Construction Calculator</span>
            </Link>
            <Link
              href="/#india-emi"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition no-underline border border-slate-200"
            >
              <i className="fas fa-calculator text-emerald-600"></i>
              <span>Home Loan EMI</span>
            </Link>
            <Link
              href="/bangalore/referrals"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition no-underline border border-slate-200"
            >
              <i className="fas fa-handshake text-amber-600"></i>
              <span>Bangalore Referrals</span>
            </Link>
            <Link
              href="/plans"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition no-underline border border-slate-200"
            >
              <i className="fas fa-compass-drafting text-indigo-600"></i>
              <span>Floor Plans</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Blog Content */}
      <div className="container mx-auto px-4 max-w-6xl mt-10">
        <BlogListClient posts={posts} />
      </div>
    </div>
  );
}
