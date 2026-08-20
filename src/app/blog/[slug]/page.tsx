import { getPostBySlug, getAllPosts } from '@/lib/mdx';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  try {
    const post = getPostBySlug(resolvedParams.slug);
    return {
      title: post.meta.title + ' | HDE',
      description: post.meta.description,
    };
  } catch (e) {
    return { title: 'Not Found' };
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let post;
  try {
    post = getPostBySlug(resolvedParams.slug);
  } catch (e) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 min-h-screen">
      <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary transition-colors mb-8">
        <i className="fas fa-arrow-left mr-2"></i> Back to Guides
      </Link>
      
      <header className="mb-10 text-center">
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          {post.meta.category}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          {post.meta.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
          <span><i className="far fa-calendar-alt mr-2"></i>{post.meta.date}</span>
          <span>&bull;</span>
          <span>By {post.meta.author}</span>
        </div>
      </header>

      <div className="prose prose-lg prose-indigo max-w-none text-gray-700">
        <MDXRemote source={post.content} />
      </div>

      <div className="mt-16 p-6 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-zinc-200 mb-2 flex items-center gap-2">
          <i className="fas fa-info-circle text-primary"></i> Friendly Reminder
        </h3>
        <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed">
          The guides and calculators provided by HDE are designed for educational and general estimation purposes to help you plan your home journey. Real estate markets, mortgage rates, and construction costs vary by location and change over time. We always recommend consulting with your local lender, financial advisor, or certified contractor to get the most accurate figures for your specific situation.
        </p>
      </div>
      
      <div className="mt-12 text-center">
         <Link href="/" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg">
            Try our Free Construction Calculator
         </Link>
      </div>
    </article>
  );
}