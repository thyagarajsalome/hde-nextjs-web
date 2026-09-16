export type CalculatorTier = 'free' | 'pro';

export const PRO_CALCULATOR_IDS = new Set<string>([
  'materials',
  'india-kitchen',
  'india-bathroom',
  'interior',
  'flooring',
  'painting',
  'usa-home-addition',
  'usa-swimming-pool',
  'usa-pickleball-court',
  'usa-outdoor-kitchen'
]);

export const isProCalculator = (id: string): boolean => {
  return PRO_CALCULATOR_IDS.has(id);
};

export const PRO_CALCULATOR_DETAILS: Record<string, { name: string; subtitle: string; bullets: string[] }> = {
  'materials': {
    name: 'Material Quantity & Detailed BOQ Estimator',
    subtitle: 'Unlock complete 7-phase structural bill of quantities, precise brand-grade cement & steel schedules, wastage allowances, and contractor-ready BOQ spreadsheets.',
    bullets: [
      'Comprehensive 7-Phase structural RCC & masonry material takeoff',
      'Detailed bag counts, TMT steel kg, aggregate/sand cft & brick volumes',
      'Contractor & Bank-ready Excel/PDF BOQ spreadsheet with no watermarks'
    ]
  },
  'india-kitchen': {
    name: 'Modular Kitchen Cost Estimator & BOQ',
    subtitle: 'Unlock detailed room-by-room hardware takeoff, IS:710 Marine ply vs HDHMR pricing, and exportable contractor quotation.',
    bullets: [
      'Itemized base & wall cabinet running-feet schedule',
      'Hardware brand selection (Hettich, Hafele, Blum soft-close)',
      'Bank & Contractor PDF quotation export with no watermarks'
    ]
  },
  'india-bathroom': {
    name: 'Bathroom Renovation & Plumbing Estimator',
    subtitle: 'Unlock complete wet/dry sanitaryware costs, 3-coat waterproofing schedule, and concealed diverter fittings.',
    bullets: [
      'Tile area takeoff with 15% wastage and waterproofing specs',
      'Luxury CP fittings & sanitaryware brands (Kohler, Jaquar, Grohe)',
      'Contractor-ready scope of work & PDF estimate'
    ]
  },
  'interior': {
    name: 'Full Home Interior Estimator',
    subtitle: 'Unlock complete 1BHK, 2BHK, 3BHK and villa interior estimation with false ceiling, woodwork, and designer finishes.',
    bullets: [
      'Comprehensive room-by-room woodwork & wardrobe schedule',
      'Gypsum false ceiling, electrical coving & ambient lighting takeoff',
      'Detailed contractor-grade Excel/PDF quotation'
    ]
  },
  'flooring': {
    name: 'Flooring & Tiling Estimator',
    subtitle: 'Unlock full material takeoff for Vitrified, GVT, Italian Marble, Granite, and Wooden Laminate flooring.',
    bullets: [
      'Accurate room-wise tile box calculations & mortar/adhesive quantities',
      'Diamond mirror polishing & skirting takeoff',
      'Exportable PDF material quotation'
    ]
  },
  'painting': {
    name: 'Painting & Surface Preparation Estimator',
    subtitle: 'Unlock complete interior and exterior wall takeoff with 2-coat putty, primer, and luxury emulsion brand pricing.',
    bullets: [
      'Exact paint bucket & primer quantity requirement',
      'Asian Paints, Berger, Nerolac & Dulux price comparisons',
      'Contractor labor & material breakdown PDF'
    ]
  },
  'usa-home-addition': {
    name: 'Home Addition Cost Estimator',
    subtitle: 'Unlock full structural square footage breakdown, foundation, framing, roofing, and interior finishing estimates.',
    bullets: [
      'Permit, architectural, and contractor fee breakdown',
      'Room-type specific construction cost analysis',
      'Client-ready PDF estimate report'
    ]
  },
  'usa-swimming-pool': {
    name: 'Swimming Pool Construction Estimator',
    subtitle: 'Unlock gunite, fiberglass, vinyl, and decking cost breakdowns with filtration, heating, and lighting options.',
    bullets: [
      'Excavation, coping, and pool equipment takeoff',
      'Decking square footage and enclosure cost calculator',
      'Printable contractor proposal PDF'
    ]
  },
  'usa-pickleball-court': {
    name: 'Backyard Pickleball Court Estimator',
    subtitle: 'Unlock post-tension concrete pad, multi-layer acrylic surfacing, tournament fencing, and LED lighting takeoffs.',
    bullets: [
      'Official regulation 30×60 pad excavation & concrete costs',
      'Cushioned acrylic tournament surfacing options',
      'Itemized contractor PDF estimate'
    ]
  },
  'usa-outdoor-kitchen': {
    name: 'Outdoor Kitchen & Living Estimator',
    subtitle: 'Unlock linear-feet stone masonry, countertop materials, luxury appliance suites, and utility trenching takeoffs.',
    bullets: [
      'Stacked stone, brick, and stucco island construction costs',
      'Gas, electric, and plumbing utility hookup estimates',
      'Contractor-ready bid & proposal PDF'
    ]
  }
};
