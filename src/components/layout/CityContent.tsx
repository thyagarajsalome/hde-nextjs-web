// src/components/layout/CityContent.tsx
import React from "react";

export interface CityData {
  slug: string;
  cityName: string;
  stateName: string;
  country?: string;
  metaDesc: string;
  neighborhoods: string;
  soilType: string;
  basicRate: string;
  standardRate: string;
  premiumRate: string;
}

export const CITIES_DATA: Record<string, CityData> = {
  mumbai: {
    slug: 'mumbai',
    cityName: 'Mumbai',
    stateName: 'Maharashtra',
    metaDesc: 'Calculate house construction cost in Mumbai per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Mumbai.',
    neighborhoods: 'Andheri, Borivali, Thane, Navi Mumbai, Bandra, Powai',
    soilType: 'Clayey and hard basaltic rock. Requires pile foundations in coastal areas or deep footing excavation.',
    basicRate: 'Rs. 1,600 - 2,200/sqft',
    standardRate: 'Rs. 2,200 - 3,200/sqft',
    premiumRate: 'Rs. 3,200 - 4,500/sqft'
  },
  bengaluru: {
    slug: 'bengaluru',
    cityName: 'Bengaluru',
    stateName: 'Karnataka',
    metaDesc: 'Calculate house construction cost in Bengaluru per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Bengaluru.',
    neighborhoods: 'Whitefield, Indiranagar, Electronic City, HSR Layout, Yelahanka, JP Nagar',
    soilType: 'Red soil with good bearing capacity. Standard isolated footings are usually sufficient, saving foundation costs.',
    basicRate: 'Rs. 1,550 - 2,100/sqft',
    standardRate: 'Rs. 2,100 - 3,000/sqft',
    premiumRate: 'Rs. 3,000 - 4,200/sqft'
  },
  'delhi-ncr': {
    slug: 'delhi-ncr',
    cityName: 'Delhi NCR',
    stateName: 'Delhi NCR',
    metaDesc: 'Calculate house construction cost in Delhi NCR per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Delhi NCR.',
    neighborhoods: 'Gurugram, Noida, Dwarka, South Delhi, Ghaziabad, Faridabad',
    soilType: 'Alluvial sandy soil. Requires strong raft foundations or deep footings due to earthquake vulnerability (Zone IV).',
    basicRate: 'Rs. 1,500 - 2,000/sqft',
    standardRate: 'Rs. 2,000 - 2,900/sqft',
    premiumRate: 'Rs. 2,900 - 4,000/sqft'
  },
  chennai: {
    slug: 'chennai',
    cityName: 'Chennai',
    stateName: 'Tamil Nadu',
    metaDesc: 'Calculate house construction cost in Chennai per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Chennai.',
    neighborhoods: 'Adyar, OMR, Velachery, Anna Nagar, Tambaram, Porur',
    soilType: 'Clayey and sandy coastal soil. High water table requires solid plinth beams and waterproofing/treatment.',
    basicRate: 'Rs. 1,500 - 2,000/sqft',
    standardRate: 'Rs. 2,000 - 2,900/sqft',
    premiumRate: 'Rs. 2,900 - 4,000/sqft'
  },
  hyderabad: {
    slug: 'hyderabad',
    cityName: 'Hyderabad',
    stateName: 'Telangana',
    metaDesc: 'Calculate house construction cost in Hyderabad per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Hyderabad.',
    neighborhoods: 'Gachibowli, Kukatpally, Madhapur, Jubilee Hills, Secunderabad, Uppal',
    soilType: 'Hard granite rock. Excavation and site preparation cost might be higher, but foundation is highly stable.',
    basicRate: 'Rs. 1,500 - 2,000/sqft',
    standardRate: 'Rs. 2,000 - 2,950/sqft',
    premiumRate: 'Rs. 2,950 - 4,100/sqft'
  },
  pune: {
    slug: 'pune',
    cityName: 'Pune',
    stateName: 'Maharashtra',
    metaDesc: 'Calculate house construction cost in Pune per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Pune.',
    neighborhoods: 'Kothrud, Hinjewadi, Viman Nagar, Kharadi, Baner, Wakad',
    soilType: 'Deccan trap basaltic rock. High bearing capacity, saving on foundation depth and costs.',
    basicRate: 'Rs. 1,500 - 2,050/sqft',
    standardRate: 'Rs. 2,050 - 2,900/sqft',
    premiumRate: 'Rs. 2,900 - 4,000/sqft'
  },
  ahmedabad: {
    slug: 'ahmedabad',
    cityName: 'Ahmedabad',
    stateName: 'Gujarat',
    metaDesc: 'Calculate house construction cost in Ahmedabad per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Ahmedabad.',
    neighborhoods: 'SG Highway, Bopal, Gota, Satellite, Prahlad Nagar',
    soilType: 'Sandy loam and alluvial soil. Requires proper compaction and standard spread footings.',
    basicRate: 'Rs. 1,450 - 1,900/sqft',
    standardRate: 'Rs. 1,900 - 2,700/sqft',
    premiumRate: 'Rs. 2,700 - 3,800/sqft'
  },
  kolkata: {
    slug: 'kolkata',
    cityName: 'Kolkata',
    stateName: 'West Bengal',
    metaDesc: 'Calculate house construction cost in Kolkata per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Kolkata.',
    neighborhoods: 'New Town, Rajarhat, Salt Lake, Jadavpur, Behala',
    soilType: 'Alluvial and clayey soil with high water table. Pile foundations are strictly recommended.',
    basicRate: 'Rs. 1,500 - 2,050/sqft',
    standardRate: 'Rs. 2,050 - 2,900/sqft',
    premiumRate: 'Rs. 2,900 - 4,000/sqft'
  },
  jaipur: {
    slug: 'jaipur',
    cityName: 'Jaipur',
    stateName: 'Rajasthan',
    metaDesc: 'Calculate house construction cost in Jaipur per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Jaipur.',
    neighborhoods: 'Mansarovar, Vaishali Nagar, Malviya Nagar, Jagatpura',
    soilType: 'Sandy and arid soil. Excellent bearing capacity, standard isolated footings are sufficient.',
    basicRate: 'Rs. 1,400 - 1,850/sqft',
    standardRate: 'Rs. 1,850 - 2,600/sqft',
    premiumRate: 'Rs. 2,600 - 3,600/sqft'
  },
  lucknow: {
    slug: 'lucknow',
    cityName: 'Lucknow',
    stateName: 'Uttar Pradesh',
    metaDesc: 'Calculate house construction cost in Lucknow per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Lucknow.',
    neighborhoods: 'Gomti Nagar, Indira Nagar, Aliganj, Hazratganj',
    soilType: 'Indo-Gangetic alluvial soil. Moderate bearing capacity requiring standard spread or raft footings.',
    basicRate: 'Rs. 1,450 - 1,900/sqft',
    standardRate: 'Rs. 1,900 - 2,650/sqft',
    premiumRate: 'Rs. 2,650 - 3,700/sqft'
  },
  kochi: {
    slug: 'kochi',
    cityName: 'Kochi',
    stateName: 'Kerala',
    metaDesc: 'Calculate house construction cost in Kochi per sq ft. Check local standard & premium building rates, brick wall rates, plumbing and electrical charges in Kochi.',
    neighborhoods: 'Kakkanad, Edappally, Palarivattom, Marine Drive',
    soilType: 'Coastal marshy and clayey soil. Highly requires pile foundations due to low bearing capacity.',
    basicRate: 'Rs. 1,600 - 2,150/sqft',
    standardRate: 'Rs. 2,150 - 3,100/sqft',
    premiumRate: 'Rs. 3,100 - 4,300/sqft'
  }
};

