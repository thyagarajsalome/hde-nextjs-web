import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/config/supabaseClient';
import USARentVsBuyCalculator from '@/features/construction/USARentVsBuyCalculator';
import USAPropertyTaxCalculator from '@/features/construction/USAPropertyTaxCalculator';
import USASalaryCalculator from '@/features/construction/USASalaryCalculator';
import USARemodelROICalculator from '@/features/construction/USARemodelROICalculator';
import USAKitchenRemodelCalculator from '@/features/construction/USAKitchenRemodelCalculator';
import USAHomeAdditionCalculator from '@/features/construction/USAHomeAdditionCalculator';
import USASwimmingPoolCalculator from '@/features/construction/USASwimmingPoolCalculator';
import USAPickleballCalculator from '@/features/construction/USAPickleballCalculator';
import USAOutdoorKitchenCalculator from '@/features/construction/USAOutdoorKitchenCalculator';
import USABathroomRemodelCalculator from '@/features/construction/USABathroomRemodelCalculator';
import USABarndominiumCalculator from '@/features/construction/USABarndominiumCalculator';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static routes for all USA locations x tools

const USA_CITIES_FALLBACK = [
  { slug: 'dallas-texas', city_name: 'Dallas', state_name: 'Texas', country: 'USA' },
  { slug: 'miami-florida', city_name: 'Miami', state_name: 'Florida', country: 'USA' },
  { slug: 'atlanta-georgia', city_name: 'Atlanta', state_name: 'Georgia', country: 'USA' },
  { slug: 'seattle-washington', city_name: 'Seattle', state_name: 'Washington', country: 'USA' },
  { slug: 'phoenix-arizona', city_name: 'Phoenix', state_name: 'Arizona', country: 'USA' },
  { slug: 'chicago-illinois', city_name: 'Chicago', state_name: 'Illinois', country: 'USA' },
  { slug: 'denver-colorado', city_name: 'Denver', state_name: 'Colorado', country: 'USA' },
  { slug: 'charlotte-north-carolina', city_name: 'Charlotte', state_name: 'North Carolina', country: 'USA' },
  { slug: 'orlando-florida', city_name: 'Orlando', state_name: 'Florida', country: 'USA' },
  { slug: 'nashville-tennessee', city_name: 'Nashville', state_name: 'Tennessee', country: 'USA' },
  { slug: 'las-vegas-nevada', city_name: 'Las Vegas', state_name: 'Nevada', country: 'USA' },
  { slug: 'tampa-florida', city_name: 'Tampa', state_name: 'Florida', country: 'USA' },
  { slug: 'raleigh-north-carolina', city_name: 'Raleigh', state_name: 'North Carolina', country: 'USA' },
  { slug: 'salt-lake-city-utah', city_name: 'Salt Lake City', state_name: 'Utah', country: 'USA' },
  { slug: 'san-diego-california', city_name: 'San Diego', state_name: 'California', country: 'USA' }
];

export async function generateStaticParams() {
  const { data: dbLocations } = await supabase
    .from('pseo_locations')
    .select('slug')
    .eq('country', 'USA');

  let locations = dbLocations || [];
  if (locations.length === 0) {
    locations = USA_CITIES_FALLBACK;
  } else {
    const existingSlugs = new Set(locations.map(l => l.slug));
    const toAdd = USA_CITIES_FALLBACK.filter(c => !existingSlugs.has(c.slug));
    locations = [...locations, ...toAdd];
  }

  const params: { slug: string }[] = [];
  for (const loc of locations) {
    params.push({ slug: `rent-vs-buy-in-${loc.slug}` });
    params.push({ slug: `property-tax-in-${loc.slug}` });
    params.push({ slug: `salary-needed-to-buy-in-${loc.slug}` });
    params.push({ slug: `remodel-roi-in-${loc.slug}` });
    params.push({ slug: `kitchen-remodel-in-${loc.slug}` });
    params.push({ slug: `bathroom-remodel-in-${loc.slug}` });
    params.push({ slug: `home-addition-in-${loc.slug}` });
    params.push({ slug: `swimming-pool-cost-in-${loc.slug}` });
    params.push({ slug: `pickleball-court-cost-in-${loc.slug}` });
    params.push({ slug: `outdoor-kitchen-cost-in-${loc.slug}` });
    params.push({ slug: `barndominium-cost-in-${loc.slug}` });
  }

  return params;
}

