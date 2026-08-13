import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';
import BlogListClient from './BlogListClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Construction & Home Design Blog | HDE',
  description: 'Expert advice on construction costs, interior design, and home planning in India.',
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Construction & Design Guides</h1>
        <p className="text-xl text-gray-600">Expert advice, cost-saving tips, and building strategies for your dream home.</p>
      </div>

      <BlogListClient posts={posts} />
    </div>
  );
}
