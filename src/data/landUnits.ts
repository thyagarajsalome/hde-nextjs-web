export interface LandUnit {
  id: string;
  name: string;
  plural: string;
  symbol: string;
  sqft: number; // 1 unit in sq ft
  region: string;
  description: string;
}

export const LAND_UNITS: Record<string, LandUnit> = {
  sqft: {
    id: 'sqft',
    name: 'Square Feet',
    plural: 'Square Feet',
    symbol: 'sq ft',
    sqft: 1,
    region: 'Standard / All India',
    description: 'Standard unit of residential and commercial area measurement across India and globally.'
  },
  gunta: {
    id: 'gunta',
    name: 'Gunta',
    plural: 'Guntas',
    symbol: 'gunta',
    sqft: 1089,
    region: 'Karnataka, Maharashtra, Telangana, Gujarat',
    description: '1 Gunta equals 1,089 sq ft (33 ft × 33 ft). Widely used for agricultural land and residential layouts.'
  },
  bigha: {
    id: 'bigha',
    name: 'Bigha',
    plural: 'Bighas',
    symbol: 'bigha',
    sqft: 27225,
    region: 'Uttar Pradesh, Bihar, MP, Punjab, Rajasthan',
    description: 'Standard Pucca Bigha equals 27,225 sq ft (approx 5/8 acre or 3,025 sq yards). Regional variations exist.'
  },
  cent: {
    id: 'cent',
    name: 'Cent',
    plural: 'Cents',
    symbol: 'cent',
    sqft: 435.6,
    region: 'Kerala, Tamil Nadu, Andhra Pradesh, Karnataka',
    description: '1 Cent is 1/100th of an acre (435.6 sq ft). The primary land unit for residential plots in South India.'
  },
  ground: {
    id: 'ground',
    name: 'Ground',
    plural: 'Grounds',
    symbol: 'ground',
    sqft: 2400,
    region: 'Tamil Nadu (Chennai)',
    description: '1 Ground equals 2,400 sq ft (approx 5.51 cents). The standard real estate benchmark in Chennai.'
  },
  ankanam: {
    id: 'ankanam',
    name: 'Ankanam',
    plural: 'Ankanams',
    symbol: 'ankanam',
    sqft: 72,
    region: 'Andhra Pradesh, Telangana, Parts of Karnataka',
    description: '1 Ankanam equals 72 sq ft (approx 8 sq yards). Widely used in Nellore, Tirupati, and Rayalaseema.'
  },
  gaj: {
    id: 'gaj',
    name: 'Gaj (Square Yard)',
    plural: 'Gaj',
    symbol: 'sq yd / gaj',
    sqft: 9,
    region: 'Delhi NCR, Haryana, Punjab, Uttar Pradesh',
    description: '1 Gaj equals 1 Square Yard (9 sq ft). Standard unit for buying residential plots in North India.'
  },
  marla: {
    id: 'marla',
    name: 'Marla',
    plural: 'Marlas',
    symbol: 'marla',
    sqft: 272.25,
    region: 'Punjab, Haryana, Himachal Pradesh, J&K',
    description: '1 Marla equals 272.25 sq ft (approx 30.25 sq yards). 20 Marlas make 1 Kanal.'
  },
  kanal: {
    id: 'kanal',
    name: 'Kanal',
    plural: 'Kanals',
    symbol: 'kanal',
    sqft: 5445,
    region: 'Punjab, Haryana, Himachal Pradesh',
    description: '1 Kanal equals 20 Marlas or 5,445 sq ft (approx 1/8 acre).'
  },
  biswa: {
    id: 'biswa',
    name: 'Biswa',
    plural: 'Biswas',
    symbol: 'biswa',
    sqft: 1361.25,
    region: 'Uttar Pradesh, Haryana, Punjab, HP',
    description: '1 Biswa equals 1/20th of a Bigha (1,361.25 sq ft or 151.25 sq yards).'
  },
  acre: {
    id: 'acre',
    name: 'Acre',
    plural: 'Acres',
    symbol: 'ac',
    sqft: 43560,
    region: 'Universal / All India',
    description: '1 Acre equals 43,560 sq ft (40 Guntas, 100 Cents, or 4,840 sq yards).'
  },
  hectare: {
    id: 'hectare',
    name: 'Hectare',
    plural: 'Hectares',
    symbol: 'ha',
    sqft: 107639.1,
    region: 'Universal / All India (Revenue Records)',
    description: '1 Hectare equals 10,000 sq meters or approx 2.471 Acres (107,639 sq ft).'
  },
  sqm: {
    id: 'sqm',
    name: 'Square Meter',
    plural: 'Square Meters',
    symbol: 'sq m',
    sqft: 10.7639,
    region: 'Standard Metric',
    description: '1 Square Meter equals 10.764 sq ft. Standard metric unit for municipal plan sanction drawings.'
  }
};

export interface ConversionPair {
  slug: string;
  fromUnit: string;
  toUnit: string;
  title: string;
  shortDesc: string;
  searchVolumeEstimated: string;
}

