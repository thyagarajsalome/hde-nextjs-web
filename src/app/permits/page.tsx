import Link from 'next/link';
import { permitGuides } from '@/data/permitGuides';

export default function PermitsLandingPage() {
  return (
    <main className="container mx-auto py-12 px-4">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Local Building Permit & Code Guides</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Find your local building permit portal, phone numbers, and common zoning rules for major US cities.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {permitGuides.map((guide) => (
          <Link 
            key={guide.slug} 
            href={`/permits/${guide.slug}`}
            className="block p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow bg-white"
          >
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              {guide.cityName}, {guide.stateName}
            </h2>
            <p className="text-gray-500">View permit guide &rarr;</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
