import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real Estate Calculators for Texas | HDE',
  description: 'Free real estate calculators for every major city in Texas. Estimate rent vs. buy, property taxes, kitchen remodel costs, swimming pool costs, and more.',
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
  { name: 'Austin', slug: 'austin-texas' },
  { name: 'Dallas', slug: 'dallas-texas' },
  { name: 'Houston', slug: 'houston-texas' },
  { name: 'San Antonio', slug: 'san-antonio-texas' },
  { name: 'Round Rock', slug: 'round-rock-texas' },
  { name: 'Georgetown', slug: 'georgetown-texas' },
  { name: 'Cedar Park', slug: 'cedar-park-texas' },
  { name: 'Pflugerville', slug: 'pflugerville-texas' },
  { name: 'Leander', slug: 'leander-texas' },
  { name: 'Plano', slug: 'plano-texas' },
  { name: 'Frisco', slug: 'frisco-texas' },
  { name: 'McKinney', slug: 'mckinney-texas' },
  { name: 'Allen', slug: 'allen-texas' },
  { name: 'Richardson', slug: 'richardson-texas' },
  { name: 'Sugar Land', slug: 'sugar-land-texas' },
  { name: 'The Woodlands', slug: 'the-woodlands-texas' },
  { name: 'Katy', slug: 'katy-texas' },
  { name: 'Pearland', slug: 'pearland-texas' },
  { name: 'Cypress', slug: 'cypress-texas' },
];

export default function TexasHubPage() {
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
        name: 'Texas',
        item: 'https://www.homedesignenglish.com/real-estate/texas',
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
              Texas Real Estate Calculators
            </h1>
            <div className="prose prose-lg text-white max-w-4xl">
              <p>
                The Texas real estate market is one of the most dynamic and rapidly growing in the United States. With major metropolitan hubs like Austin, Dallas, Houston, and San Antonio expanding at a blistering pace, navigating property investments and homeownership requires accurate data and localized insights.
              </p>
              <p>
                Unlike many other states, Texas has no state income tax, which historically drives high domestic migration. However, this is offset by some of the highest property tax rates in the nation. Understanding the unique balance of costs—from elevated property taxes to varying insurance premiums influenced by coastal weather or inland storms—is critical for anyone looking to buy, rent, or renovate in the Lone Star State.
              </p>
              <p>
                Whether you are calculating the ROI of a kitchen remodel in a classic Houston bungalow, determining if it makes financial sense to rent or buy in the booming suburbs of Dallas, or planning a custom pool addition in Austin, our suite of Texas-specific calculators provides the tailored estimates you need to make informed real estate decisions.
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
                  {city.name}, TX
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
