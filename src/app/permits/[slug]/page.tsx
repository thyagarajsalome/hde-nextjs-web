import { notFound } from 'next/navigation';
import { permitGuides } from '@/data/permitGuides';

export function generateStaticParams() {
  return permitGuides.map((guide) => ({
    slug: guide.slug,
  }));
}

export default async function PermitGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const guide = permitGuides.find((g) => g.slug === resolvedParams.slug);

  if (!guide) {
    notFound();
  }

  return (
    <main className="container mx-auto py-12 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">Building Permits in {guide.cityName}, {guide.stateName}</h1>
      
      <div className="bg-red-50 border-l-4 border-red-500 p-6 my-8 rounded-r-lg">
        <h2 className="text-xl font-bold text-red-700 mb-2">⚠️ MASSIVE WARNING</h2>
        <p className="text-red-600 font-semibold text-lg">
          Building codes change constantly. This is a general guide. Always verify with the official city department.
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold mb-4">Common Rules Cheat Sheet</h2>
        <ul className="list-disc pl-6 space-y-2 text-lg text-gray-700">
          {guide.generalRules.map((rule, idx) => (
            <li key={idx}>{rule}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-blue-50 p-8 rounded-lg border border-blue-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Building/Zoning Dept Phone</h3>
          <p className="text-3xl font-bold text-gray-900">{guide.phone}</p>
        </div>
        
        <a 
          href={guide.portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors text-center w-full md:w-auto"
        >
          Go to Official {guide.cityName} Permit Portal
        </a>
      </div>
    </main>
  );
}
