import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real Estate Calculators for Florida | HDE',
  description: 'Free real estate calculators for every major city in Florida. Estimate rent vs. buy, property taxes, kitchen remodel costs, swimming pool costs, and more.',
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
  { name: 'Miami', slug: 'miami-florida' },
  { name: 'Orlando', slug: 'orlando-florida' },
  { name: 'Tampa', slug: 'tampa-florida' },
  { name: 'Jacksonville', slug: 'jacksonville-florida' },
];

export default function FloridaHubPage() {
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
        name: 'Florida',
        item: 'https://www.homedesignenglish.com/real-estate/florida',
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
              Florida Real Estate Calculators
            </h1>
            <div className="prose prose-lg text-white max-w-4xl">
              <p>
                The Florida real estate market continues to attract buyers from across the country and around the world, drawn by year-round sunshine, beautiful beaches, and a business-friendly economic climate. Major markets such as Miami, Orlando, Tampa, and Jacksonville offer distinct lifestyles and investment opportunities, from bustling coastal high-rises to sprawling suburban communities.
              </p>
              <p>
                Like Texas, Florida boasts no state income tax, making it a highly desirable destination for retirees and remote workers alike. However, prospective homeowners must carefully budget for region-specific expenses. Property insurance premiums in Florida have historically been some of the highest in the nation due to hurricane risks and flood zones, significantly impacting the overall cost of homeownership.
              </p>
              <p>
                Whether you are analyzing the return on investment for a swimming pool addition in Miami, crunching the numbers to decide between renting or buying a condo in Tampa, or figuring out the salary needed to purchase a family home in Orlando, our Florida-specific tools provide essential, localized calculations to guide your real estate journey.
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
                  {city.name}, FL
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
