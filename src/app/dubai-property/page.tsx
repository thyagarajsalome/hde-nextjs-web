import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import DubaiLeadForm from '@/components/dubai/DubaiLeadForm';
import DubaiAreaList from '@/components/dubai/DubaiAreaList';

export const metadata: Metadata = {
  title: 'Dubai Property Advisor | Find the Right Property for You | HDE',
  description: 'Free Dubai property buying cost calculator, area guides, and personalized property recommendations. Compare areas like Dubai Marina, Business Bay, JVC, Downtown Dubai, and more.',
  keywords: 'dubai property, buy property in dubai, dubai real estate, dubai apartments, dubai property investment, dubai property calculator',
};


const areas = [
  { name: 'Dubai Marina', icon: 'fas fa-city', tagline: 'Waterfront luxury living', slug: 'dubai-marina' },
  { name: 'Downtown Dubai', icon: 'fas fa-building', tagline: 'The heart of the city', slug: 'downtown-dubai' },
  { name: 'Business Bay', icon: 'fas fa-briefcase', tagline: 'Business meets lifestyle', slug: 'business-bay' },
  { name: 'Jumeirah Village Circle (JVC)', icon: 'fas fa-home', tagline: 'Affordable family living', slug: 'jvc' },
  { name: 'Dubai Hills Estate', icon: 'fas fa-golf-ball', tagline: 'Premium green community', slug: 'dubai-hills' },
  { name: 'Palm Jumeirah', icon: 'fas fa-umbrella-beach', tagline: 'Iconic island living', slug: 'palm-jumeirah' },
  { name: 'Jumeirah Lake Towers (JLT)', icon: 'far fa-building', tagline: 'Affordable lakeside towers', slug: 'jlt' },
  { name: 'Dubai Creek Harbour', icon: 'fas fa-water', tagline: 'Next-gen waterfront', slug: 'dubai-creek-harbour' },
  { name: 'Mohammed Bin Rashid City (MBR)', icon: 'fas fa-tree', tagline: 'Ultra-premium villas', slug: 'mbr-city' },
  { name: 'Arabian Ranches', icon: 'fas fa-horse-head', tagline: 'Suburban villa community', slug: 'arabian-ranches' },
  { name: 'Dubai South', icon: 'fas fa-plane', tagline: 'Near Al Maktoum Airport', slug: 'dubai-south' },
  { name: 'Jumeirah Beach Residence (JBR)', icon: 'fas fa-umbrella-beach', tagline: 'Beachfront lifestyle', slug: 'jbr' },
  { name: 'Dubai Silicon Oasis', icon: 'fas fa-laptop', tagline: 'Tech hub living', slug: 'dubai-silicon-oasis' },
  { name: 'Al Barsha', icon: 'fas fa-shopping-bag', tagline: 'Central & well-connected', slug: 'al-barsha' },
  { name: 'Dubai Sports City', icon: 'fas fa-futbol', tagline: 'Active lifestyle community', slug: 'dubai-sports-city' },
];

const faqs = [
  {
    question: "Can foreigners buy property in Dubai?",
    answer: "Yes, in designated freehold areas, foreign nationals can buy, sell, and lease property with full ownership rights."
  },
  {
    question: "What are the buying costs in Dubai?",
    answer: "Typical buying costs include a 4% DLD registration fee, approximately 2% agent commission, and various administrative fees. The total usually comes to around 6-7% of the property value."
  },
  {
    question: "What is the minimum budget to buy property in Dubai?",
    answer: "Studio apartments in affordable areas like JVC start from around AED 400,000, but minimums vary widely by location and property type."
  },
  {
    question: "Is Dubai property a good investment?",
    answer: "Dubai offers relatively high rental yields (often 5-9%) and zero income tax. However, investment involves risk. Past performance is not indicative of future results. Always verify current regulations and seek professional advice."
  },
  {
    question: "What is the Golden Visa for property buyers?",
    answer: "Properties worth AED 2,000,000 or more may qualify the buyer for a 10-year UAE Golden Visa, subject to current immigration rules."
  },
  {
    question: "Off-plan vs ready property — which is better?",
    answer: "Off-plan offers lower entry prices and attractive payment plans but carries construction and delay risks. Ready properties offer immediate rental income or occupancy but require larger upfront payments."
  }
];