export const TOP_CONVERSION_PAIRS: ConversionPair[] = [
  {
    slug: 'gunta-to-sqft',
    fromUnit: 'gunta',
    toUnit: 'sqft',
    title: 'Gunta to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Gunta to Sq Ft instantly. 1 Gunta = 1,089 Sq Ft in Karnataka, Maharashtra & Telangana.',
    searchVolumeEstimated: '165,000/mo'
  },
  {
    slug: 'bigha-to-sqft',
    fromUnit: 'bigha',
    toUnit: 'sqft',
    title: 'Bigha to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Bigha to Sq Ft with official state-wise land measurement ratios for UP, Bihar, and Rajasthan.',
    searchVolumeEstimated: '201,000/mo'
  },
  {
    slug: 'cent-to-sqft',
    fromUnit: 'cent',
    toUnit: 'sqft',
    title: 'Cent to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Cent to Sq Ft online. 1 Cent = 435.6 Sq Ft in Kerala, Tamil Nadu, and Andhra Pradesh.',
    searchVolumeEstimated: '135,000/mo'
  },
  {
    slug: 'ground-to-sqft',
    fromUnit: 'ground',
    toUnit: 'sqft',
    title: 'Ground to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Ground to Sq Ft for Chennai & Tamil Nadu real estate plots. 1 Ground = 2,400 Sq Ft.',
    searchVolumeEstimated: '49,500/mo'
  },
  {
    slug: 'ankanam-to-sqft',
    fromUnit: 'ankanam',
    toUnit: 'sqft',
    title: 'Ankanam to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Ankanam to Sq Ft for Andhra Pradesh & Telangana. 1 Ankanam = 72 Sq Ft.',
    searchVolumeEstimated: '22,000/mo'
  },
  {
    slug: 'gaj-to-sqft',
    fromUnit: 'gaj',
    toUnit: 'sqft',
    title: 'Gaj to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Gaj to Sq Ft. 1 Gaj (Square Yard) = 9 Sq Ft in Delhi NCR, Punjab, and Haryana.',
    searchVolumeEstimated: '90,000/mo'
  },
  {
    slug: 'marla-to-sqft',
    fromUnit: 'marla',
    toUnit: 'sqft',
    title: 'Marla to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Marla to Sq Ft. 1 Marla = 272.25 Sq Ft in Punjab, Haryana, and Himachal.',
    searchVolumeEstimated: '40,000/mo'
  },
  {
    slug: 'kanal-to-sqft',
    fromUnit: 'kanal',
    toUnit: 'sqft',
    title: 'Kanal to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Kanal to Sq Ft. 1 Kanal = 20 Marlas = 5,445 Sq Ft.',
    searchVolumeEstimated: '35,000/mo'
  },
  {
    slug: 'acre-to-sqft',
    fromUnit: 'acre',
    toUnit: 'sqft',
    title: 'Acre to Square Feet (Sq Ft) Converter',
    shortDesc: 'Convert Acre to Sq Ft. 1 Acre = 43,560 Sq Ft (100 Cents or 40 Guntas).',
    searchVolumeEstimated: '110,000/mo'
  },
  {
    slug: 'hectare-to-acre',
    fromUnit: 'hectare',
    toUnit: 'acre',
    title: 'Hectare to Acre Converter',
    shortDesc: 'Convert Hectare to Acre. 1 Hectare = 2.471 Acres for official land revenue records.',
    searchVolumeEstimated: '75,000/mo'
  },
  {
    slug: 'sqft-to-sqyd',
    fromUnit: 'sqft',
    toUnit: 'gaj',
    title: 'Square Feet to Square Yard (Gaj) Converter',
    shortDesc: 'Convert Sq Ft to Square Yards / Gaj. 9 Sq Ft = 1 Square Yard.',
    searchVolumeEstimated: '75,000/mo'
  },
  {
    slug: 'sqft-to-cent',
    fromUnit: 'sqft',
    toUnit: 'cent',
    title: 'Square Feet to Cent Converter',
    shortDesc: 'Convert Sq Ft to Cents for South India property plot measurements.',
    searchVolumeEstimated: '60,000/mo'
  },
  {
    slug: 'sqft-to-gunta',
    fromUnit: 'sqft',
    toUnit: 'gunta',
    title: 'Square Feet to Gunta Converter',
    shortDesc: 'Convert Sq Ft to Gunta for Bangalore, Hyderabad, and Pune real estate plots.',
    searchVolumeEstimated: '80,000/mo'
  },
  {
    slug: 'sqft-to-bigha',
    fromUnit: 'sqft',
    toUnit: 'bigha',
    title: 'Square Feet to Bigha Converter',
    shortDesc: 'Convert Sq Ft to Bigha for North India agricultural and farm land records.',
    searchVolumeEstimated: '90,000/mo'
  }
];

export function convertUnits(value: number, fromUnitKey: string, toUnitKey: string): number {
  const from = LAND_UNITS[fromUnitKey];
  const to = LAND_UNITS[toUnitKey];
  if (!from || !to || isNaN(value)) return 0;
  
  // Convert to sqft first, then to target unit
  const inSqft = value * from.sqft;
  return inSqft / to.sqft;
}
