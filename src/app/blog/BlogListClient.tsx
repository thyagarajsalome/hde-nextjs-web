"use client";
import React from 'react';
import Link from 'next/link';
import { useRegion } from '@/context/RegionContext';

export default function BlogListClient({ posts }: { posts: any[] }) {
  const { region } = useRegion();

  const filteredPosts = posts.filter(post => {
    if (region === 'US') {
      return post.meta.region === 'US' || post.meta.region === 'Global';
    }
    // Default India mode (show everything except US-only)
    return post.meta.region !== 'US';
  });

  if (filteredPosts.length === 0) {
    return (
      <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <p className="text-gray-500 font-medium">More articles coming soon for this region!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {filteredPosts.map((post) => (
        <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
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
  );
}