export default function DubaiPropertyPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://homedesignenglish.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Dubai Property",
        "item": "https://homedesignenglish.com/dubai-property"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <main className="min-h-screen">
      <Script id="breadcrumb-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero Section */}
      <section className="relative text-white py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/dubai-skyline.jpg" 
            alt="Dubai Skyline" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/80"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-md">Find the Dubai Property That Fits Your Goals</h1>
          <p className="text-lg md:text-xl text-white mb-10 drop-shadow">
            Compare areas, understand costs, and make informed decisions — whether you're investing from India, UK, or anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="#areas" className="bg-primary hover:bg-primary-hover text-slate-900 font-bold py-3 px-8 rounded-lg transition-colors">
              Explore Dubai Areas
            </Link>
            <Link href="/dubai-property/calculator" className="bg-transparent border-2 border-white hover:bg-white hover:text-slate-900 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Property Cost Calculator
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <span className="flex items-center gap-2 bg-white/10 py-2 px-4 rounded-full">15+ Areas Covered</span>
            <span className="flex items-center gap-2 bg-white/10 py-2 px-4 rounded-full">Free Cost Calculator</span>
            <span className="flex items-center gap-2 bg-white/10 py-2 px-4 rounded-full">Expert Area Guides</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white dark:bg-zinc-950 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-zinc-100">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-4xl mb-4 text-primary"><i className="fas fa-search"></i></div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">1. Choose an Area</h3>
              <p className="text-gray-600 dark:text-zinc-400">Browse our detailed Dubai area guides to find the perfect location.</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-4 text-primary"><i className="fas fa-calculator"></i></div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">2. Understand Costs</h3>
              <p className="text-gray-600 dark:text-zinc-400">Use our buying cost calculator to see all hidden fees.</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-4 text-primary"><i className="fas fa-map-marked-alt"></i></div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">3. Compare Options</h3>
              <p className="text-gray-600 dark:text-zinc-400">See which areas fit your budget and lifestyle requirements.</p>
            </div>
            <div className="p-4">
              <div className="text-4xl mb-4 text-primary"><i className="fas fa-check-circle"></i></div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">4. Make Your Decision</h3>
              <p className="text-gray-600 dark:text-zinc-400">Armed with real data, not hype, you can confidently invest.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Areas List */}
      <section id="areas" className="bg-gray-50 dark:bg-zinc-900 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-zinc-100">Explore Dubai Property Areas</h2>
          <DubaiAreaList areas={areas} />
        </div>
      </section>

      {/* Why Dubai Section */}
      <section className="bg-white dark:bg-zinc-950 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-zinc-100">Why Invest in Dubai Property?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary/5 dark:bg-primary/20 p-6 rounded-xl border border-primary/20 dark:border-blue-900/50">
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">Zero Income Tax</h3>
              <p className="text-sm text-gray-700 dark:text-zinc-300">No tax on rental income or capital gains for individuals, maximizing your investment returns.</p>
            </div>
            <div className="bg-primary/5 dark:bg-primary/20 p-6 rounded-xl border border-primary/20 dark:border-blue-900/50">
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">Golden Visa</h3>
              <p className="text-sm text-gray-700 dark:text-zinc-300">Property investment of AED 2M+ qualifies for a 10-year renewable residency visa for you and your family.</p>
            </div>
            <div className="bg-primary/5 dark:bg-primary/20 p-6 rounded-xl border border-primary/20 dark:border-blue-900/50">
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">High Rental Yields</h3>
              <p className="text-sm text-gray-700 dark:text-zinc-300">Dubai consistently offers 5-9% gross yields, significantly outperforming the 2-4% average in most global cities.</p>
            </div>
            <div className="bg-primary/5 dark:bg-primary/20 p-6 rounded-xl border border-primary/20 dark:border-blue-900/50">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-shield-alt text-primary"></i>
                <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Regulated by RERA</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-zinc-300">The Real Estate Regulatory Agency (RERA) ensures a highly transparent market. Buyer funds for off-plan properties are strictly held in secure Escrow accounts.</p>
            </div>
            <div className="bg-primary/5 dark:bg-primary/20 p-6 rounded-xl border border-primary/20 dark:border-blue-900/50">
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">World-Class Infrastructure</h3>
              <p className="text-sm text-gray-700 dark:text-zinc-300">State-of-the-art metro, international airports, premium healthcare, and top-tier international schools.</p>
            </div>
            <div className="bg-primary/5 dark:bg-primary/20 p-6 rounded-xl border border-primary/20 dark:border-blue-900/50">
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">Global Connectivity</h3>
              <p className="text-sm text-gray-700 dark:text-zinc-300">Strategically located between East and West, with a third of the world's population within a 4-hour flight.</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-500 text-center max-w-3xl mx-auto">
            Investment involves risk. Past performance is not indicative of future results. Always verify current regulations and seek professional advice.
          </p>
        </div>
      </section>

      {/* Property Cost Calculator CTA Banner */}
      <section className="bg-white dark:bg-zinc-950 py-16 px-6 text-center border-t border-gray-100 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto bg-gray-50 dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-zinc-100">Know Your True Buying Costs</h2>
          <p className="text-lg mb-8 text-gray-700 dark:text-zinc-300">
            DLD fees, agent commission, mortgage registration, service charges — our free calculator breaks it all down.
          </p>
          <Link href="/dubai-property/calculator" className="inline-block bg-primary text-white hover:bg-primary-hover font-bold py-3 px-8 rounded-lg transition-colors shadow-md">
            Open Calculator
          </Link>
        </div>
      </section>

      {/* Lead Generation Form Section */}
      <section className="bg-primary/5 dark:bg-primary/10 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-zinc-100">Ready to Take the Next Step?</h2>
            <p className="text-lg text-gray-700 dark:text-zinc-300 mb-6">
              Whether you are looking for a high-yield investment, a luxury holiday home, or a Golden Visa property, our network of verified Dubai real estate experts is here to guide you.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <i className="fas fa-check-circle text-primary mt-1 text-xl"></i>
                <span className="text-gray-700 dark:text-zinc-300">Access to exclusive off-plan launches</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check-circle text-primary mt-1 text-xl"></i>
                <span className="text-gray-700 dark:text-zinc-300">Unbiased advice across all major developers</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-check-circle text-primary mt-1 text-xl"></i>
                <span className="text-gray-700 dark:text-zinc-300">End-to-end support including mortgage and handover</span>
              </li>
            </ul>
          </div>
          <div>
            <DubaiLeadForm />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 dark:bg-zinc-900 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-zinc-100">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-zinc-100">{faq.question}</h3>
                <p className="text-gray-700 dark:text-zinc-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