// Helper to parse slug
function parseSlug(slug: string) {
  if (!slug) return null;
  const match = slug.match(/^(rent-vs-buy|property-tax|salary-needed-to-buy|remodel-roi|kitchen-remodel|bathroom-remodel|home-addition|swimming-pool-cost|pickleball-court-cost|outdoor-kitchen-cost|barndominium-cost)-in-(.+)$/);
  if (!match) return null;
  return {
    toolType: match[1],
    citySlug: match[2],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const parsed = parseSlug(resolvedParams.slug);
  if (!parsed) return { title: 'Not Found' };

  const { toolType, citySlug } = parsed;


  let location = null;
  const { data: dbLoc } = await supabase
    .from('pseo_locations')
    .select('city_name, state_name')
    .eq('slug', citySlug)
    .single();
    
  if (dbLoc) {
    location = dbLoc;
  } else {
    location = USA_CITIES_FALLBACK.find(c => c.slug === citySlug);
  }

  if (!location) {
    // Dynamic fallback for missing cities in state hubs
    const stateSuffixes = ['-texas', '-california', '-florida', '-georgia', '-washington', '-arizona', '-illinois', '-colorado', '-north-carolina', '-tennessee', '-nevada', '-utah'];
    for (const suffix of stateSuffixes) {
      if (citySlug.endsWith(suffix)) {
        const rawCity = citySlug.slice(0, -suffix.length);
        const formatWord = (str: string) => str.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        location = {
          slug: citySlug,
          city_name: formatWord(rawCity),
          state_name: formatWord(suffix.replace('-', '')),
          country: 'USA'
        };
        break;
      }
    }
  }

  if (!location) return { title: 'Not Found' };

  let titlePrefix = '';
  if (toolType === 'rent-vs-buy') titlePrefix = 'Rent vs. Buy Calculator';
  else if (toolType === 'property-tax') titlePrefix = 'Property Tax Calculator';
  else if (toolType === 'salary-needed-to-buy') titlePrefix = 'Salary Needed to Buy a House';
  else if (toolType === 'remodel-roi') titlePrefix = 'Remodel ROI Calculator';
  else if (toolType === 'kitchen-remodel') titlePrefix = 'Kitchen Remodel Cost Estimator';
  else if (toolType === 'bathroom-remodel') titlePrefix = 'Bathroom Remodel Cost Estimator';
  else if (toolType === 'home-addition') titlePrefix = 'Home Addition Cost Estimator';
  else if (toolType === 'swimming-pool-cost') titlePrefix = 'Swimming Pool Cost Estimator';
  else if (toolType === 'pickleball-court-cost') titlePrefix = 'Pickleball Court Cost Estimator';
  else if (toolType === 'outdoor-kitchen-cost') titlePrefix = 'Outdoor Kitchen Cost Estimator';
  else if (toolType === 'barndominium-cost') titlePrefix = 'Barndominium & Pole Barn Cost Estimator';

  return {
    title: `${titlePrefix} in ${location.city_name}, ${location.state_name} | HDE`,
    description: `Use our free ${titlePrefix.toLowerCase()} for ${location.city_name}, ${location.state_name} to make informed real estate decisions.`,
    alternates: {
      canonical: `/real-estate/${resolvedParams.slug}`,
    },
    openGraph: {
      title: `${titlePrefix} in ${location.city_name}, ${location.state_name} | HDE`,
      description: `Use our free ${titlePrefix.toLowerCase()} for ${location.city_name}, ${location.state_name} to make informed real estate decisions.`,
      url: `/real-estate/${resolvedParams.slug}`,
      type: 'website',
    },
  };
}

const ALL_TOOLS = [
  { id: 'rent-vs-buy', name: 'Rent vs. Buy', icon: '🏠' },
  { id: 'property-tax', name: 'Property Tax', icon: '📋' },
  { id: 'salary-needed-to-buy', name: 'Salary Needed', icon: '💰' },
  { id: 'remodel-roi', name: 'Remodel ROI', icon: '📈' },
  { id: 'kitchen-remodel', name: 'Kitchen Remodel', icon: '🍳' },
  { id: 'bathroom-remodel', name: 'Bathroom Remodel', icon: '🛁' },
  { id: 'home-addition', name: 'Home Addition', icon: '🏗️' },
  { id: 'swimming-pool-cost', name: 'Swimming Pool', icon: '🏊' },
  { id: 'pickleball-court-cost', name: 'Pickleball Court', icon: '🏓' },
  { id: 'outdoor-kitchen-cost', name: 'Outdoor Kitchen', icon: '🔥' },
  { id: 'barndominium-cost', name: 'Barndominium Cost', icon: '🌾' },
];

function getSampleCalculation(toolType: string, cityName: string, stateName: string) {
  switch (toolType) {
    case 'rent-vs-buy':
      return {
        description: `This sample compares buying a $400,000 home versus renting in ${cityName}, ${stateName} over a 5-year period.`,
        data: [
          { label: 'Home Price', value: '$400,000' },
          { label: 'Down Payment (20%)', value: '$80,000' },
          { label: 'Mortgage Rate', value: '6.5%' },
          { label: 'Monthly PITI', value: '~$2,500' },
          { label: 'Monthly Rent', value: '~$2,100' },
          { label: '5-year equity built', value: '~$38,000' },
        ],
        verdict: 'In this scenario, buying builds $38,000 in equity over 5 years, offsetting the higher monthly cost.'
      };
    case 'property-tax':
      return {
        description: `Estimated annual property taxes for a sample home in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Assessed Home Value', value: '$350,000' },
          { label: 'Estimated Tax Rate', value: '1.8%' },
          { label: 'Annual Property Tax', value: '~$6,300' },
          { label: 'Monthly Tax Escrow', value: '~$525' },
          { label: 'Annual Home Insurance', value: '~$1,200' },
        ],
        verdict: 'Expect to add approximately $525 to your monthly mortgage payment for property tax escrow.'
      };
    case 'salary-needed-to-buy':
      return {
        description: `Income required to afford a $450,000 home using the standard 28/36 debt-to-income (DTI) rule in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Home Price', value: '$450,000' },
          { label: 'Monthly PITI', value: '~$2,200' },
          { label: 'DTI Target', value: '28%' },
          { label: 'Required Annual Salary', value: '~$95,000' },
        ],
        verdict: 'A household income of ~$95,000 is recommended to comfortably afford a $450,000 home.'
      };
    case 'remodel-roi':
      return {
        description: `Estimated Return on Investment for a mid-range kitchen remodel in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Project Type', value: 'Mid-Range Kitchen' },
          { label: 'Remodel Cost', value: '$35,000' },
          { label: 'Added Home Value', value: '$28,000' },
          { label: 'Estimated ROI', value: '80%' },
        ],
        verdict: 'Kitchen remodels typically recover about 80% of their cost when selling the home.'
      };
    case 'kitchen-remodel':
      return {
        description: `Cost breakdown for remodeling a sample 10x12 kitchen in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Cabinets', value: '$8,000' },
          { label: 'Countertops', value: '$4,500' },
          { label: 'Appliances', value: '$6,000' },
          { label: 'Labor', value: '$12,000' },
          { label: 'Total Estimated Cost', value: '~$30,500' },
        ],
        verdict: 'A standard 10x12 kitchen remodel typically costs around $30,500 depending on materials and labor rates.'
      };
    case 'bathroom-remodel':
      return {
        description: `Cost breakdown for remodeling a standard 5x8 (40 sq. ft.) full bathroom in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Plumbing & Fixtures', value: '$3,800' },
          { label: 'Tile & Waterproofing', value: '$3,200' },
          { label: 'Vanity & Countertop', value: '$2,400' },
          { label: 'Electrical & Lighting', value: '$1,300' },
          { label: 'Demolition & Disposal', value: '$900' },
          { label: 'Contractor Labor', value: '$4,200' },
          { label: 'Total Estimated Cost', value: '~$15,800' },
        ],
        verdict: 'A standard mid-range full bathroom remodel in this area averages $14,000 to $18,500 all-in.'
      };
    case 'home-addition':
      return {
        description: `Estimated cost for a standard 400 square foot home addition in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Size', value: '400 sq. ft.' },
          { label: 'Cost per sq. ft.', value: '$200 - $350' },
          { label: 'Low-End Total', value: '$80,000' },
          { label: 'High-End Total', value: '$140,000' },
        ],
        verdict: 'Adding 400 square feet usually ranges from $80,000 to $140,000 depending on finishes and structural requirements.'
      };
    case 'swimming-pool-cost':
      return {
        description: `Estimated cost for a sample 15x30 gunite swimming pool in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Pool Type', value: '15x30 Gunite' },
          { label: 'Excavation', value: '$5,000' },
          { label: 'Pool Shell', value: '$25,000' },
          { label: 'Decking', value: '$8,000' },
          { label: 'Total Estimated Cost', value: '~$55,000' },
        ],
        verdict: 'A standard 15x30 gunite pool installation typically costs around $55,000.'
      };
    case 'pickleball-court-cost':
      return {
        description: `Estimated cost for a 30x60 post-tension concrete pickleball court in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Size', value: '30x60 feet' },
          { label: 'Concrete Base', value: '$16,000' },
          { label: 'Surface & Lines', value: '$5,000' },
          { label: 'Fencing', value: '$6,000' },
          { label: 'Lighting', value: '$7,000' },
          { label: 'Total Estimated Cost', value: '~$34,000' },
        ],
        verdict: 'Expect to spend approximately $34,000 for a fully equipped residential pickleball court.'
      };
    case 'outdoor-kitchen-cost':
      return {
        description: `Estimated cost for a mid-range outdoor kitchen setup in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Project Type', value: 'Mid-Range Outdoor Kitchen' },
          { label: 'Masonry & Framework', value: '$8,000' },
          { label: 'Appliances (Grill, Fridge)', value: '$12,000' },
          { label: 'Countertops', value: '$4,000' },
          { label: 'Utilities (Gas, Electric)', value: '$4,000' },
          { label: 'Total Estimated Cost', value: '~$28,000' },
        ],
        verdict: 'A complete mid-range outdoor kitchen typically costs around $28,000 to construct.'
      };
    case 'barndominium-cost':
      return {
        description: `Estimated turn-key construction cost for a 40' x 60' (2,400 sq ft) barndominium with 1,500 sq ft living quarters and a 900 sq ft workshop in ${cityName}, ${stateName}.`,
        data: [
          { label: 'Building Footprint', value: "40' x 60' (2,400 sq ft)" },
          { label: 'Living / Shop Split', value: '1,500 sq ft Living / 900 sq ft Shop' },
          { label: '4" Engineered Concrete Slab', value: '~$20,400' },
          { label: 'Steel Shell & Metal Erection', value: '~$78,000' },
          { label: 'Closed-Cell Spray Foam', value: '~$9,000' },
          { label: 'Interior Turn-Key Living Finishes', value: '~$128,000' },
          { label: 'Rural Utilities (Well & Septic)', value: '~$17,500' },
          { label: 'Total Turn-Key Build Budget', value: '~$252,900' },
        ],
        verdict: 'Turn-key barndominiums in this area average ~$105/sq ft all-in, delivering 30-40% cost savings compared to traditional custom home builds.'
      };
    default:
      return null;
  }
}

function getLocalGuideContent(toolType: string, cityName: string, stateName: string) {
  const toolDetails: Record<string, {
    title: string;
    summary: string;
    costFactors: { factor: string; detail: string }[];
    permitInsight: string;
    roiTakeaway: string;
  }> = {
    'rent-vs-buy': {
      title: `Understanding Homeownership vs. Renting Economics in ${cityName}`,
      summary: `In ${cityName}, ${stateName}, deciding whether to purchase real estate or continue leasing involves analyzing several critical financial variables beyond the initial listing price. Mortgage interest rates, local property tax assessments, homeowner insurance premiums, and municipal transfer fees all influence your break-even horizon. Typically, homeowners in ${cityName} reach positive net equity payoff between 4 to 6 years of consistent occupancy.`,
      costFactors: [
        { factor: 'Mortgage Principal & Interest', detail: `Current prevailing fixed rates shape your monthly amortization schedule. Early payments are predominantly interest-heavy, building equity faster in later years.` },
        { factor: 'Property Tax Escrow', detail: `Local ${stateName} taxing authorities periodically re-evaluate property market values, making annual escrow adjustment a key budgeting factor.` },
        { factor: 'Maintenance & HOA Overhead', detail: `Budget 1% to 1.5% of total home value annually for preventive structural, mechanical, and roofing maintenance.` },
        { factor: 'Opportunity Cost of Capital', detail: `Compare your down payment equity growth in residential property against traditional liquid index funds.` },
      ],
      permitInsight: `When purchasing existing properties in ${cityName}, ensure all previous room additions, garage conversions, and sheds have closed municipal permits on file with the local building department.`,
      roiTakeaway: `Long-term homeownership in ${cityName} historically outpaces rent inflation by shielding families from sudden annual lease increases while building tax-advantaged equity.`,
    },
    'property-tax': {
      title: `Navigating County Assessments and Escrow in ${cityName}, ${stateName}`,
      summary: `Property tax bills in ${cityName} fund essential local services including ISD public schools, police and fire emergency services, local road infrastructure, and county civil administration. Because ${stateName} tax assessors periodically re-assess residential market values, understanding local assessment schedules is vital to preventing sudden escrow shortfalls.`,
      costFactors: [
        { factor: 'Assessed Value vs. Market Value', detail: `Taxing districts evaluate property values using mass-appraisal models which may differ from current active market sales transactions.` },
        { factor: 'School District (ISD) Millage Rates', detail: `School districts generally constitute 50% or more of total annual tax liabilities in the ${cityName} area.` },
        { factor: 'Homestead & Veteran Exemptions', detail: `Owner-occupants should immediately file for general homestead exemptions to cap annual assessed value growth.` },
        { factor: 'Appraisal Protest Rights', detail: `Homeowners possess statutory rights each spring to formally protest inflated property value valuations before the county appraisal review board.` },
      ],
      permitInsight: `Unpermitted renovations or additions identified by county aerial surveys or permit filings can trigger reassessment adjustments in ${cityName}.`,
      roiTakeaway: `Filing your statutory exemptions on time in ${stateName} can save thousands of dollars annually and directly reduces your monthly mortgage escrow obligation.`,
    },
    'salary-needed-to-buy': {
      title: `Income Thresholds & Debt-to-Income Guidelines for ${cityName} Buyers`,
      summary: `Mortgage underwriters in ${cityName}, ${stateName} adhere strictly to qualifying debt-to-income (DTI) metrics. The standard benchmark is the 28/36 rule: your principal, interest, taxes, and insurance (PITI) should not exceed 28% of your gross monthly earnings, and total debt obligations (including student loans, auto financing, and credit cards) must remain under 36% to 43%.`,
      costFactors: [
        { factor: 'Gross Annual Household Income', detail: `W-2 wages, verified self-employment income (2-year average), and guaranteed bonus structures recognized by mortgage lenders.` },
        { factor: 'Revolving and Installment Debt', detail: `Monthly auto loans, minimum credit card payments, and student loan balances reduce your maximum borrowing ceiling dollar-for-dollar.` },
        { factor: 'Down Payment Percentage', detail: `Putting down 20% eliminates costly Private Mortgage Insurance (PMI), dramatically lowering the required qualifying income.` },
        { factor: 'Credit Score Tiers', detail: `FICO scores above 740 secure the most competitive interest rates, directly expanding your purchasing power in ${cityName}.` },
      ],
      permitInsight: `Ensure your debt verification includes realistic property insurance quotes, as premiums have adjusted upward across ${stateName}.`,
      roiTakeaway: `Improving your credit score by 40 points or eliminating a $400/month car payment often provides more home-buying leverage in ${cityName} than a $10,000 salary bump.`,
    },
    'remodel-roi': {
      title: `Maximizing Home Renovation Equity and Resale Value in ${cityName}`,
      summary: `Not all home improvement projects return equal value at resale. In ${cityName}, ${stateName}, strategic interior and exterior upgrades deliver predictable Return on Investment (ROI) by aligning your home with current neighborhood buyer expectations and recent comparable sales (comps).`,
      costFactors: [
        { factor: 'Minor Kitchen Upgrades', detail: `Refacing cabinets, upgrading to solid quartz countertops, and installing modern appliances historically recoups 75% to 85% at resale.` },
        { factor: 'Bathroom Modernization', detail: `Replacing aging tubs with walk-in tile showers, modern double vanities, and low-flow plumbing recovers 65% to 75% of project cost.` },
        { factor: 'Curb Appeal & Exterior Upgrades', detail: `Modern garage doors, fresh exterior siding, and manufactured stone veneers frequently return 90%+ in market value.` },
        { factor: 'Avoid Over-Improving for the Neighborhood', detail: `Keep your finished valuation within 10% to 15% of median home values on your immediate street to protect liquidity.` },
      ],
      permitInsight: `Remodels completed without required municipal permits in ${cityName} must often be retroactively inspected or opened up during buyer home inspections, destroying profit margins.`,
      roiTakeaway: `Focus remodel dollars on functional daily touchpoints—kitchens, bathrooms, and energy-efficient HVAC—where ${cityName} buyers are willing to pay a premium.`,
    },
    'kitchen-remodel': {
      title: `Kitchen Remodeling Costs, Trade Labor & Permitting in ${cityName}`,
      summary: `A kitchen renovation represents the most complex interior project in any ${cityName} residence due to the dense intersection of electrical wiring, plumbing rough-ins, mechanical venting, and structural framing. Proper space planning and material selection ensure longevity and high daily satisfaction.`,
      costFactors: [
        { factor: 'Cabinetry (30% to 40% of Budget)', detail: `Semi-custom solid wood boxes with soft-close hardware offer the best durability-to-cost ratio for ${cityName} homeowners.` },
        { factor: 'Countertop Materials', detail: `Engineered quartz ($60-$120/sq ft installed) provides non-porous stain resistance superior to natural marble or low-end laminate.` },
        { factor: 'Licensed Electrical & Plumbing Labor', detail: `Dedicated 20-amp small appliance circuits, GFCI protection, and island sink rough-ins require certified master trades.` },
        { factor: 'Appliance Packages', detail: `Energy Star certified induction cooktops and counter-depth refrigeration enhance ergonomics and resale interest.` },
      ],
      permitInsight: `In ${cityName}, permits are mandatory whenever relocating water supply lines, drain stacks, gas pipes, or adding electrical circuits to kitchen layouts.`,
      roiTakeaway: `Allocate 15% of your total kitchen remodel budget as an uncommitted contingency fund to absorb unexpected subfloor leveling or behind-wall pipe replacement.`,
    },
    'bathroom-remodel': {
      title: `Bathroom Renovation Guidelines, Tile Sourcing & Budgeting in ${cityName}`,
      summary: `Remodeling a primary bathroom or powder room in ${cityName}, ${stateName} transforms home comfort while preventing moisture-induced drywall degradation. Modernizing waterproof membranes, ventilation CFM exhaust capacity, and designer tile layouts produces lasting aesthetic and financial value.`,
      costFactors: [
        { factor: 'Waterproofing Membranes', detail: `Utilizing bonded sheet membranes (Schluter Kerdi or RedGard) inside shower enclosures prevents catastrophic framing rot.` },
        { factor: 'Tile Selection & Installation', detail: `Large-format porcelain tiles minimize grout lines, reducing maintenance while providing high scratch and water resistance.` },
        { factor: 'Plumbing Fixtures & Valves', detail: `Pressure-balanced thermostatic shower valves and dual-flush water-efficient toilets comply with municipal conservation codes.` },
        { factor: 'Vanity & Storage Solutions', detail: `Floating vanities with under-cabinet LED kick lighting visually enlarge modest bathroom footprints.` },
      ],
      permitInsight: `Replacing shower pans, moving toilet flanges, or adding dedicated 20-amp GFCI bathroom receptacles requires standard trade permits in ${cityName}.`,
      roiTakeaway: `Prioritize high-quality waterproofing and ventilation over cosmetic gold fixtures—hidden moisture issues represent the #1 risk in ${cityName} bathrooms.`,
    },
    'home-addition': {
      title: `Home Expansion & Square Footage Addition Planning in ${cityName}`,
      summary: `Building an addition—whether expanding a ground-floor master suite, adding a sunroom, or raising a second story—requires meticulous structural integration with your existing home in ${cityName}, ${stateName}. Local zoning setbacks, lot coverage limits, and foundation tie-ins dictate feasibility.`,
      costFactors: [
        { factor: 'Foundation Engineering', detail: `Monolithic concrete slab-on-grade or crawlspace piers must match local ${cityName} soil mechanics and frost depth.` },
        { factor: 'Structural Framing & Trusses', detail: `Dimensional lumber, engineered LVL beams, and roof truss tie-ins require stamped structural engineering calculations.` },
        { factor: 'HVAC Sizing & Duct Extension', detail: `Evaluate whether your current central HVAC capacity can condition additional square footage or if a dedicated mini-split is needed.` },
        { factor: 'Exterior Envelope & Roofing', detail: `Seamlessly matching brick masonry, fiber cement siding, and roof shingles preserves cohesive curb appeal.` },
      ],
      permitInsight: `Home additions in ${cityName} require full architectural plan reviews, zoning variance approvals (if near property lines), and multiple milestone inspections.`,
      roiTakeaway: `Adding legal, permitted square footage in high-demand ${cityName} neighborhoods directly boosts your home's total appraised market value.`,
    },
    'swimming-pool-cost': {
      title: `Residential Swimming Pool Construction & Site Engineering in ${cityName}`,
      summary: `Installing a swimming pool in ${cityName}, ${stateName} creates a private backyard oasis. Choosing between pneumatically placed gunite (shotcrete), prefabricated fiberglass, or vinyl liners depends on your backyard topography, soil geology, and long-term maintenance preferences.`,
      costFactors: [
        { factor: 'Excavation & Soil Conditions', detail: `Rock excavation or high water tables significantly increase digging and grading machinery hours.` },
        { factor: 'Gunite vs. Fiberglass Shells', detail: `Gunite offers infinite custom shapes and deep-end configurations; fiberglass installs faster and uses fewer sanitizing chemicals.` },
        { factor: 'Pumps, Filtration & Automation', detail: `Variable-speed pumps and salt-chlorine generators cut monthly utility bills by up to 60% compared to single-speed systems.` },
        { factor: 'Decking, Coping & Safety Barriers', detail: `Travertine pavers, poured cantilever concrete, and required child-safety barrier fencing.` },
      ],
      permitInsight: `Every municipality in ${stateName} enforces strict swimming pool safety codes, including minimum 48-inch self-closing fencing and door alarm sensors.`,
      roiTakeaway: `In warm climates like ${stateName}, well-designed swimming pools with functional patio decking deliver strong lifestyle utility and solid buyer appeal.`,
    },
    'pickleball-court-cost': {
      title: `Backyard Pickleball Court Construction & Engineering in ${cityName}`,
      summary: `Pickleball is the fastest-growing recreational sport in America, and private residential courts are becoming premier amenities in ${cityName}, ${stateName}. Ensuring a crack-resistant sub-base, tournament-grade surfacing, and proper orientation is crucial for playable court longevity.`,
      costFactors: [
        { factor: 'Post-Tension Concrete Slab', detail: `Post-tensioned concrete slabs (4 inches thick) withstand ground movement and thermal expansion without unsightly cracking.` },
        { factor: 'Cushioned Acrylic Surfacing', detail: `Multi-coat 100% acrylic latex sport surfacing with non-skid silica sand delivers consistent ball bounce and player comfort.` },
        { factor: 'Court Orientation (North-South)', detail: `Orienting the long court axis north-to-south prevents sunrise and sunset solar glare into players' eyes.` },
        { factor: 'Lighting & Containment Fencing', detail: `Dark sky compliant LED sports fixtures and 10-foot black vinyl-coated chain-link perimeter fencing.` },
      ],
      permitInsight: `Check ${cityName} zoning laws regarding impervious surface ratios (maximum lot coverage) and noise ordinances before breaking ground on court lighting.`,
      roiTakeaway: `A dedicated pickleball court adds exceptional recreational utility and sets luxury residential properties apart in the competitive ${cityName} market.`,
    },
    'outdoor-kitchen-cost': {
      title: `Outdoor Kitchen Design, Masonry & Utility Trenching in ${cityName}`,
      summary: `An outdoor kitchen expands your living space into the open air, creating an entertainment hub in ${cityName}, ${stateName}. Designing for outdoor durability requires marine-grade 304 stainless steel appliances, weather-resistant stone masonry, and professionally trenched utilities.`,
      costFactors: [
        { factor: 'Masonry Substructure & Cladding', detail: `Concrete block (CMU) masonry faced with natural stacked stone or stucco withstands sun, humidity, and rain.` },
        { factor: '304 Stainless Steel Appliances', detail: `Drop-in gas grills, sealed outdoor refrigerators, and side burners built from heavy-gauge stainless resist outdoor corrosion.` },
        { factor: 'Countertop Materials', detail: `Leathered granite, poured concrete, or sintered stone (Dekton) resist UV rays and high grill heat without cracking.` },
        { factor: 'Underground Utilities', detail: `Trenching dedicated natural gas lines, exterior electrical subpanels, and hot/cold water supply with winterization shutoffs.` },
      ],
      permitInsight: `Connecting gas lines and underground high-voltage circuits in ${cityName} legally requires licensed trade permits and pressure tests prior to burial.`,
      roiTakeaway: `Outdoor kitchens routinely return over 70% of their investment while creating the ultimate gathering space for family and guests in ${cityName}.`,
    },
    'barndominium-cost': {
      title: `Barndominium & Pole Barn Construction Economics in ${cityName}`,
      summary: `Building a residential barndominium (steel building home) or pole barn residence in ${cityName}, ${stateName} has surged in popularity among landowners, homesteaders, and rural acreage buyers. Engineered steel rigid-frame structures deliver column-free open floor plans, cathedral ceilings, and integrated workshop or RV garages at a fraction of conventional stick-built construction costs.`,
      costFactors: [
        { factor: 'Engineered Concrete Slab Foundation', detail: `Monolithic post-tension or thickened-edge grade beam slabs (4" to 6" thick) must support both high-load shop machinery and interior living partitions in ${cityName}.` },
        { factor: 'Steel Building Kit vs. Wood Pole Framing', detail: `Pre-engineered red-iron steel buildings offer maximum span durability and zero termite risk, while wood post-frame kits reduce upfront framing costs.` },
        { factor: 'Closed-Cell Spray Foam Insulation', detail: `Mandatory for metal homes in ${cityName} to create an airtight thermal envelope, prevent condensation/sweating on metal siding, and lower monthly HVAC bills.` },
        { factor: 'Rural Utilities & Site Prep Infrastructure', detail: `Budgeting for a private water well, septic system, gravel driveway, and 200A electrical service drop is critical for raw land builds in ${stateName}.` },
      ],
      permitInsight: `While rural agricultural parcels in ${stateName} may have fewer aesthetic HOA guidelines, residential barndominiums still require standard residential building, septic, and electrical permits in ${cityName} county jurisdictions.`,
      roiTakeaway: `Combining living quarters with a 1,000+ sq ft workshop or garage provides unmatched square-footage utility, holding strong appraised resale value across the ${stateName} acreage market.`,
    },
  };

  return toolDetails[toolType] || toolDetails['rent-vs-buy'];
}

