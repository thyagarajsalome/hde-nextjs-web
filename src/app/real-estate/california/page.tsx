import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real Estate Calculators for California | HDE',
  description: 'Free real estate calculators for every major city in California. Estimate rent vs. buy, property taxes, kitchen remodel costs, swimming pool costs, and more.',
};

const TOOLS = [
  { id: 'rent-vs-buy', name: 'Rent vs. Buy Calculator' },
  { id: 'property-tax', name: 'Property Tax Calculator' },
  { id: 'salary-needed-to-buy', name: 'Salary Needed to Buy' },
  { id: 'remodel-roi', name: 'Remodel ROI Calculator' },
  { id: 'kitchen-remodel', name: 'Kitchen Remodel Cost' },
  { id: 'home-addition', name: 'Home Addition Cost' },
  { id: 'swimming-pool-cost', name: 'Swimming Pool Cost' },
  { id: 'pickleball-court-cost', name: 'Pickleball Court Cost' },
  { id: 'outdoor-kitchen-cost', name: 'Outdoor Kitchen Cost' },
];

const CITIES = [
  { name: 'Los Angeles', slug: 'los-angeles-california' },
  { name: 'San Diego', slug: 'san-diego-california' },
  { name: 'San Francisco', slug: 'san-francisco-california' },
];

export default function CaliforniaHubPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.homedesignenglish.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Real Estate Calculators',
        item: 'https://www.homedesignenglish.com/real-estate',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'California',
        item: 'https://www.homedesignenglish.com/real-estate/california',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-primary text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              California Real Estate Calculators
            </h1>
            <div className="prose prose-lg text-white max-w-4xl">
              <p>
                The California real estate market is legendary for its high demand, limited supply, and premium pricing. Home to global tech and entertainment hubs, cities like Los Angeles, San Diego, and San Francisco present some of the most competitive housing landscapes in the world. Navigating this market requires careful financial planning and a deep understanding of local economic factors.
              </p>
              <p>
                Homeownership in the Golden State comes with unique financial considerations. While property values are steep and state income taxes are among the highest in the country, the property tax system (governed by Proposition 13) limits the annual increase of assessed property values, providing some long-term predictability. Additionally, considerations such as earthquake insurance and strict environmental building codes can significantly impact construction and remodeling costs.
              </p>
              <p>
                Whether you are calculating the staggering salary needed to afford a starter home in San Francisco, estimating the ROI of a luxury kitchen remodel in Los Angeles, or determining the cost of adding an accessory dwelling unit (ADU) in San Diego, our California-focused calculators are designed to give you the precise insights needed to succeed in this complex market.
              </p>
            </div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto space-y-12">
            {CITIES.map((city) => (
              <div key={city.slug} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 border-b pb-2">
                  {city.name}, CA
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TOOLS.map((tool) => (
                    <a
                      key={tool.id}
                      href={`/real-estate/${tool.id}-in-${city.slug}`}
                      className="text-primary hover:text-blue-700 hover:underline font-medium p-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      {tool.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
