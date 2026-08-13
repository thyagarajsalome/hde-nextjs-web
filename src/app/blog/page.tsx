import Link from 'next/link';
import { getAllPosts } from '@/lib/mdx';
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <Link href={/blog/ + post.slug} key={post.slug} className="group">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 h-full flex flex-col">
              <span className="text-primary text-sm font-bold mb-2 block">{post.meta.category}</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{post.meta.title}</h2>
              <p className="text-gray-600 mb-6 flex-grow">{post.meta.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                <span>{post.meta.date}</span>
                <span className="font-semibold group-hover:text-primary">Read Article <i className="fas fa-arrow-right ml-1"></i></span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}