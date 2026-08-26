import Link from 'next/link';
import { designStyles } from '@/data/designStyles';

export default function DesignStylesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Interactive Regional Style Guides</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {designStyles.map((style) => (
          <div key={style.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-200 relative">
              {/* Fallback color if image is not present */}
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${style.image})` }}
              ></div>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="text-sm text-blue-600 font-semibold mb-1">{style.region}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{style.name}</h2>
              <p className="text-gray-600 mb-4 flex-grow">{style.description}</p>
              <Link
                href={`/design-styles/${style.id}`}
                className="inline-block text-center bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Explore Style
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