export default async function RealEstateToolPage({ params }: PageProps) {
  const resolvedParams = await params;
  const parsed = parseSlug(resolvedParams.slug);
  if (!parsed) notFound();

  const { toolType, citySlug } = parsed;

  let location = null;
  const { data: dbLoc } = await supabase
    .from('pseo_locations')
    .select('*')
    .eq('slug', citySlug)
    .single();
    
  if (dbLoc) {
    location = dbLoc;
  } else {
    location = USA_CITIES_FALLBACK.find(c => c.slug === citySlug);
  }

  if (!location) {
    // Dynamic fallback for missing cities in state hubs
    const stateSuffixes = ['-texas', '-california', '-florida', '-georgia', '-washington', '-arizona', '-illinois', '-colorado', '-north-carolina', '-tennessee', '-nevada', '-utah'];
    for (const suffix of stateSuffixes) {
      if (citySlug.endsWith(suffix)) {
        const rawCity = citySlug.slice(0, -suffix.length);
        const formatWord = (str: string) => str.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        location = {
          slug: citySlug,
          city_name: formatWord(rawCity),
          state_name: formatWord(suffix.replace('-', '')),
          country: 'USA'
        };
        break;
      }
    }
  }

  if (!location) notFound();

  let toolName = '';
  let CalculatorComponent = null;

  if (toolType === 'rent-vs-buy') {
    toolName = 'Rent vs. Buy Calculator';
    CalculatorComponent = USARentVsBuyCalculator;
  } else if (toolType === 'property-tax') {
    toolName = 'Property Tax Calculator';
    CalculatorComponent = USAPropertyTaxCalculator;
  } else if (toolType === 'salary-needed-to-buy') {
    toolName = 'Salary Needed to Buy a House';
    CalculatorComponent = USASalaryCalculator;
  } else if (toolType === 'remodel-roi') {
    toolName = 'Remodel ROI Calculator';
    CalculatorComponent = USARemodelROICalculator;
  } else if (toolType === 'kitchen-remodel') {
    toolName = 'Kitchen Remodel Cost Estimator';
    CalculatorComponent = USAKitchenRemodelCalculator;
  } else if (toolType === 'bathroom-remodel') {
    toolName = 'Bathroom Remodel Cost Estimator';
    CalculatorComponent = USABathroomRemodelCalculator;
  } else if (toolType === 'home-addition') {
    toolName = 'Home Addition Cost Estimator';
    CalculatorComponent = USAHomeAdditionCalculator;
  } else if (toolType === 'swimming-pool-cost') {
    toolName = 'Swimming Pool Cost Estimator';
    CalculatorComponent = USASwimmingPoolCalculator;
  } else if (toolType === 'pickleball-court-cost') {
    toolName = 'Pickleball Court Cost Estimator';
    CalculatorComponent = USAPickleballCalculator;
  } else if (toolType === 'outdoor-kitchen-cost') {
    toolName = 'Outdoor Kitchen Cost Estimator';
    CalculatorComponent = USAOutdoorKitchenCalculator;
  } else if (toolType === 'barndominium-cost') {
    toolName = 'Barndominium & Pole Barn Cost Estimator';
    CalculatorComponent = USABarndominiumCalculator;
  }

  const faqs = [];
  if (toolType === 'rent-vs-buy') {
    faqs.push({
      question: `Is it better to rent or buy in ${location.city_name} right now?`,
      answer: `The decision to rent or buy in ${location.city_name}, ${location.state_name} depends on your current interest rate, property tax rate, and how long you plan to stay. Use our calculator above to compare the exact 5-year cost of renting versus building equity through a mortgage in the local ${location.city_name} market.`
    });
    faqs.push({
      question: `How much down payment do I need for a house in ${location.city_name}?`,
      answer: `While the traditional down payment is 20%, many lenders in ${location.state_name} offer conventional loans for as little as 3-5% down, and FHA loans at 3.5%. Keep in mind that putting down less than 20% in ${location.city_name} will usually require Private Mortgage Insurance (PMI).`
    });
  } else if (toolType === 'property-tax') {
    faqs.push({
      question: `How are property taxes calculated in ${location.city_name}?`,
      answer: `Property taxes in ${location.city_name}, ${location.state_name} are calculated based on the assessed value of your home multiplied by the local tax rate. This rate funds local services like public schools, infrastructure, and emergency services.`
    });
    faqs.push({
      question: `Does my monthly mortgage payment include ${location.city_name} property taxes?`,
      answer: `Yes, in most cases. If you have an escrow account, your lender will collect a portion of your annual ${location.city_name} property tax every month along with your principal and interest, and they will pay the tax bill on your behalf when it is due.`
    });
  } else if (toolType === 'salary-needed-to-buy') {
    faqs.push({
      question: `What salary do I need to afford a median home in ${location.city_name}?`,
      answer: `The exact salary needed depends on the current interest rates and your debt-to-income (DTI) ratio. Lenders generally recommend that your housing payment (PITI) does not exceed 28% of your gross monthly income in ${location.city_name}.`
    });
  } else if (toolType === 'remodel-roi') {
    faqs.push({
      question: `What home renovations add the most value in ${location.city_name}?`,
      answer: `In ${location.city_name}, ${location.state_name}, kitchen remodels, bathroom updates, and adding usable square footage typically yield the highest Return on Investment (ROI) when it comes time to sell your property.`
    });
  } else if (toolType === 'kitchen-remodel') {
    faqs.push({
      question: `How much does a kitchen remodel cost in ${location.city_name}?`,
      answer: `The cost varies significantly based on size and materials. Use our ${location.city_name} Kitchen Remodel Estimator above to get a breakdown of cabinets, countertops, and labor costs.`
    });
    faqs.push({
      question: `Do I need a permit for a kitchen remodel in ${location.city_name}?`,
      answer: `Usually, yes. If you are moving plumbing or electrical lines, ${location.city_name} building codes require permits. Replacing cabinets or countertops generally does not require a permit.`
    });
  } else if (toolType === 'bathroom-remodel') {
    faqs.push({
      question: `How much does an average bathroom remodel cost in ${location.city_name}?`,
      answer: `In ${location.city_name}, ${location.state_name}, a full bathroom remodel typically costs between $10,500 for a cosmetic upgrade and $28,000+ for a luxury primary bath suite. Use our calculator above to tailor the estimate for your exact dimensions.`
    });
    faqs.push({
      question: `What is the typical return on investment (ROI) for a bathroom remodel in ${location.city_name}?`,
      answer: `Homeowners in ${location.city_name} can generally recoup 60% to 75% of their bathroom remodel investment at resale, making it one of the highest-value interior upgrades alongside kitchen renovations.`
    });
  } else if (toolType === 'home-addition') {
    faqs.push({
      question: `How much does it cost to add a room in ${location.city_name}?`,
      answer: `Costs depend on whether you are building a sunroom, a bedroom, or a second story. Use our Home Addition Cost Estimator to check local pricing for ${location.city_name}, ${location.state_name}.`
    });
  } else if (toolType === 'swimming-pool-cost') {
    faqs.push({
      question: `How much does it cost to build a pool in ${location.city_name}?`,
      answer: `The cost of pool construction in ${location.city_name} depends heavily on the material (gunite vs fiberglass) and size. Use our Swimming Pool Cost Estimator above to get a tailored estimate.`
    });
    faqs.push({
      question: `Who are the best pool builders in ${location.city_name}?`,
      answer: `When looking for pool contractors in ${location.city_name}, ${location.state_name}, always ensure they are fully licensed and bonded. Get at least 3 quotes and compare them against our cost estimator.`
    });
  } else if (toolType === 'pickleball-court-cost') {
    faqs.push({
      question: `What are the standard dimensions for a pickleball court in ${location.city_name}?`,
      answer: `The standard size for a pickleball court is 20 feet wide by 44 feet long. However, it's recommended to have a total playing area of 30 feet by 60 feet in ${location.city_name} to allow room for out-of-bounds play.`
    });
    faqs.push({
      question: `Will a pickleball court increase my property value in ${location.city_name}?`,
      answer: `Yes, adding a pickleball court can increase your property value in ${location.city_name}, ${location.state_name}. It's a highly sought-after amenity that appeals to buyers of all ages.`
    });
  } else if (toolType === 'outdoor-kitchen-cost') {
    faqs.push({
      question: `Do I need a permit to build an outdoor kitchen in ${location.city_name}?`,
      answer: `In ${location.city_name}, permits are typically required for outdoor kitchens, especially if you are running new electrical, gas, or plumbing lines.`
    });
    faqs.push({
      question: `What is the ROI of an outdoor kitchen in ${location.city_name}?`,
      answer: `An outdoor kitchen in ${location.city_name}, ${location.state_name} can offer an ROI of 55% to 200%, depending on the quality of materials and features.`
    });
  } else if (toolType === 'barndominium-cost') {
    faqs.push({
      question: `How much does it cost to build a barndominium in ${location.city_name}?`,
      answer: `In ${location.city_name}, ${location.state_name}, turn-key barndominiums typically range between $90 and $150 per square foot for living quarters, with unfinished shop or barn space costing $25 to $45 per sq ft. Pre-engineered steel building shells alone run approximately $20 to $35 per sq ft before interior build-out.`
    });
    faqs.push({
      question: `Are barndominiums cheaper than traditional homes in ${location.state_name}?`,
      answer: `Yes, building a barndominium in ${location.state_name} generally saves 25% to 40% compared to traditional stick-built construction. Savings stem from clear-span pre-fabricated steel framing, rapid erection timelines, and lower exterior maintenance costs over the lifetime of the home.`
    });
  }

  const guide = getLocalGuideContent(toolType, location.city_name, location.state_name);

  let stateHubLink = '/real-estate';
  const stateLower = location.state_name.toLowerCase();
  if (stateLower === 'texas') stateHubLink = '/real-estate/texas';
  else if (stateLower === 'florida') stateHubLink = '/real-estate/florida';
  else if (stateLower === 'california') stateHubLink = '/real-estate/california';

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": `${toolName} - ${location.city_name}, ${location.state_name}`,
      "applicationCategory": "RealEstateApplication",
      "operatingSystem": "All",
      "description": `Free 2026 ${toolName.toLowerCase()} for ${location.city_name}, ${location.state_name}. Accurate local labor, material, and financial projections.`,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.homedesignenglish.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "USA Real Estate",
          "item": "https://www.homedesignenglish.com/real-estate"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": `${location.city_name}, ${location.state_name}`,
          "item": `https://www.homedesignenglish.com/real-estate/${resolvedParams.slug}`
        }
      ]
    },
    {
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
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2 flex-wrap">
          <a href="/" className="hover:text-white transition-colors">Home</a>
          <span>/</span>
          <a href="/real-estate" className="hover:text-white transition-colors">USA Real Estate</a>
          <span>/</span>
          <a href={stateHubLink} className="hover:text-white transition-colors">{location.state_name}</a>
          <span>/</span>
          <span className="text-primary-300 font-semibold">{toolName} in {location.city_name}</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-800/80 border border-primary-600/50 text-primary-200 text-xs font-semibold mb-4">
            <span>🇺🇸</span> Localized 2026 Housing &amp; Construction Data
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight">
            {toolName} for {location.city_name}, {location.state_name}
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Transparent, contractor-accurate calculations tailored for homeowners and buyers in {location.city_name}.
          </p>
        </div>
      </div>

      {/* Calculator Container */}
      <div className="max-w-4xl mx-auto py-10 px-4">
        {CalculatorComponent && <CalculatorComponent />}
      </div>

      {/* Static Sample Calculation Section for SEO */}
      {(() => {
        const sample = getSampleCalculation(toolType, location.city_name, location.state_name);
        if (!sample) return null;
        return (
          <div className="max-w-4xl mx-auto py-10 px-4 border-t border-slate-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              Sample {toolName} Breakdown for {location.city_name}, {location.state_name}
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              {sample.description}
            </p>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {sample.data.map((item, idx) => (
                  <div key={idx} className="p-4 flex justify-between items-center">
                    <span className="text-slate-600 font-medium text-sm">{item.label}</span>
                    <span className="text-slate-900 font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-primary-700 font-semibold bg-primary-50 p-4 rounded-xl border border-primary-200">
              <i className="fas fa-lightbulb text-primary-600 mr-2"></i>
              {sample.verdict}
            </p>
          </div>
        );
      })()}

      {/* Deep Local Market & Cost Factors Guide (Pillar SEO Content) */}
      <div className="max-w-4xl mx-auto py-12 px-4 border-t border-slate-200">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            {guide.title}
          </h2>
          <p className="text-slate-700 leading-relaxed mb-8 text-base sm:text-lg">
            {guide.summary}
          </p>

          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Key Cost Drivers in {location.city_name}, {location.state_name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {guide.costFactors.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                  {item.factor}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200">
              <div className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-2">
                <i className="fas fa-shield-alt text-amber-600"></i>
                Permits &amp; Municipal Code Compliance
              </div>
              <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
                {guide.permitInsight}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="font-bold text-emerald-900 text-sm mb-1 flex items-center gap-2">
                <i className="fas fa-chart-line text-emerald-600"></i>
                Financial Takeaway &amp; Resale Value
              </div>
              <p className="text-emerald-800 text-xs sm:text-sm leading-relaxed">
                {guide.roiTakeaway}
              </p>
            </div>
          </div>

          {/* Homeowner Action Checklist */}
          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-lg font-bold text-slate-900 mb-4">
              Homeowner Best Practices Checklist for {location.city_name}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                <span><strong>Always Obtain 3 Written Bids:</strong> Compare itemized material and labor quotes rather than lump-sum figures.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                <span><strong>Verify State Contractor Licensing:</strong> Check active general liability and workers&apos; compensation policies before signing contracts in {location.state_name}.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                <span><strong>Maintain a 15% Contingency Buffer:</strong> Keep an unallocated cash reserve to cover unforeseen framing, electrical, or plumbing upgrades during construction.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <i className="fas fa-check-circle text-emerald-500 mt-0.5"></i>
                <span><strong>Require Milestone Payments:</strong> Never pay more than 10% to 15% upfront; tie subsequent payments to passed municipal building inspections.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Related Tools Cross-Linking Section */}
      <div className="max-w-4xl mx-auto py-12 px-4 border-t border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">
          More Real Estate Tools for {location.city_name}, {location.state_name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {ALL_TOOLS.filter(t => t.id !== toolType).map(tool => (
            <a 
              key={tool.id} 
              href={`/real-estate/${tool.id}-in-${citySlug}`}
              className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-primary-400 transition-all flex items-center gap-3.5 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{tool.icon}</span>
              <span className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors text-sm">
                {tool.name}
              </span>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href={stateHubLink}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-semibold text-sm hover:underline"
          >
            Explore all {location.state_name} Cities &amp; Real Estate Guides &rarr;
          </a>
        </div>
      </div>

      {/* Dynamic FAQ Section */}
      {faqs.length > 0 && (
        <div className="max-w-4xl mx-auto py-12 px-4 border-t border-slate-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
