export interface HousePlanSEOData {
  slug: string;
  title: string;
  shortTitle: string;
  metaTitle: string;
  metaDesc: string;
  dimensions: string;
  plotAreaSqft: number;
  plotAreaSqYds: number;
  builtUpAreaSqft: number;
  bhkConfig: string;
  idealFacing: string;
  floorsRecommendation: string;
  estimatedCostMinLakhs: number;
  estimatedCostMaxLakhs: number;
  overview: string;
  roomDimensions: { room: string; size: string; vastuDirection: string }[];
  vastuGuidelines: { rule: string; explanation: string }[];
  setbackRules: { side: string; requirement: string }[];
  faqs: { question: string; answer: string }[];
  category: 'dimension' | 'facing' | 'bhk' | 'budget';
}

export const HOUSE_PLAN_SEO_DATA: Record<string, HousePlanSEOData> = {
  '30x40-house-plans': {
    slug: '30x40-house-plans',
    title: '30x40 House Plans (1200 Sq Ft) - 2 & 3 BHK Vastu Floor Designs',
    shortTitle: '30x40 House Plans',
    metaTitle: '30x40 House Plans (1200 Sq Ft) - 2 & 3 BHK Vastu Floor Designs | HDE',
    metaDesc: 'Explore best 30x40 house plans (1200 sqft) for East, North & West facing plots. 2 BHK, 3 BHK duplex floor plans with car parking, Vastu tips, and construction cost estimates.',
    dimensions: '30 ft x 40 ft',
    plotAreaSqft: 1200,
    plotAreaSqYds: 133.33,
    builtUpAreaSqft: 1450,
    bhkConfig: '2 BHK / 3 BHK Duplex',
    idealFacing: 'East or North',
    floorsRecommendation: 'G+1 Duplex or Ground Floor with Rental Upper Unit',
    estimatedCostMinLakhs: 22.8,
    estimatedCostMaxLakhs: 36.0,
    category: 'dimension',
    overview: 'A 30x40 site (1,200 sq ft / 133.33 sq yards) is the most popular residential plot size across India, widely sanctioned by BDA, DTCP, CMDA, and municipal corporations. It offers the ideal balance for a spacious 2 BHK on a single floor, or a luxurious 3 BHK / 4 BHK duplex with dedicated car parking, double-height living hall, and private terrace.',
    roomDimensions: [
      { room: 'Living / Dining Hall', size: '16 ft x 14 ft', vastuDirection: 'North-East or North' },
      { room: 'Master Bedroom', size: '12 ft x 14 ft', vastuDirection: 'South-West (Nairuthi)' },
      { room: 'Children / Guest Bedroom', size: '11 ft x 12 ft', vastuDirection: 'North-West (Vayavya)' },
      { room: 'Modular Kitchen', size: '10 ft x 9 ft', vastuDirection: 'South-East (Agneya)' },
      { room: 'Pooja Room', size: '5 ft x 6 ft', vastuDirection: 'North-East (Ishanya)' },
      { room: 'Car Parking Portico', size: '10 ft x 15 ft', vastuDirection: 'North or North-West' },
      { room: 'Attached / Common Toilets', size: '7 ft x 4.5 ft', vastuDirection: 'West or South' },
    ],
    vastuGuidelines: [
      { rule: 'Main Entrance', explanation: 'Position in 3rd or 4th pada of East, or 3rd/4th/5th pada of North for positive energy and wealth.' },
      { rule: 'Kitchen in Agneya (SE)', explanation: 'Place the cooking stove facing East. Avoid placing the kitchen in North-East or South-West.' },
      { rule: 'Master Bedroom in Nairuthi (SW)', explanation: 'Ensures stability, leadership, and sound sleep for the head of the family. Bed should face South or East.' },
      { rule: 'Pooja Room in Ishanya (NE)', explanation: 'The sacred North-East corner receives maximum morning sun rays and maintains positive spiritual vibrations.' },
      { rule: 'Staircase Location', explanation: 'External or internal stairs should be in South, West, or South-West, turning clockwise (pradakshina).' }
    ],
    setbackRules: [
      { side: 'Front Setback', requirement: 'Minimum 5 ft to 7 ft for car porch and ventilation' },
      { side: 'Rear Setback', requirement: 'Minimum 3 ft for cross ventilation and utility pipes' },
      { side: 'Side Setbacks (Left/Right)', requirement: 'Minimum 2.5 ft to 3 ft for rainwater drainage and natural light' }
    ],
    faqs: [
      {
        question: 'What is the construction cost for a 30x40 house in India?',
        answer: 'For a 1,200 sq ft ground floor, standard construction costs range from ₹22.8 Lakhs (basic at ₹1,900/sqft) to ₹36 Lakhs (premium at ₹3,000/sqft). For a G+1 duplex (approx 2,000 sq ft built-up), the cost ranges between ₹38 Lakhs and ₹55 Lakhs.'
      },
      {
        question: 'Can I build a 3 BHK on a 30x40 plot?',
        answer: 'Yes! While a 2 BHK fits comfortably on a single ground floor with parking, a 3 BHK is best achieved as a G+1 duplex (Living, kitchen, pooja, 1 bedroom on ground floor, and 2 bedrooms with family hall on first floor).'
      },
      {
        question: 'What is the best facing for a 30x40 house?',
        answer: 'East and North facings are considered the most auspicious according to Vastu Shastra. However, West and South facing 30x40 houses can also be 100% Vastu compliant with correct room zoning.'
      }
    ]
  },
  '20x30-house-plans': {
    slug: '20x30-house-plans',
    title: '20x30 House Plans (600 Sq Ft) - 1 & 2 BHK Small House Designs',
    shortTitle: '20x30 House Plans',
    metaTitle: '20x30 House Plans (600 Sq Ft) - 1 & 2 BHK Small House Designs | HDE',
    metaDesc: 'Best 20x30 house plans (600 sqft) for small plots. Modern 1 BHK & 2 BHK floor plans, duplex designs with Vastu, space-saving layouts, and low-cost building estimates.',
    dimensions: '20 ft x 30 ft',
    plotAreaSqft: 600,
    plotAreaSqYds: 66.67,
    builtUpAreaSqft: 750,
    bhkConfig: '1 BHK / 2 BHK Duplex',
    idealFacing: 'East or North',
    floorsRecommendation: 'G+1 Duplex or Ground Floor 1 BHK with Bike Parking',
    estimatedCostMinLakhs: 11.5,
    estimatedCostMaxLakhs: 18.0,
    category: 'dimension',
    overview: 'A 20x30 plot (600 sq ft / 66.67 sq yards) is an affordable urban site size ideal for nuclear families, first-time home builders, or rental investments. With smart architectural planning, a 20x30 site can accommodate a cozy 1 BHK on ground floor, or an efficient 2 BHK duplex spanning ground and first floor with open-concept living.',
    roomDimensions: [
      { room: 'Living Room', size: '10 ft x 12 ft', vastuDirection: 'North-East' },
      { room: 'Master Bedroom', size: '10 ft x 11 ft', vastuDirection: 'South-West' },
      { room: 'Compact Kitchen', size: '7 ft x 8 ft', vastuDirection: 'South-East' },
      { room: 'Pooja Unit', size: '3 ft x 4 ft (Wall-niche)', vastuDirection: 'North-East' },
      { room: 'Two-Wheeler Parking', size: '7 ft x 10 ft', vastuDirection: 'North-West' },
      { room: 'Bathroom / Toilet', size: '6 ft x 4 ft', vastuDirection: 'West' }
    ],
    vastuGuidelines: [
      { rule: 'Open Living & Kitchen', explanation: 'Keep partitions minimal to let natural light flow from North-East to the center of the house.' },
      { rule: 'Bedroom in SW', explanation: 'Even in small 600 sqft footprints, keeping the master bedroom in the South-West ensures energy balance.' },
      { rule: 'External Staircase for Rental', explanation: 'If planning a 1st floor rental unit, an external staircase in the South or West keeps privacy intact.' }
    ],
    setbackRules: [
      { side: 'Front Setback', requirement: 'Minimum 3 ft to 4 ft' },
      { side: 'Rear Setback', requirement: 'Minimum 2 ft for ventilation shafts / duct' },
      { side: 'Side Setbacks', requirement: 'Zero setback on one side often permitted for plots under 50 sq meters with ventilation cutouts' }
    ],
    faqs: [
      {
        question: 'How much does it cost to build a 20x30 house in India?',
        answer: 'Ground floor construction of a 20x30 house typically costs between ₹11.5 Lakhs and ₹18 Lakhs. A G+1 duplex (approx 1,100 sq ft total) costs approximately ₹21 Lakhs to ₹30 Lakhs.'
      },
      {
        question: 'Can you fit car parking in a 20x30 house?',
        answer: 'Fitting a four-wheeler car parking on a 20 ft width plot leaves only 10 ft for living space on the ground floor. It is usually recommended to build stilt parking on ground floor and living quarters on 1st and 2nd floors.'
      }
    ]
  },
  '30x50-house-plans': {
    slug: '30x50-house-plans',
    title: '30x50 House Plans (1500 Sq Ft) - 3 & 4 BHK Luxury Duplex Designs',
    shortTitle: '30x50 House Plans',
    metaTitle: '30x50 House Plans (1500 Sq Ft) - 3 & 4 BHK Duplex Layouts | HDE',
    metaDesc: 'Discover modern 30x50 house plans (1500 sq ft) for East, North, and West facing sites. 3 BHK & 4 BHK luxury duplex layouts, car parking, Vastu tips, and cost breakdowns.',
    dimensions: '30 ft x 50 ft',
    plotAreaSqft: 1500,
    plotAreaSqYds: 166.67,
    builtUpAreaSqft: 2200,
    bhkConfig: '3 BHK / 4 BHK Duplex',
    idealFacing: 'East, North, or West',
    floorsRecommendation: 'G+1 or G+2 Duplex Villa',
    estimatedCostMinLakhs: 32.0,
    estimatedCostMaxLakhs: 55.0,
    category: 'dimension',
    overview: 'A 30x50 plot (1,500 sq ft / 166.67 sq yards) gives ample depth for luxurious, spacious layouts. It easily accommodates covered SUV car parking, an expansive double-height living room, 3 to 4 large master bedrooms with walk-in closets, a dedicated home office or puja room, and a landscaped backyard garden.',
    roomDimensions: [
      { room: 'Foyer & Living Room', size: '18 ft x 15 ft', vastuDirection: 'North-East' },
      { room: 'Dining Area', size: '12 ft x 14 ft', vastuDirection: 'East or Center' },
      { room: 'Master Bedroom 1 (Ground)', size: '13 ft x 15 ft', vastuDirection: 'South-West' },
      { room: 'Master Bedroom 2 (First Floor)', size: '14 ft x 16 ft', vastuDirection: 'South-West' },
      { room: 'Spacious Kitchen & Store', size: '11 ft x 12 ft', vastuDirection: 'South-East' },
      { room: 'Dedicated Pooja Room', size: '6 ft x 8 ft', vastuDirection: 'North-East' },
      { room: 'Covered Car Porch (SUV)', size: '12 ft x 18 ft', vastuDirection: 'North-West' }
    ],
    vastuGuidelines: [
      { rule: 'Brahmasthan (Center)', explanation: 'With a 50 ft depth, keep the central zone unobstructed for free positive energy flow.' },
      { rule: 'Water Sump in North-East', explanation: 'Underground water storage sump should strictly be in the North-East quadrant.' },
      { rule: 'Septic Tank in North-West', explanation: 'Position waste drainage and septic tanks in North-West (Vayavya) away from foundations.' }
    ],
    setbackRules: [
      { side: 'Front Setback', requirement: 'Minimum 6 ft to 8 ft' },
      { side: 'Rear Setback', requirement: 'Minimum 4 ft for garden / utility' },
      { side: 'Side Setbacks', requirement: '3 ft on both sides for 360-degree walking space' }
    ],
    faqs: [
      {
        question: 'What is the cost of building a 30x50 duplex house?',
        answer: 'A standard 30x50 G+1 duplex with around 2,200 sq ft built-up area costs between ₹42 Lakhs and ₹65 Lakhs depending on the quality of tiles, woodwork, and exterior facade.'
      }
    ]
  },
  '40x60-house-plans': {
    slug: '40x60-house-plans',
    title: '40x60 House Plans (2400 Sq Ft) - Luxury Villa & Bungalow Designs',
    shortTitle: '40x60 House Plans',
    metaTitle: '40x60 House Plans (2400 Sq Ft) - 4 & 5 BHK Villa Designs | HDE',
    metaDesc: 'Explore premium 40x60 house plans (2400 sq ft). Modern 4 BHK & 5 BHK luxury villa floor plans, double car parking, home theater, swimming pool, and Vastu layouts.',
    dimensions: '40 ft x 60 ft',
    plotAreaSqft: 2400,
    plotAreaSqYds: 266.67,
    builtUpAreaSqft: 3600,
    bhkConfig: '4 BHK / 5 BHK Luxury Villa',
    idealFacing: 'All Facings with Vastu',
    floorsRecommendation: 'G+1 or G+2 Modern Bungalow',
    estimatedCostMinLakhs: 55.0,
    estimatedCostMaxLakhs: 110.0,
    category: 'dimension',
    overview: 'A 40x60 site (2,400 sq ft / 266.67 sq yards) is the gold standard for premium independent homes and luxury villas in India. With 40 feet of wide frontage, you can design twin car parking, a grand entrance porch, sprawling lawn gardens, a private home theater, gym, and 4 to 5 master bedrooms with en-suite bathrooms.',
    roomDimensions: [
      { room: 'Grand Living Hall', size: '20 ft x 18 ft', vastuDirection: 'North-East' },
      { room: 'Formal Dining', size: '14 ft x 16 ft', vastuDirection: 'East' },
      { room: 'Island Kitchen & Pantry', size: '14 ft x 14 ft', vastuDirection: 'South-East' },
      { room: 'Master Suite with Walk-in', size: '16 ft x 18 ft', vastuDirection: 'South-West' },
      { room: 'Home Theater / Lounge', size: '15 ft x 18 ft', vastuDirection: 'First Floor West' },
      { room: 'Twin Car Garage', size: '18 ft x 18 ft', vastuDirection: 'North-West' }
    ],
    vastuGuidelines: [
      { rule: 'Grand Main Door in East/North', explanation: 'Use seasoned teakwood double-doors with auspicious brass fittings.' },
      { rule: 'Lush Garden in North-East', explanation: 'Keep the NE corner low with light landscaping and water fountains.' }
    ],
    setbackRules: [
      { side: 'Front Setback', requirement: '10 ft minimum for grand entry' },
      { side: 'Rear Setback', requirement: '5 ft for private garden / deck' },
      { side: 'Side Setbacks', requirement: '4 ft on both sides' }
    ],
    faqs: [
      {
        question: 'How much does a 40x60 villa cost to build in India?',
        answer: 'A luxury 40x60 G+1 villa with 3,500 sq ft built-up area costs between ₹70 Lakhs to ₹1.2 Crore including premium Italian marble, modular woodwork, and landscape lighting.'
      }
    ]
  },
  '20x40-house-plans': {
    slug: '20x40-house-plans',
    title: '20x40 House Plans (800 Sq Ft) - 2 & 3 BHK Compact Modern Layouts',
    shortTitle: '20x40 House Plans',
    metaTitle: '20x40 House Plans (800 Sq Ft) - 2 & 3 BHK Modern Layouts | HDE',
    metaDesc: 'Check out 20x40 house plans (800 sq ft) for narrow urban plots. Smart 2 BHK single floor & 3 BHK duplex floor plans with car parking and Vastu compliance.',
    dimensions: '20 ft x 40 ft',
    plotAreaSqft: 800,
    plotAreaSqYds: 88.89,
    builtUpAreaSqft: 1100,
    bhkConfig: '2 BHK / 3 BHK Duplex',
    idealFacing: 'East or North',
    floorsRecommendation: 'G+1 Duplex',
    estimatedCostMinLakhs: 16.0,
    estimatedCostMaxLakhs: 26.0,
    category: 'dimension',
    overview: 'A 20x40 plot (800 sq ft / 88.89 sq yards) is a very popular linear plot dimension in residential layouts. Because of the 1:2 aspect ratio, smart interior zoning and light wells (cutouts) are used to ensure every bedroom and bathroom receives ample natural cross-ventilation.',
    roomDimensions: [
      { room: 'Living & Dining', size: '11 ft x 18 ft', vastuDirection: 'North-East' },
      { room: 'Kitchen', size: '8 ft x 9 ft', vastuDirection: 'South-East' },
      { room: 'Master Bedroom', size: '11 ft x 13 ft', vastuDirection: 'South-West' },
      { room: 'Second Bedroom', size: '10 ft x 11 ft', vastuDirection: 'North-West' },
      { room: 'Car Parking Porch', size: '9 ft x 14 ft', vastuDirection: 'North' }
    ],
    vastuGuidelines: [
      { rule: 'Linear Air Flow', explanation: 'Install an open shaft (OTB) in the center or dining area to bring light into deep rooms.' }
    ],
    setbackRules: [
      { side: 'Front Setback', requirement: '4 ft' },
      { side: 'Rear Setback', requirement: '3 ft' },
      { side: 'Side Setbacks', requirement: '2 ft or zero on one wall' }
    ],
    faqs: [
      {
        question: 'What is the construction cost for 20x40 house?',
        answer: 'Constructing a ground floor 20x40 house costs approximately ₹16 to ₹22 Lakhs. A duplex model costs around ₹28 to ₹36 Lakhs.'
      }
    ]
  },
  '20x50-house-plans': {
    slug: '20x50-house-plans',
    title: '20x50 House Plans (1000 Sq Ft) - 2 & 3 BHK Linear House Designs',
    shortTitle: '20x50 House Plans',
    metaTitle: '20x50 House Plans (1000 Sq Ft) - 2 & 3 BHK Linear House Designs | HDE',
    metaDesc: 'Explore 20x50 house plans (1000 sq ft). Best narrow plot architectural designs, 2 BHK single floor and 3 BHK duplex layouts with car parking & Vastu guidelines.',
    dimensions: '20 ft x 50 ft',
    plotAreaSqft: 1000,
    plotAreaSqYds: 111.11,
    builtUpAreaSqft: 1400,
    bhkConfig: '2 BHK / 3 BHK Duplex',
    idealFacing: 'East or North',
    floorsRecommendation: 'G+1 Duplex with Skylight / Courtyard',
    estimatedCostMinLakhs: 20.0,
    estimatedCostMaxLakhs: 32.0,
    category: 'dimension',
    overview: 'A 20x50 plot (1,000 sq ft / 111.11 sq yards) allows you to build an elongated, modern townhouse-style home. The generous 50 ft depth allows for a private internal courtyard, dedicated car garage, separate dining space, and 3 bedrooms.',
    roomDimensions: [
      { room: 'Car Parking', size: '10 ft x 16 ft', vastuDirection: 'North-West' },
      { room: 'Living Hall', size: '12 ft x 14 ft', vastuDirection: 'North-East' },
      { room: 'Internal Courtyard / Cutout', size: '6 ft x 6 ft', vastuDirection: 'Center' },
      { room: 'Kitchen & Dining', size: '10 ft x 13 ft', vastuDirection: 'South-East' },
      { room: 'Master Bedroom', size: '12 ft x 13 ft', vastuDirection: 'South-West' }
    ],
    vastuGuidelines: [
      { rule: 'Central Light Courtyard', explanation: 'Provides continuous fresh air and natural sunlight right to the core of long 50ft plots.' }
    ],
    setbackRules: [
      { side: 'Front Setback', requirement: '5 ft' },
      { side: 'Rear Setback', requirement: '3 ft' }
    ],
    faqs: [
      {
        question: 'Can you fit car parking in 20x50 house plan?',
        answer: 'Yes, easily. 10 ft width of the front 20 ft is allocated for car parking and the remaining 10 ft serves as the foyer and main entry.'
      }
    ]
  },
  '25x40-house-plans': {
    slug: '25x40-house-plans',
    title: '25x40 House Plans (1000 Sq Ft) - 2 & 3 BHK Vastu Floor Plans',
    shortTitle: '25x40 House Plans',
    metaTitle: '25x40 House Plans (1000 Sq Ft) - 2 & 3 BHK Vastu Floor Plans | HDE',
    metaDesc: 'Discover 25x40 house plans (1000 sq ft). Popular 2 BHK & 3 BHK duplex home plans with car parking, East/North facing Vastu rules, and estimated building budget.',
    dimensions: '25 ft x 40 ft',
    plotAreaSqft: 1000,
    plotAreaSqYds: 111.11,
    builtUpAreaSqft: 1350,
    bhkConfig: '2 BHK / 3 BHK Duplex',
    idealFacing: 'East or North',
    floorsRecommendation: 'G+1 Duplex',
    estimatedCostMinLakhs: 19.5,
    estimatedCostMaxLakhs: 31.0,
    category: 'dimension',
    overview: 'A 25x40 site (1,000 sq ft / 111.11 sq yards) provides the perfect proportions for an Indian home. The 25 ft frontage comfortably accommodates a sedan car porch and a welcoming entrance veranda without cramping the living room.',
    roomDimensions: [
      { room: 'Living Room', size: '13 ft x 14 ft', vastuDirection: 'North-East' },
      { room: 'Kitchen & Dining', size: '10 ft x 12 ft', vastuDirection: 'South-East' },
      { room: 'Master Bedroom', size: '11 ft x 13 ft', vastuDirection: 'South-West' },
      { room: 'Guest Bedroom', size: '10 ft x 11 ft', vastuDirection: 'North-West' },
      { room: 'Car Parking', size: '10 ft x 15 ft', vastuDirection: 'North' }
    ],
    vastuGuidelines: [
      { rule: 'Kitchen in SE', explanation: 'Cooking platform towards East with cross-ventilation window.' }
    ],
    setbackRules: [
      { side: 'Front Setback', requirement: '5 ft' },
      { side: 'Rear Setback', requirement: '3 ft' }
    ],
    faqs: [
      {
        question: 'What is the cost of 25x40 house construction in India?',
        answer: 'Constructing a 1,000 sqft ground floor on a 25x40 plot costs around ₹19.5 Lakhs to ₹30 Lakhs depending on finish materials.'
      }
    ]
  },
  '30x60-house-plans': {
    slug: '30x60-house-plans',
    title: '30x60 House Plans (1800 Sq Ft) - 3 & 4 BHK Duplex & Rental Plans',
    shortTitle: '30x60 House Plans',
    metaTitle: '30x60 House Plans (1800 Sq Ft) - 3 & 4 BHK Duplex & Rental Plans | HDE',
    metaDesc: 'Explore 30x60 house plans (1800 sq ft). Premium 3 BHK & 4 BHK duplex floor plans with dual car parking, servant quarters, rental options, and Vastu compliance.',
    dimensions: '30 ft x 60 ft',
    plotAreaSqft: 1800,
    plotAreaSqYds: 200.0,
    builtUpAreaSqft: 2700,
    bhkConfig: '3 BHK / 4 BHK Duplex / Rental Units',
    idealFacing: 'East or North',
    floorsRecommendation: 'G+1 or G+2 with Rental Unit',
    estimatedCostMinLakhs: 38.0,
    estimatedCostMaxLakhs: 65.0,
    category: 'dimension',
    overview: 'A 30x60 plot (1,800 sq ft / 200 sq yards) is a dream site for homeowners who want both a lavish family home and recurring monthly rental income. The 60 ft depth allows you to build a ground floor 2 BHK for family and 2 independent 1 BHK rental units on the upper floor with separate external staircases.',
    roomDimensions: [
      { room: 'Formal Living', size: '16 ft x 16 ft', vastuDirection: 'North-East' },
      { room: 'Dining Room', size: '12 ft x 14 ft', vastuDirection: 'East' },
      { room: 'Master Suite', size: '14 ft x 16 ft', vastuDirection: 'South-West' },
      { room: 'Children Bedroom', size: '12 ft x 13 ft', vastuDirection: 'North-West' },
      { room: 'Kitchen & Utility', size: '11 ft x 13 ft', vastuDirection: 'South-East' },
      { room: 'Dual Car Parking', size: '14 ft x 18 ft', vastuDirection: 'North-West' }
    ],
    vastuGuidelines: [
      { rule: 'Balconies in North and East', explanation: 'Maximizes cool breezes and morning sun into the upper floor bedrooms.' }
    ],
    setbackRules: [
      { side: 'Front Setback', requirement: '8 ft' },
      { side: 'Rear Setback', requirement: '4 ft' },
      { side: 'Side Setbacks', requirement: '3 ft on both sides' }
    ],
    faqs: [
      {
        question: 'How much does it cost to build a 30x60 house in India?',
        answer: 'Constructing a full G+1 duplex (approx 2,700 sq ft) on a 30x60 site costs between ₹50 Lakhs to ₹75 Lakhs.'
      }
    ]
  },
  'east-facing-house-plans': {
    slug: 'east-facing-house-plans',
    title: 'East Facing House Plans As Per Vastu - 100% Auspicious Layouts',
    shortTitle: 'East Facing House Plans',
    metaTitle: 'East Facing House Plans As Per Vastu - 100% Auspicious Layouts | HDE',
    metaDesc: 'Discover 100% Vastu-compliant East facing house plans for 30x40, 20x30, 30x50, and 40x60 plots. 2 & 3 BHK layouts with auspicious door positions and room placements.',
    dimensions: 'Variable (30x40, 20x30, 30x50)',
    plotAreaSqft: 1200,
    plotAreaSqYds: 133.33,
    builtUpAreaSqft: 1500,
    bhkConfig: '2 BHK / 3 BHK / 4 BHK',
    idealFacing: 'East (Surya Bhagwan)',
    floorsRecommendation: 'Any',
    estimatedCostMinLakhs: 22.0,
    estimatedCostMaxLakhs: 45.0,
    category: 'facing',
    overview: 'East-facing house plans are considered among the most auspicious in Vedic Vastu Shastra because the entrance welcomes the morning sun rays ruled by Surya (Sun) and Lord Indra. An East entrance brings prosperity, good health, and positive energy to all family members.',
    roomDimensions: [
      { room: 'Main Entrance Door', size: 'In 3rd, 4th, or 5th Pada', vastuDirection: 'East' },
      { room: 'Pooja Room', size: '6 ft x 7 ft', vastuDirection: 'North-East (Ishanya)' },
      { room: 'Living Hall', size: '16 ft x 15 ft', vastuDirection: 'North-East / East' },
      { room: 'Kitchen', size: '10 ft x 11 ft', vastuDirection: 'South-East (Agneya)' },
      { room: 'Master Bedroom', size: '13 ft x 14 ft', vastuDirection: 'South-West (Nairuthi)' }
    ],
    vastuGuidelines: [
      { rule: 'Auspicous Pada 3 and 4', explanation: 'Jayanta and Indra padas on the Eastern perimeter attract authority and career growth.' },
      { rule: 'Avoid Toilet in North-East', explanation: 'Never locate toilets or heavy septic tanks in the North-East corner of an East-facing home.' }
    ],
    setbackRules: [
      { side: 'East Frontage', requirement: 'Keep the eastern setback wider than the western side to invite light' }
    ],
    faqs: [
      {
        question: 'Why are East facing house plans so popular in India?',
        answer: 'They receive morning sunlight that naturally sanitizes the home and have naturally aligned Vastu sectors for Kitchen in South-East and Pooja in North-East.'
      }
    ]
  },
  'north-facing-house-plans': {
    slug: 'north-facing-house-plans',
    title: 'North Facing House Plans with Vastu Chart & Room Placements',
    shortTitle: 'North Facing House Plans',
    metaTitle: 'North Facing House Plans with Vastu Chart & Room Placements | HDE',
    metaDesc: 'Explore North facing house plans as per Vastu for 2 BHK & 3 BHK homes. Auspicious Kuber pada entrance, room positioning chart, and construction cost estimates.',
    dimensions: 'Variable (30x40, 30x50, 40x60)',
    plotAreaSqft: 1200,
    plotAreaSqYds: 133.33,
    builtUpAreaSqft: 1600,
    bhkConfig: '2 BHK / 3 BHK / 4 BHK',
    idealFacing: 'North (Lord Kuber - Wealth)',
    floorsRecommendation: 'Any',
    estimatedCostMinLakhs: 24.0,
    estimatedCostMaxLakhs: 48.0,
    category: 'facing',
    overview: 'North facing houses are ruled by Lord Kuber, the god of wealth and prosperity, and the planet Mercury (Budha). North-facing floor designs are universally sought after in India as they bring commercial success, career advancements, and financial abundance.',
    roomDimensions: [
      { room: 'Main Entrance Door', size: 'In 3rd, 4th, or 5th Pada (Mukhya/Bhallat)', vastuDirection: 'North' },
      { room: 'Living Room', size: '15 ft x 16 ft', vastuDirection: 'North / North-East' },
      { room: 'Pooja Room', size: '5 ft x 6 ft', vastuDirection: 'North-East' },
      { room: 'Master Bedroom', size: '12 ft x 14 ft', vastuDirection: 'South-West' },
      { room: 'Kitchen', size: '10 ft x 10 ft', vastuDirection: 'South-East (or North-West)' }
    ],
    vastuGuidelines: [
      { rule: 'Mukhya & Bhallat Padas', explanation: 'Placing the main entrance in the 3rd, 4th, or 5th padas of North guarantees constant financial inflow.' }
    ],
    setbackRules: [
      { side: 'North Setback', requirement: 'Keep the northern boundary open and low for maximum light' }
    ],
    faqs: [
      {
        question: 'Is a North facing house good for business owners?',
        answer: 'Yes, North is ruled by Mercury and Kuber, making it the top Vastu choice for entrepreneurs, traders, and finance professionals.'
      }
    ]
  },
  'west-facing-house-plans': {
    slug: 'west-facing-house-plans',
    title: 'West Facing House Plans As Per Vastu - 2 & 3 BHK Modern Homes',
    shortTitle: 'West Facing House Plans',
    metaTitle: 'West Facing House Plans As Per Vastu - 2 & 3 BHK Modern Homes | HDE',
    metaDesc: 'Find 100% Vastu compliant West facing house plans for 30x40 and 30x50 plots. Expert room layouts, Varuna pada entrance tips, and construction estimates.',
    dimensions: 'Variable (30x40, 30x50)',
    plotAreaSqft: 1200,
    plotAreaSqYds: 133.33,
    builtUpAreaSqft: 1450,
    bhkConfig: '2 BHK / 3 BHK',
    idealFacing: 'West (Lord Varuna)',
    floorsRecommendation: 'Any',
    estimatedCostMinLakhs: 22.8,
    estimatedCostMaxLakhs: 36.0,
    category: 'facing',
    overview: 'West facing house plans are ruled by Lord Varuna (the lord of water, fate, and rain) and Saturn (Shani). When designed correctly with the main entrance in the auspicious Sugriva or Pushpadanta padas, a West-facing home brings great fame, prestige, and prosperity.',
    roomDimensions: [
      { room: 'Main Entrance', size: '3rd or 4th Pada (Sugriva/Pushpadanta)', vastuDirection: 'West' },
      { room: 'Master Bedroom', size: '12 ft x 14 ft', vastuDirection: 'South-West' },
      { room: 'Living Hall', size: '15 ft x 15 ft', vastuDirection: 'North-West or West' },
      { room: 'Kitchen', size: '10 ft x 10 ft', vastuDirection: 'South-East' },
      { room: 'Pooja Room', size: '5 ft x 6 ft', vastuDirection: 'North-East' }
    ],
    vastuGuidelines: [
      { rule: 'Thick Western Walls', explanation: 'Build thicker exterior walls on the West and South to block intense afternoon heat.' }
    ],
    setbackRules: [
      { side: 'West Frontage', requirement: '5 ft to 7 ft' }
    ],
    faqs: [
      {
        question: 'Are West facing houses bad in Vastu?',
        answer: 'No, that is a common myth! Many of the world’s most successful leaders live in West-facing homes. As long as the entrance is in Sugriva or Pushpadanta pada, it is highly rewarding.'
      }
    ]
  },
  'south-facing-house-plans': {
    slug: 'south-facing-house-plans',
    title: 'South Facing House Plans with Vastu Remedy - Safe & Prosperous Layouts',
    shortTitle: 'South Facing House Plans',
    metaTitle: 'South Facing House Plans with Vastu - Prosperous 2 & 3 BHK Plans | HDE',
    metaDesc: 'Discover 100% Vastu-remedied South facing house plans. Learn correct entrance door pada (Vithatha/Gruhakshat), room placements, and budget cost breakdowns.',
    dimensions: 'Variable (30x40, 30x50)',
    plotAreaSqft: 1200,
    plotAreaSqYds: 133.33,
    builtUpAreaSqft: 1450,
    bhkConfig: '2 BHK / 3 BHK',
    idealFacing: 'South (Lord Yama / Mars)',
    floorsRecommendation: 'Any',
    estimatedCostMinLakhs: 22.8,
    estimatedCostMaxLakhs: 36.0,
    category: 'facing',
    overview: 'Contrary to widespread misconceptions, South-facing house plans can be immensely prosperous when designed in strict accordance with Vedic Vastu principles. Ruled by Mars (Mangal) and Lord Yama, a South entrance placed in the 4th pada (Gruhakshat) brings immense courage, health, and commercial dominance.',
    roomDimensions: [
      { room: 'Main Entrance Door', size: '4th Pada (Gruhakshat)', vastuDirection: 'South' },
      { room: 'Master Bedroom', size: '13 ft x 14 ft', vastuDirection: 'South-West' },
      { room: 'Kitchen', size: '10 ft x 11 ft', vastuDirection: 'South-East or North-West' },
      { room: 'Living Hall', size: '15 ft x 16 ft', vastuDirection: 'North or Center' },
      { room: 'Pooja Room', size: '5 ft x 6 ft', vastuDirection: 'North-East' }
    ],
    vastuGuidelines: [
      { rule: 'Strict Entrance Placement', explanation: 'Place door strictly in the 4th pada (Gruhakshat) or 3rd pada (Vithatha). Never place it in the 1st, 2nd, or 8th pada.' }
    ],
    setbackRules: [
      { side: 'South Boundary', requirement: 'Keep the southern boundary wall slightly higher than the northern boundary wall' }
    ],
    faqs: [
      {
        question: 'Can South facing house bring prosperity?',
        answer: 'Yes! South is the direction of fire and energy. When aligned with Gruhakshat pada, South facing houses bring tremendous fame, wealth, and legal victories.'
      }
    ]
  },
  '1-bhk-house-plans': {
    slug: '1-bhk-house-plans',
    title: '1 BHK House Plans & Compact Low-Cost Floor Designs',
    shortTitle: '1 BHK House Plans',
    metaTitle: '1 BHK House Plans & Low Cost Compact Floor Designs | HDE',
    metaDesc: 'Explore modern 1 BHK house plans for small plots (20x30, 15x30, 20x25). Budget-friendly 1 bedroom home designs with Vastu tips and construction cost calculator.',
    dimensions: '15x30 to 20x30 ft',
    plotAreaSqft: 450,
    plotAreaSqYds: 50.0,
    builtUpAreaSqft: 550,
    bhkConfig: '1 BHK',
    idealFacing: 'East or North',
    floorsRecommendation: 'Ground Floor',
    estimatedCostMinLakhs: 8.5,
    estimatedCostMaxLakhs: 14.0,
    category: 'bhk',
    overview: '1 BHK house plans are ideal for bachelors, young couples, retirees, or farmhouses and guest cottages. Designed with smart multi-functional furniture and open layouts, these homes maximize every square inch without feeling cramped.',
    roomDimensions: [
      { room: 'Living & Dining', size: '10 ft x 13 ft', vastuDirection: 'North-East' },
      { room: 'Open Kitchen', size: '7 ft x 8 ft', vastuDirection: 'South-East' },
      { room: 'Master Bedroom', size: '10 ft x 11 ft', vastuDirection: 'South-West' },
      { room: 'Bathroom', size: '5 ft x 6 ft', vastuDirection: 'West' }
    ],
    vastuGuidelines: [
      { rule: 'Space Optimization', explanation: 'Use sliding doors and built-in wardrobes to keep pathways clear.' }
    ],
    setbackRules: [
      { side: 'Front', requirement: '3 ft' }
    ],
    faqs: [
      {
        question: 'What is the minimum plot size for a 1 BHK house?',
        answer: 'A 1 BHK house can comfortably be built on a plot as small as 15x30 (450 sq ft) or 20x25 (500 sq ft).'
      }
    ]
  },
  '2-bhk-house-plans': {
    slug: '2-bhk-house-plans',
    title: '2 BHK House Plans - Best Indian Middle-Class Home Layouts',
    shortTitle: '2 BHK House Plans',
    metaTitle: '2 BHK House Plans - Vastu Compliant Floor Plans with Parking | HDE',
    metaDesc: 'Browse 2 BHK house plans for 20x40, 25x40, 30x40, and 30x50 plots. Single floor and duplex 2-bedroom home designs with car parking and Vastu tips.',
    dimensions: '20x40 to 30x40 ft',
    plotAreaSqft: 1000,
    plotAreaSqYds: 111.11,
    builtUpAreaSqft: 1200,
    bhkConfig: '2 BHK',
    idealFacing: 'East or North',
    floorsRecommendation: 'Ground Floor or G+1',
    estimatedCostMinLakhs: 19.0,
    estimatedCostMaxLakhs: 30.0,
    category: 'bhk',
    overview: 'The 2 BHK house plan is the undisputed champion of Indian middle-class residential architecture. Offering a master bedroom with attached bath, a secondary bedroom for kids or parents, a spacious hall, separate kitchen, and pooja alcove, it delivers maximum comfort at an accessible budget.',
    roomDimensions: [
      { room: 'Living & Dining', size: '12 ft x 16 ft', vastuDirection: 'North-East' },
      { room: 'Modular Kitchen', size: '9 ft x 10 ft', vastuDirection: 'South-East' },
      { room: 'Master Bedroom', size: '12 ft x 13 ft', vastuDirection: 'South-West' },
      { room: 'Kids Bedroom', size: '10 ft x 11 ft', vastuDirection: 'North-West' },
      { room: 'Car Parking', size: '10 ft x 14 ft', vastuDirection: 'North' }
    ],
    vastuGuidelines: [
      { rule: 'Kids Room in Vayavya (NW)', explanation: 'North-West direction is ideal for children and guests.' }
    ],
    setbackRules: [
      { side: 'Front', requirement: '5 ft' }
    ],
    faqs: [
      {
        question: 'How much does it cost to build a 2 BHK house in India?',
        answer: 'Constructing a 2 BHK house (1,000 to 1,200 sqft built-up) costs between ₹19 Lakhs and ₹28 Lakhs in 2026.'
      }
    ]
  },
  '3-bhk-house-plans': {
    slug: '3-bhk-house-plans',
    title: '3 BHK House Plans & Duplex Floor Designs with Parking',
    shortTitle: '3 BHK House Plans',
    metaTitle: '3 BHK House Plans & Duplex Floor Designs with Car Parking | HDE',
    metaDesc: 'Discover spacious 3 BHK house plans for 30x40, 30x50, and 40x60 plots. Single floor and G+1 duplex designs with 3 bedrooms, 3 baths, pooja room, and car parking.',
    dimensions: '30x40 to 40x60 ft',
    plotAreaSqft: 1500,
    plotAreaSqYds: 166.67,
    builtUpAreaSqft: 2000,
    bhkConfig: '3 BHK',
    idealFacing: 'East, North, or West',
    floorsRecommendation: 'G+1 Duplex',
    estimatedCostMinLakhs: 36.0,
    estimatedCostMaxLakhs: 58.0,
    category: 'bhk',
    overview: 'A 3 BHK floor plan is the premier choice for growing families seeking longevity and privacy. Typically built as a G+1 duplex, it features 1 bedroom on the ground floor for elderly parents and 2 lavish bedrooms upstairs with private balconies and a family entertainment zone.',
    roomDimensions: [
      { room: 'Grand Living Hall', size: '16 ft x 18 ft', vastuDirection: 'North-East' },
      { room: 'Dining Area', size: '12 ft x 14 ft', vastuDirection: 'East' },
      { room: 'Master Bedroom (1st Flr)', size: '14 ft x 15 ft', vastuDirection: 'South-West' },
      { room: 'Parents Bedroom (Grd Flr)', size: '12 ft x 13 ft', vastuDirection: 'South or West' },
      { room: 'Children Bedroom', size: '12 ft x 12 ft', vastuDirection: 'North-West' },
      { room: 'Kitchen & Store', size: '10 ft x 12 ft', vastuDirection: 'South-East' }
    ],
    vastuGuidelines: [
      { rule: 'Ground Floor Parents Room', explanation: 'Allows elderly parents to avoid climbing stairs daily while staying in a calm South/West zone.' }
    ],
    setbackRules: [
      { side: 'Front', requirement: '6 ft to 8 ft' }
    ],
    faqs: [
      {
        question: 'What is the minimum plot required for a 3 BHK house?',
        answer: 'You can build a 3 BHK duplex on a 30x40 plot (1200 sqft), or a single-floor 3 BHK on a 30x60 or 40x50 plot (1800+ sqft).'
      }
    ]
  },
  'low-cost-house-plans': {
    slug: 'low-cost-house-plans',
    title: 'Low Cost House Plans & Budget Home Construction Designs',
    shortTitle: 'Low Cost House Plans',
    metaTitle: 'Low Cost House Plans & Budget Home Construction Designs | HDE',
    metaDesc: 'Best low cost house plans for small budgets. Smart engineering, affordable building techniques (AAC blocks, filler slabs), and Vastu compliant budget home designs.',
    dimensions: 'Variable (20x30, 20x40, 25x30)',
    plotAreaSqft: 600,
    plotAreaSqYds: 66.67,
    builtUpAreaSqft: 750,
    bhkConfig: '1 BHK / 2 BHK',
    idealFacing: 'East or North',
    floorsRecommendation: 'Ground Floor Single Slab',
    estimatedCostMinLakhs: 9.5,
    estimatedCostMaxLakhs: 15.0,
    category: 'budget',
    overview: 'Building a dream home on a tight budget requires smart value engineering. By choosing modern AAC blocks over red bricks, adopting exposed brickwork or filler slabs, optimizing plumbing lines back-to-back, and avoiding unnecessary structural cantilevers, you can reduce construction costs by 20% to 30% without sacrificing strength.',
    roomDimensions: [
      { room: 'Multipurpose Hall', size: '11 ft x 14 ft', vastuDirection: 'North-East' },
      { room: 'Compact Kitchen', size: '7 ft x 8 ft', vastuDirection: 'South-East' },
      { room: 'Master Bedroom', size: '10 ft x 11 ft', vastuDirection: 'South-West' },
      { room: 'Common Bathroom', size: '5 ft x 6 ft', vastuDirection: 'West' }
    ],
    vastuGuidelines: [
      { rule: 'Simple Rectangular Footprint', explanation: 'Avoid cuts or extensions in the perimeter. A clean rectangle is both Vastu-perfect and the cheapest to construct.' }
    ],
    setbackRules: [
      { side: 'Front', requirement: '3 ft' }
    ],
    faqs: [
      {
        question: 'How to reduce house construction cost in India?',
        answer: 'Use AAC blocks instead of red bricks (saves 15% on masonry & plastering), pre-plan electrical conduits before casting slabs, choose vitrified tiles over marble, and design back-to-back plumbing for kitchen and toilets.'
      }
    ]
  }
};
