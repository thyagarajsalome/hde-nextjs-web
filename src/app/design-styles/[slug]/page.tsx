import { notFound } from 'next/navigation';
import { designStyles } from '@/data/designStyles';

export async function generateStaticParams() {
  return designStyles.map((style) => ({
    slug: style.id,
  }));
}

export default async function StyleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const style = designStyles.find((s) => s.id === resolvedParams.slug);

  if (!style) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <div 
        className="w-full h-80 md:h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${style.image})`, backgroundColor: '#e2e8f0' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{style.name}</h1>
            <p className="text-lg md:text-xl text-gray-200">{style.region}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <p className="text-xl text-gray-700">{style.description}</p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Color Palette</h2>
          <div className="flex flex-wrap gap-4">
            {style.palette.map((color, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="w-24 h-24 rounded-full shadow-md border border-gray-200 mb-2"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm font-mono text-gray-600 uppercase">{color}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Shop the Look */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Shop the Look</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {style.items.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-blue-600 font-bold mb-4 flex-grow">${item.price}</p>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-center w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition"
                >
                  View Product
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
