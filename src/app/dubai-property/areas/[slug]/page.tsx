import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface DubaiArea {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  propertyTypes: string[];
  priceRange: {
    studio: string;
    oneBed: string;
    twoBed: string;
    threeBed: string;
    villa?: string;
  };
  rentalYield: string;
  nearbyLandmarks: string[];
  transport: string[];
  lifestyle: string[];
  bestFor: string[];
  considerations: string[];
  faqs: { question: string; answer: string }[];
}

const DUBAI_AREAS: DubaiArea[] = [
  {
    slug: 'dubai-marina',
    name: 'Dubai Marina',
    icon: 'fas fa-city',
    tagline: 'Waterfront luxury',
    description: 'Dubai Marina is one of the most sought-after neighborhoods in Dubai. It offers a stunning waterfront lifestyle with high-rise luxury apartments and world-class amenities. Residents enjoy seamless access to dining, retail, and beach facilities, making it a vibrant hub for expats and professionals.',
    propertyTypes: ['Apartments', 'Penthouses'],
    priceRange: { studio: 'AED 550K', oneBed: 'AED 850K', twoBed: 'AED 1.3M', threeBed: 'AED 2.5M' },
    rentalYield: '5-7%',
    nearbyLandmarks: ['Marina Mall', 'JBR Beach', 'Ain Dubai'],
    transport: ['DMCC Metro Station', 'JLT Metro Station', 'Dubai Tram'],
    lifestyle: ['Beach access', 'Marina Walk', 'Fine dining', 'Nightlife'],
    bestFor: ['Young professionals', 'Investors', 'Expats'],
    considerations: ['Traffic congestion during peak hours', 'Premium service charges'],
    faqs: [
      { question: 'Is Dubai Marina a good investment?', answer: 'Yes, it offers strong rental yields of 5-7% and high liquidity due to constant demand.' },
      { question: 'What is the average rent in Dubai Marina?', answer: 'A 1-bedroom apartment averages around AED 90K - 110K per year depending on the tower.' },
      { question: 'Is Dubai Marina good for families?', answer: 'While popular with professionals, many families enjoy the amenities, though schools require a short commute.' },
      { question: 'What are the service charges in Dubai Marina?', answer: 'Service charges range from AED 14 to AED 25 per sqft depending on the building and amenities.' }
    ]
  },
  {
    slug: 'downtown-dubai',
    name: 'Downtown Dubai',
    icon: 'fas fa-building',
    tagline: 'Burj Khalifa district',
    description: 'Downtown Dubai is the iconic heart of the city, home to the Burj Khalifa and Dubai Mall. It offers an unparalleled cosmopolitan lifestyle with premium luxury apartments. The area is constantly bustling with tourists and residents enjoying world-class entertainment and dining.',
    propertyTypes: ['Apartments', 'Penthouses', 'Duplexes'],
    priceRange: { studio: 'AED 800K', oneBed: 'AED 1.2M', twoBed: 'AED 2M', threeBed: 'AED 3.5M' },
    rentalYield: '4-6%',
    nearbyLandmarks: ['Burj Khalifa', 'Dubai Mall', 'Dubai Opera', 'The Dubai Fountain'],
    transport: ['Burj Khalifa/Dubai Mall Metro Station'],
    lifestyle: ['Luxury shopping', 'Fine dining', 'Arts & Culture'],
    bestFor: ['Luxury buyers', 'Short-term rental investors', 'High-net-worth individuals'],
    considerations: ['Very high property prices', 'Tourist-heavy and busy year-round'],
    faqs: [
      { question: 'Is Downtown Dubai a good investment?', answer: 'It is excellent for capital preservation and short-term holiday rentals.' },
      { question: 'What is the average rent in Downtown Dubai?', answer: '1-bedroom apartments typically rent for AED 100K - 140K annually.' },
      { question: 'Is Downtown Dubai good for families?', answer: 'It suits urban families, though it lacks large villas and sprawling green spaces.' },
      { question: 'What are the service charges in Downtown Dubai?', answer: 'Expect higher service charges, often between AED 18 and AED 30 per sqft.' }
    ]
  },
  {
    slug: 'business-bay',
    name: 'Business Bay',
    icon: 'fas fa-briefcase',
    tagline: 'Business meets lifestyle',
    description: 'Business Bay is a rapidly maturing commercial and residential district adjacent to Downtown Dubai. It features the beautiful Dubai Water Canal and offers a more affordable entry point to central Dubai living. The area perfectly blends professional workspaces with vibrant residential options.',
    propertyTypes: ['Apartments', 'Offices', 'Penthouses'],
    priceRange: { studio: 'AED 500K', oneBed: 'AED 750K', twoBed: 'AED 1.2M', threeBed: 'AED 2M' },
    rentalYield: '6-8%',
    nearbyLandmarks: ['Dubai Water Canal', 'Downtown Dubai (walkable)'],
    transport: ['Business Bay Metro Station'],
    lifestyle: ['Urban living', 'Waterfront walks', 'Cafes and lounges'],
    bestFor: ['Investors', 'Professionals', 'Young couples'],
    considerations: ['Some towers still under construction', 'Variable building quality'],
    faqs: [
      { question: 'Is Business Bay a good investment?', answer: 'Yes, it provides excellent rental yields of 6-8% and is highly demanded by young professionals.' },
      { question: 'What is the average rent in Business Bay?', answer: 'A 1-bedroom apartment ranges from AED 75K to 95K per year.' },
      { question: 'Is Business Bay good for families?', answer: 'It is mostly favored by professionals, but newer developments are adding family-friendly amenities.' },
      { question: 'What are the service charges in Business Bay?', answer: 'Service charges generally range from AED 14 to AED 20 per sqft.' }
    ]
  },
  {
    slug: 'jvc',
    name: 'Jumeirah Village Circle',
    icon: 'fas fa-home',
    tagline: 'Affordable family hub',
    description: 'Jumeirah Village Circle (JVC) is a massive, family-friendly community offering a mix of villas, townhouses, and apartments. It is known for its affordability and abundance of parks. The area provides a tranquil, suburban feel while remaining accessible to major highways.',
    propertyTypes: ['Apartments', 'Townhouses', 'Villas'],
    priceRange: { studio: 'AED 380K', oneBed: 'AED 550K', twoBed: 'AED 800K', threeBed: 'AED 1.2M', villa: 'AED 2M+' },
    rentalYield: '7-9%',
    nearbyLandmarks: ['Circle Mall', 'Multiple community parks'],
    transport: ['Bus routes (No direct metro)'],
    lifestyle: ['Suburban peace', 'Family-centric', 'Community living'],
    bestFor: ['First-time buyers', 'Families', 'Budget investors'],
    considerations: ['No direct metro access', 'Traffic at main entry/exit points during rush hour'],
    faqs: [
      { question: 'Is JVC a good investment?', answer: 'JVC offers some of the highest rental yields in Dubai, often reaching 7-9%.' },
      { question: 'What is the average rent in JVC?', answer: 'Studios rent for around AED 45K, and 1-bedrooms for AED 60K - 75K.' },
      { question: 'Is JVC good for families?', answer: 'Absolutely, it features over 30 parks, international schools nearby, and a family-oriented vibe.' },
      { question: 'What are the service charges in JVC?', answer: 'Service charges are lower than average, typically AED 10 - AED 15 per sqft.' }
    ]
  },
  {
    slug: 'dubai-hills',
    name: 'Dubai Hills Estate',
    icon: 'fas fa-golf-ball',
    tagline: 'Premium green community',
    description: 'Dubai Hills Estate is a sprawling, master-planned community built around a championship golf course. It offers a blend of luxury villas, townhouses, and modern apartments. The expansive parks and proximity to downtown make it highly desirable for premium family living.',
    propertyTypes: ['Apartments', 'Townhouses', 'Villas', 'Mansions'],
    priceRange: { studio: 'N/A', oneBed: 'AED 1M', twoBed: 'AED 1.5M', threeBed: 'AED 2.2M', villa: 'AED 4M' },
    rentalYield: '5-7%',
    nearbyLandmarks: ['Dubai Hills Mall', 'Dubai Hills Golf Club', 'Dubai Hills Park'],
    transport: ['Future Metro line (planned 2026)', 'Al Khail Road access'],
    lifestyle: ['Golf course living', 'Extensive parks', 'Luxury retail'],
    bestFor: ['Families', 'Premium lifestyle seekers', 'Long-term residents'],
    considerations: ['Still developing in some phases', 'Currently car-dependent'],
    faqs: [
      { question: 'Is Dubai Hills a good investment?', answer: 'Yes, it offers strong capital appreciation potential as the master community matures.' },
      { question: 'What is the average rent in Dubai Hills?', answer: '1-bedroom apartments rent for AED 85K - 110K, while villas start around AED 300K.' },
      { question: 'Is Dubai Hills good for families?', answer: 'It is one of the best family communities in Dubai, featuring massive parks, schools, and a mall.' },
      { question: 'What are the service charges in Dubai Hills?', answer: 'Apartment service charges are around AED 15-20 per sqft; villas are lower on a per-sqft basis.' }
    ]
  },
  {
    slug: 'palm-jumeirah',
    name: 'Palm Jumeirah',
    icon: 'fas fa-umbrella-beach',
    tagline: 'Iconic island',
    description: 'Palm Jumeirah is a globally recognized man-made island synonymous with ultra-luxury. It features exclusive beachfront villas, premium apartments, and five-star resorts. Residents enjoy a resort-style lifestyle with private beaches and spectacular sea views.',
    propertyTypes: ['Apartments', 'Villas', 'Penthouses'],
    priceRange: { studio: 'N/A', oneBed: 'AED 1.8M', twoBed: 'AED 3M', threeBed: 'AED 5M', villa: 'AED 15M' },
    rentalYield: '4-6%',
    nearbyLandmarks: ['Atlantis The Palm', 'Nakheel Mall', 'The Pointe'],
    transport: ['Palm Monorail', 'Road access via trunk'],
    lifestyle: ['Beachfront living', 'Resort luxury', 'Exclusive dining'],
    bestFor: ['Ultra-luxury buyers', 'Holiday homes', 'High-net-worth investors'],
    considerations: ['Extremely high property prices', 'Limited new supply'],
    faqs: [
      { question: 'Is Palm Jumeirah a good investment?', answer: 'It is a prime asset for wealth preservation and holiday rentals, though yields are moderate.' },
      { question: 'What is the average rent in Palm Jumeirah?', answer: 'A 1-bedroom apartment averages AED 140K - 180K annually.' },
      { question: 'Is Palm Jumeirah good for families?', answer: 'Yes, the Signature Villas and Garden Homes offer private beaches perfect for affluent families.' },
      { question: 'What are the service charges in Palm Jumeirah?', answer: 'Service charges are premium, typically AED 20 - AED 35 per sqft.' }
    ]
  },
  {
    slug: 'jlt',
    name: 'Jumeirah Lake Towers',
    icon: 'far fa-building',
    tagline: 'Affordable lakeside',
    description: 'Jumeirah Lake Towers (JLT) is a dense residential and commercial district built around serene man-made lakes. It offers a pedestrian-friendly environment with numerous cafes and parks. As a free zone, it attracts many businesses and budget-conscious professionals.',
    propertyTypes: ['Apartments', 'Offices'],
    priceRange: { studio: 'AED 400K', oneBed: 'AED 600K', twoBed: 'AED 900K', threeBed: 'AED 1.5M' },
    rentalYield: '6-8%',
    nearbyLandmarks: ['JLT Lakes', 'JLT Park'],
    transport: ['DMCC Metro Station', 'Sobha Realty Metro Station'],
    lifestyle: ['Lakeside walks', 'Cafes & Dining', 'Pet-friendly parks'],
    bestFor: ['Budget-conscious professionals', 'Investors', 'Expats'],
    considerations: ['Mixed building quality', 'Some towers are older and need maintenance'],
    faqs: [
      { question: 'Is JLT a good investment?', answer: 'It is a solid entry-level investment with high rental yields and high occupancy rates.' },
      { question: 'What is the average rent in JLT?', answer: 'Studios go for around AED 50K, and 1-bedrooms for AED 70K - 85K.' },
      { question: 'Is JLT good for families?', answer: 'It works for small families due to the parks, but lacks the large villas found in suburban areas.' },
      { question: 'What are the service charges in JLT?', answer: 'Service charges range from AED 13 to AED 18 per sqft on average.' }
    ]
  },
  {
    slug: 'dubai-creek-harbour',
    name: 'Dubai Creek Harbour',
    icon: 'fas fa-water',
    tagline: 'Next-gen waterfront',
    description: 'Dubai Creek Harbour is a massive, futuristic waterfront development that merges modern design with natural beauty. It offers stunning views of the Downtown skyline and a peaceful, pedestrian-friendly environment. The area is positioned to be a major future hub of the city.',
    propertyTypes: ['Apartments', 'Penthouses'],
    priceRange: { studio: 'N/A', oneBed: 'AED 1M', twoBed: 'AED 1.6M', threeBed: 'AED 2.5M' },
    rentalYield: '5-7%',
    nearbyLandmarks: ['Creek Marina', 'Dubai Creek Tower (under construction)', 'Ras Al Khor Wildlife Sanctuary'],
    transport: ['No metro yet', 'Water taxis'],
    lifestyle: ['Modern waterfront', 'Nature views', 'Pedestrian promenades'],
    bestFor: ['Long-term investors', 'Modern lifestyle seekers', 'Young professionals'],
    considerations: ['Still under major development', 'Future supply might affect short-term price growth'],
    faqs: [
      { question: 'Is Dubai Creek Harbour a good investment?', answer: 'Yes, especially for capital appreciation as the mega-project nears completion.' },
      { question: 'What is the average rent in Dubai Creek Harbour?', answer: 'A 1-bedroom apartment currently rents for AED 80K - 100K.' },
      { question: 'Is Dubai Creek Harbour good for families?', answer: 'It is very family-friendly with large promenades, parks, and upcoming retail.' },
      { question: 'What are the service charges in Dubai Creek Harbour?', answer: 'Service charges are around AED 16 to AED 22 per sqft.' }
    ]
  },
  {
    slug: 'mbr-city',
    name: 'Mohammed Bin Rashid City',
    icon: 'fas fa-tree',
    tagline: 'Ultra-premium',
    description: 'MBR City is a sprawling, high-end master development featuring luxury villas, mansions, and upscale apartments. It includes the breathtaking District One with its massive crystal lagoon. The area offers suburban tranquility right next to the heart of the city.',
    propertyTypes: ['Apartments', 'Villas', 'Mansions'],
    priceRange: { studio: 'N/A', oneBed: 'AED 900K', twoBed: 'AED 1.4M', threeBed: 'N/A', villa: 'AED 3M' },
    rentalYield: '5-6%',
    nearbyLandmarks: ['Meydan Racecourse', 'District One Crystal Lagoon'],
    transport: ['Car access only (No direct metro)'],
    lifestyle: ['Ultra-luxury', 'Lagoon beaches', 'Equestrian living'],
    bestFor: ['Villa buyers', 'Families', 'Premium investors'],
    considerations: ['Highly car-dependent', 'Premium pricing structure'],
    faqs: [
      { question: 'Is MBR City a good investment?', answer: 'It offers strong long-term capital appreciation due to its central location and premium build.' },
      { question: 'What is the average rent in MBR City?', answer: '1-bedroom apartments rent for AED 80K - 110K, while villas command AED 250K+.' },
      { question: 'Is MBR City good for families?', answer: 'It is ideal for families seeking luxury, space, and unique amenities like the crystal lagoon.' },
      { question: 'What are the service charges in MBR City?', answer: 'Villa service charges are moderate, but apartment charges can range from AED 15-20 per sqft.' }
    ]
  },
  {
    slug: 'arabian-ranches',
    name: 'Arabian Ranches',
    icon: 'fas fa-horse-head',
    tagline: 'Established villa community',
    description: 'Arabian Ranches is one of Dubai’s first and most successful premium suburban communities. It features beautifully designed townhouses and standalone villas set amidst a desert-themed golf course. The mature landscaping and close-knit community vibe make it a family favorite.',
    propertyTypes: ['Townhouses', 'Villas'],
    priceRange: { studio: 'N/A', oneBed: 'N/A', twoBed: 'N/A', threeBed: 'AED 1.8M', villa: 'AED 2.5M' },
    rentalYield: '4-5%',
    nearbyLandmarks: ['Arabian Ranches Golf Club', 'Dubai Polo & Equestrian Club', 'Community Center'],
    transport: ['Car access via Sheikh Mohammed Bin Zayed Road'],
    lifestyle: ['Suburban golf living', 'Family community', 'Quiet & peaceful'],
    bestFor: ['Families seeking suburban lifestyle', 'End-users'],
    considerations: ['Older phases require villa maintenance', 'No metro access'],
    faqs: [
      { question: 'Is Arabian Ranches a good investment?', answer: 'It is excellent for steady rental income and family end-users, though yields are lower.' },
      { question: 'What is the average rent in Arabian Ranches?', answer: 'Townhouses rent for AED 140K+, and standalone villas for AED 200K+.' },
      { question: 'Is Arabian Ranches good for families?', answer: 'It is highly regarded as one of the top family communities with great schools nearby.' },
      { question: 'What are the service charges in Arabian Ranches?', answer: 'Service charges are calculated on plot/bua size, generally around AED 3-6 per sqft.' }
    ]
  },
  {
    slug: 'dubai-south',
    name: 'Dubai South',
    icon: 'fas fa-plane',
    tagline: 'Near Al Maktoum Airport',
    description: 'Dubai South is an emerging master-planned city centered around the Al Maktoum International Airport and Expo City. It is designed as an integrated hub for logistics, aviation, and affordable residential communities. It represents a long-term vision for the future expansion of Dubai.',
    propertyTypes: ['Apartments', 'Townhouses'],
    priceRange: { studio: 'AED 350K', oneBed: 'AED 500K', twoBed: 'AED 700K', threeBed: 'N/A' },
    rentalYield: '6-8%',
    nearbyLandmarks: ['Expo City Dubai', 'Al Maktoum International Airport (DWC)'],
    transport: ['Route 2020 Metro Station (Expo City)'],
    lifestyle: ['Emerging city', 'Budget living', 'Future-focused'],
    bestFor: ['Budget investors', 'Long-term appreciation play', 'Aviation professionals'],
    considerations: ['Still heavily developing', 'Far from the traditional city center'],
    faqs: [
      { question: 'Is Dubai South a good investment?', answer: 'It is a long-term play relying on the expansion of DWC airport and Expo City.' },
      { question: 'What is the average rent in Dubai South?', answer: 'Rents are very affordable; 1-bedrooms can be found for AED 40K - 55K.' },
      { question: 'Is Dubai South good for families?', answer: 'It is growing into a family area, but currently lacks the extensive amenities of mature suburbs.' },
      { question: 'What are the service charges in Dubai South?', answer: 'Service charges are very competitive, often under AED 12 per sqft.' }
    ]
  },
  {
    slug: 'jbr',
    name: 'Jumeirah Beach Residence',
    icon: 'fas fa-umbrella-beach',
    tagline: 'Beachfront living',
    description: 'JBR (Jumeirah Beach Residence) offers the ultimate beachfront lifestyle right on the Arabian Gulf. It consists of sandy-colored high-rise clusters overlooking the beach and Ain Dubai. The bustling promenade, The Walk, provides endless dining, retail, and entertainment options.',
    propertyTypes: ['Apartments', 'Penthouses'],
    priceRange: { studio: 'N/A', oneBed: 'AED 1.2M', twoBed: 'AED 2M', threeBed: 'AED 3.5M' },
    rentalYield: '5-7%',
    nearbyLandmarks: ['The Walk JBR', 'The Beach', 'Ain Dubai'],
    transport: ['Dubai Tram', 'DMCC Metro (via Tram)'],
    lifestyle: ['Beachfront active', 'Tourist hub', 'Dining and retail'],
    bestFor: ['Beach lifestyle seekers', 'Short-term rental investors', 'Expats'],
    considerations: ['Highly touristic and busy', 'Higher service charges and older building infrastructure'],
    faqs: [
      { question: 'Is JBR a good investment?', answer: 'It is fantastic for short-term holiday rentals due to its beachfront location.' },
      { question: 'What is the average rent in JBR?', answer: 'A 1-bedroom apartment averages AED 100K - 130K per year.' },
      { question: 'Is JBR good for families?', answer: 'Many families love the beach access, though traffic can be challenging during weekends.' },
      { question: 'What are the service charges in JBR?', answer: 'Service charges range from AED 15 to AED 25 per sqft.' }
    ]
  },
  {
    slug: 'dubai-silicon-oasis',
    name: 'Dubai Silicon Oasis',
    icon: 'fas fa-laptop',
    tagline: 'Tech hub',
    description: 'Dubai Silicon Oasis (DSO) is a technology park that doubles as an affordable residential community. It offers a mix of residential towers and villa compounds in a self-contained environment. The area is favored by students, tech professionals, and budget-conscious families.',
    propertyTypes: ['Apartments', 'Villas'],
    priceRange: { studio: 'AED 300K', oneBed: 'AED 450K', twoBed: 'AED 650K', threeBed: 'N/A' },
    rentalYield: '7-9%',
    nearbyLandmarks: ['DSO Tech Park', 'Silicon Central Mall'],
    transport: ['Bus routes (No metro)'],
    lifestyle: ['Tech community', 'Student & professional', 'Affordable'],
    bestFor: ['Tech professionals', 'Budget buyers', 'Yield investors'],
    considerations: ['Somewhat isolated location', 'No metro connectivity'],
    faqs: [
      { question: 'Is Dubai Silicon Oasis a good investment?', answer: 'Yes, it provides excellent rental yields of 7-9% with consistent demand.' },
      { question: 'What is the average rent in Dubai Silicon Oasis?', answer: 'Studios rent for around AED 35K, and 1-bedrooms for AED 50K - 60K.' },
      { question: 'Is Dubai Silicon Oasis good for families?', answer: 'It offers great schools and affordable spacious apartments suitable for families.' },
      { question: 'What are the service charges in Dubai Silicon Oasis?', answer: 'Service charges are relatively low, usually between AED 10 - AED 14 per sqft.' }
    ]
  },
  {
    slug: 'al-barsha',
    name: 'Al Barsha',
    icon: 'fas fa-shopping-bag',
    tagline: 'Central & connected',
    description: 'Al Barsha is a highly central and well-established neighborhood known for hosting the Mall of the Emirates. It features a mix of spacious standalone villas and mid-rise apartment buildings. Its central location provides unmatched connectivity to both Old and New Dubai.',
    propertyTypes: ['Apartments', 'Villas'],
    priceRange: { studio: 'N/A', oneBed: 'AED 700K', twoBed: 'AED 1.1M', threeBed: 'N/A', villa: 'AED 3M' },
    rentalYield: '5-7%',
    nearbyLandmarks: ['Mall of the Emirates', 'Ski Dubai', 'Al Barsha Pond Park'],
    transport: ['Mall of the Emirates Metro', 'Mashreq Metro Station'],
    lifestyle: ['Urban convenience', 'Retail & dining', 'Central location'],
    bestFor: ['Families', 'Well-connected location seekers', 'Professionals'],
    considerations: ['Mixed old and new developments', 'Traffic around mall areas'],
    faqs: [
      { question: 'Is Al Barsha a good investment?', answer: 'It is a stable investment with strong tenant demand due to its central location.' },
      { question: 'What is the average rent in Al Barsha?', answer: '1-bedroom apartments typically rent for AED 65K - 85K.' },
      { question: 'Is Al Barsha good for families?', answer: 'Yes, the large villas and proximity to top schools and parks make it very family-friendly.' },
      { question: 'What are the service charges in Al Barsha?', answer: 'For apartments, it is around AED 12-16 per sqft. Villas generally have lower fees.' }
    ]
  },
  {
    slug: 'dubai-sports-city',
    name: 'Dubai Sports City',
    icon: 'fas fa-futbol',
    tagline: 'Active lifestyle',
    description: 'Dubai Sports City is a unique community designed for sports enthusiasts. It houses world-class sporting venues, academies, and residential towers overlooking golf courses or stadiums. The area provides an active, affordable lifestyle on the outskirts of the main city.',
    propertyTypes: ['Apartments', 'Townhouses'],
    priceRange: { studio: 'AED 320K', oneBed: 'AED 480K', twoBed: 'AED 700K', threeBed: 'N/A' },
    rentalYield: '7-9%',
    nearbyLandmarks: ['ICC Academy', 'Dubai International Stadium', 'The Els Club'],
    transport: ['Bus access (No metro)'],
    lifestyle: ['Active & sporty', 'Golf course living', 'Affordable'],
    bestFor: ['Sports enthusiasts', 'Budget investors', 'First-time buyers'],
    considerations: ['Remote from central Dubai', 'Limited high-end dining and retail'],
    faqs: [
      { question: 'Is Dubai Sports City a good investment?', answer: 'It is excellent for investors seeking high rental yields on a budget.' },
      { question: 'What is the average rent in Dubai Sports City?', answer: 'Studios rent for around AED 40K, and 1-bedrooms for AED 55K - 65K.' },
      { question: 'Is Dubai Sports City good for families?', answer: 'Yes, it offers affordable townhouses, parks, and sports academies for kids.' },
      { question: 'What are the service charges in Dubai Sports City?', answer: 'Service charges are reasonable, typically AED 12 - AED 16 per sqft.' }
    ]
  }
];