interface CityContentProps {
  cityData: CityData;
}

export default function CityContent({ cityData }: CityContentProps) {
  const { cityName, stateName, metaDesc, neighborhoods, soilType, basicRate, standardRate, premiumRate } = cityData;

  return (
    <>
      {/* Localized SEO Banner/Heading Section */}
      <section className="bg-gradient-to-br from-secondary via-zinc-950 to-secondary text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-primary/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4 uppercase tracking-wider">
                Localized Building Cost Guide
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-100 tracking-tight">
                House Construction Cost in <span className="text-primary">{cityName}</span>, {stateName}
              </h1>
              <p className="mt-3 text-stone-300 max-w-3xl text-sm sm:text-base leading-relaxed">
                Estimate the complete residential construction cost including materials, finishes, MEP fitting, and designer fees in {cityName}. Try our dynamic builder-funnel calculators below.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-xl">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">⚡ Quick Stats for {cityName}</h3>
              <ul className="space-y-2.5 text-xs text-stone-300">
                <li className="flex justify-between border-b border-white/10 pb-1.5">
                  <span>Basic Rate:</span>
                  <span className="font-bold text-stone-200">{basicRate}</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-1.5">
                  <span>Standard Rate:</span>
                  <span className="font-bold text-stone-200">{standardRate}</span>
                </li>
                <li className="flex justify-between border-b border-white/10 pb-1.5">
                  <span>Premium Rate:</span>
                  <span className="font-bold text-stone-200">{premiumRate}</span>
                </li>
                <li className="flex justify-between">
                  <span>Soil Condition:</span>
                  <span className="font-bold text-primary">Localized</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Rich Statically Rendered Localized Content Section for search crawlers */}
      <section className="bg-stone-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="w-full max-w-4xl space-y-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              Understanding Building Costs in {cityName}
            </h2>
            
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Building a home in <strong>{cityName}</strong> requires navigating specific local market factors. Ready-mix concrete (RMC) availability, local sand excavation bans, and varying transport/logistics rules directly impact the raw materials pricing. Over the past 12 months, standard steel rates and premium grade 53 OPC cement prices have witnessed slight volatility, making accurate estimation critical before breaking ground.
            </p>

            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📍</span> Key Neighborhoods We Estimate:
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-4">
                Our cost calculators support projects in all prime sectors including {neighborhoods}. Whether you are constructing a high-rise duplex or a private luxury villa, local logistics charges are accounted for.
              </p>
              <div className="h-px bg-stone-100 my-4"></div>
              <h3 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🏗️</span> Substructure & Soil Report:
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {soilType} It is always recommended to perform a local soil testing survey to customize column steel sizing and depth.
              </p>
            </div>

            <h3 className="text-xl font-extrabold text-stone-950">Local Approvals & Construction Norms</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Before initiating building work in {cityName}, ensure you secure all necessary municipal approvals (like building plan sanctions, local water line connections, and electrical sub-meter clearances). These clearances usually require structural drawings prepared by registered local structural engineers to guarantee safety.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