export function generateStaticParams() {
  return DUBAI_AREAS.map((area) => ({
    slug: area.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = DUBAI_AREAS.find((a) => a.slug === slug);
  if (!area) return { title: 'Area Not Found | Dubai Property Guide' };

  return {
    title: `${area.name} Area Guide & Property Prices | HDE`,
    description: `Comprehensive guide to ${area.name}. Explore property prices, rental yields, amenities, and lifestyle for ${area.name}, Dubai.`,
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = DUBAI_AREAS.find((a) => a.slug === slug);

  if (!area) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: area.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yourwebsite.com' },
      { '@type': 'ListItem', position: 2, name: 'Dubai Property', item: 'https://yourwebsite.com/dubai-property' },
      { '@type': 'ListItem', position: 3, name: 'Areas', item: 'https://yourwebsite.com/dubai-property/areas' },
      { '@type': 'ListItem', position: 4, name: area.name, item: `https://yourwebsite.com/dubai-property/areas/${area.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero Section */}
      <div className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-gray-500 dark:text-zinc-400 mb-6 flex items-center space-x-2">
            <Link href="/" className="hover:text-primary dark:hover:text-primary">Home</Link>
            <span>&gt;</span>
            <Link href="/dubai-property" className="hover:text-primary dark:hover:text-primary">Dubai Property</Link>
            <span>&gt;</span>
            <span className="text-gray-900 dark:text-zinc-100">{area.name}</span>
          </nav>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-zinc-100 mb-4">
            <span className="mr-3 text-gray-400 dark:text-zinc-500"><i className={area.icon}></i></span>
            {area.name}
          </h1>
          <p className="text-xl text-gray-600 dark:text-zinc-400">{area.tagline}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        
        {/* Overview Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Overview</h2>
          <p className="text-lg text-gray-700 dark:text-zinc-300 leading-relaxed">{area.description}</p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase mb-2">Best For</h3>
              <div className="flex flex-wrap gap-2">
                {area.bestFor.map((item) => (
                  <span key={item} className="px-3 py-1 bg-primary/20 dark:bg-primary/40 text-primary dark:text-blue-200 rounded-full text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="ml-0 md:ml-8 mt-4 md:mt-0">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase mb-2">Property Types</h3>
              <div className="flex flex-wrap gap-2">
                {area.propertyTypes.map((item) => (
                  <span key={item} className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-full text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Price Guide Table */}
        <section className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Estimated Property Prices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 text-gray-500 font-semibold">Property Type</th>
                  <th className="py-3 px-4 text-gray-500 font-semibold">Starting Price</th>
                </tr>
              </thead>
              <tbody>
                {area.priceRange.studio !== 'N/A' && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Studio</td>
                    <td className="py-3 px-4 text-primary font-semibold">{area.priceRange.studio}</td>
                  </tr>
                )}
                {area.priceRange.oneBed !== 'N/A' && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">1 Bedroom</td>
                    <td className="py-3 px-4 text-primary font-semibold">{area.priceRange.oneBed}</td>
                  </tr>
                )}
                {area.priceRange.twoBed !== 'N/A' && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">2 Bedroom</td>
                    <td className="py-3 px-4 text-primary font-semibold">{area.priceRange.twoBed}</td>
                  </tr>
                )}
                {area.priceRange.threeBed && area.priceRange.threeBed !== 'N/A' && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">3 Bedroom</td>
                    <td className="py-3 px-4 text-primary font-semibold">{area.priceRange.threeBed}</td>
                  </tr>
                )}
                {area.priceRange.villa && area.priceRange.villa !== 'N/A' && (
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">Villas / Townhouses</td>
                    <td className="py-3 px-4 text-primary font-semibold">{area.priceRange.villa}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center bg-primary/5 p-4 rounded-xl mt-6">
            <div className="mb-4 sm:mb-0">
              <span className="block text-sm text-primary font-semibold">Estimated Rental Yield</span>
              <span className="text-2xl font-bold text-blue-900">{area.rentalYield}</span>
            </div>
            <Link 
              href="/dubai-property/calculator" 
              className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto text-center"
            >
              Calculate your buying costs &rarr;
            </Link>
          </div>
        </section>

        {/* Location & Lifestyle Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Location & Transport</h2>
            <ul className="space-y-3">
              {area.transport.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-gray-400 mr-2">🚆</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Nearby Landmarks:</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {area.nearbyLandmarks.map((landmark, idx) => (
                  <li key={idx}>{landmark}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Lifestyle</h2>
            <div className="grid grid-cols-2 gap-3">
              {area.lifestyle.map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Investment Considerations */}
        <section className="space-y-4 bg-orange-50 p-6 rounded-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Investment Considerations</h2>
          <ul className="space-y-3">
            {area.considerations.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-orange-500 mr-3 mt-1">⚠️</span>
                <span className="text-gray-800">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {area.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-Linking Section */}
        <section className="space-y-6 pt-8 border-t">
          <h2 className="text-2xl font-bold text-gray-900">Explore More Dubai Areas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {DUBAI_AREAS.filter(a => a.slug !== area.slug).map((otherArea) => (
              <Link 
                key={otherArea.slug} 
                href={`/dubai-property/areas/${otherArea.slug}`}
                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-2xl text-gray-400 dark:text-zinc-500"><i className={otherArea.icon}></i></span>
                <span className="text-sm font-medium text-gray-900">{otherArea.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs text-gray-500 text-center pt-12">
          Disclaimer: All prices and yields are estimates based on publicly available market data as of September 2026. Actual prices vary. Verify current pricing with a licensed real estate agent.
        </p>

      </div>
    </div>
  );
}
