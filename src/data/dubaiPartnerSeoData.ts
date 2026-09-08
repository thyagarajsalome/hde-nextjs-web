import { DUBAI_AREAS } from './dubaiAreas';

export interface PartnerSeoItem {
  slug: string;
  type: 'area' | 'guide';
  title: string;
  metaDescription: string;
  keywords: string;
  headline: string;
  subheadline: string;
  badge: string;
  areaSlug?: string;
  areaName?: string;
  stats: {
    label: string;
    value: string;
    sub: string;
  }[];
  overview: string[];
  buyerProfile: {
    targetAudience: string;
    averageBudget: string;
    inquiryVelocity: string;
    primarySourceMarkets: string[];
  };
  partnerBenefits: {
    icon: string;
    title: string;
    desc: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

// 1. Generate 15 Community-Specific RERA Broker Partner Landing Pages
const AREA_PARTNER_DATA: Record<string, PartnerSeoItem> = {};

DUBAI_AREAS.forEach((area) => {
  const isLuxury = ['palm-jumeirah', 'downtown-dubai', 'dubai-hills-estate', 'mohammed-bin-rashid-city'].includes(area.slug);
  const isHighYield = ['jumeirah-village-circle', 'dubai-silicon-oasis', 'dubai-sports-city', 'jumeirah-lake-towers'].includes(area.slug);

  const avgPriceSnippet = area.priceRange.oneBed !== 'N/A' 
    ? `starting from ${area.priceRange.oneBed}` 
    : `from ${area.priceRange.studio}`;

  AREA_PARTNER_DATA[area.slug] = {
    slug: area.slug,
    type: 'area',
    areaSlug: area.slug,
    areaName: area.name,
    badge: `RERA Specialist Network • ${area.name}`,
    title: `RERA Property Broker Partner Network in ${area.name} | HDE Dubai`,
    metaDescription: `Join the HDE Broker Network for ${area.name}. Receive pre-qualified Indian, UK, and international property buyer leads for ${area.name} with zero upfront fees.`,
    keywords: `${area.name.toLowerCase()} real estate broker partner, rera agent ${area.name.toLowerCase()}, sell property in ${area.name.toLowerCase()}, buy leads ${area.name.toLowerCase()} dubai, co-brokerage ${area.name.toLowerCase()}`,
    headline: `Receive Pre-Qualified Buyer Inquiries for ${area.name}`,
    subheadline: `Connect directly with high-intent investors and homeowners actively researching ${area.name} property on Home Design English. Fair 25% closing referral, 0 upfront fee.`,
    stats: [
      { label: "Community Rental Yield", value: area.rentalYield, sub: "Gross Annual Yield" },
      { label: "Entry Price Point", value: avgPriceSnippet, sub: "Typical 1-Bed / Studio" },
      { label: "Overseas Buyer Demand", value: isLuxury ? "Ultra High (HNI)" : isHighYield ? "High (Yield Seekers)" : "Strong (End-Users)", sub: "Verified Inquiries" },
      { label: "Broker Commission Share", value: "25% Co-Brokerage", sub: "Disbursed Post-Closing Only" },
    ],
    overview: [
      `${area.name} is one of Dubai's most active real estate corridors, known for ${area.tagline.toLowerCase()} and attractive investment metrics. Home Design English attracts thousands of qualified international buyers monthly—particularly high-net-worth individuals and families from India, the UK, Europe, and GCC—who use our localized calculators and community guides to plan their acquisitions.`,
      `Through the HDE Partner Network, licensed RERA brokers and registered agencies with proven transaction history in ${area.name} receive direct, verified buyer introductions. Every inquiry specifies the client's target property type (${area.propertyTypes.join(', ')}), timeline, financing preference, and budget.`,
      `We believe in transparent, performance-based growth: joining is completely free with zero listing fees or monthly subscriptions. You only disburse our standard 25% referral fee after you successfully close the transaction and receive your brokerage fee from the developer or seller.`
    ],
    buyerProfile: {
      targetAudience: isLuxury 
        ? "HNIs, Ultra-HNIs, Golden Visa Applicants, and Luxury Holiday Home Investors" 
        : isHighYield 
        ? "Expat Landlords, Tech Professionals, Long-Term Passive Income Investors" 
        : "End-User Families, Expatriate Residents, and Cross-Border First-Time Buyers",
      averageBudget: isLuxury 
        ? "AED 3.5M to AED 25M+" 
        : isHighYield 
        ? "AED 650K to AED 1.8M" 
        : "AED 1.2M to AED 4M",
      inquiryVelocity: "Active Weekly International Submissions",
      primarySourceMarkets: ["India (Mumbai, Delhi-NCR, Bengaluru)", "United Kingdom (London)", "United States", "GCC & Expats in UAE"],
    },
    partnerBenefits: [
      {
        icon: "fas fa-bullseye",
        title: `Pre-Qualified ${area.name} Inquiries`,
        desc: `Leads specify ${area.name} as their explicit target community, ensuring zero wasted time pitching mismatched locations.`
      },
      {
        icon: "fas fa-shield-alt",
        title: "RERA Compliant & Escrow Safe",
        desc: "All introductions are conducted under our transparent digital 25% referral agreement, adhering strictly to DLD and fair-use guidelines."
      },
      {
        icon: "fas fa-bolt",
        title: "Instant WhatsApp & Email Routing",
        desc: "Receive client details immediately upon inquiry submission with phone, WhatsApp, email, and preferred property specifications."
      },
      {
        icon: "fas fa-hand-holding-dollar",
        title: "Zero Upfront Cost",
        desc: "No onboarding fee or monthly subscription. Disburse a 25% co-brokerage share only when your deal successfully registers with DLD."
      }
    ],
    faqs: [
      {
        question: `How does HDE generate buyer leads for ${area.name}?`,
        answer: `Home Design English ranks organically across top international real estate search queries, providing interactive Dubai buying cost calculators, DLD fee estimators, and in-depth guides for ${area.name}. Buyers requesting consultation are routed to verified partner brokers covering that community.`
      },
      {
        question: `Can I register as an individual broker or does my agency need to sign up?`,
        answer: `Both are supported. An individual licensed agent can register using their active RERA Broker Card (BRN) and their sponsoring agency's Office Registration Number (ORN). Agency managing directors can also register their entire team.`
      },
      {
        question: `What happens if an introduced client buys in a different community?`,
        answer: `If a buyer initially inquiring about ${area.name} chooses a property in another community through your brokerage, the standard 25% referral terms apply to the completed transaction.`
      },
      {
        question: `How fast is the verification process?`,
        answer: `Standard applications are verified within 24–48 hours against official public DLD registers. Pro Partner applications receive fast-track audit in under 2 hours.`
      }
    ]
  };
});

// 2. 4 High-Intent B2B Partner Guides
const B2B_GUIDES_DATA: Record<string, PartnerSeoItem> = {
  'indian-property-buyers-dubai': {
    slug: 'indian-property-buyers-dubai',
    type: 'guide',
    badge: 'Cross-Border Capital • India to Dubai',
    title: 'How to Connect with Indian Property Buyers in Dubai | RERA Broker Guide',
    metaDescription: 'Strategic guide for Dubai RERA brokers: How to reach Indian HNI real estate investors, RBI LRS remittance limits, Golden Visa rules, and HDE co-brokerage partnerships.',
    keywords: 'indian property buyers dubai, sell dubai property in india, rbi lrs remittance dubai property, dubai real estate broker indian clients, indian investors dubai property',
    headline: 'Connect with High-Intent Indian Real Estate Buyers in Dubai',
    subheadline: 'Indians represent the #1 foreign buyer demographic in Dubai real estate. Learn how to partner with HDE to receive pre-qualified Indian NRI and HNI inquiries.',
    stats: [
      { label: "Indian Buyer Share", value: "20–24%", sub: "Of Total Dubai Foreign Volume" },
      { label: "RBI LRS Remittance", value: "$250K / Person", sub: "Annual Permitted Limit" },
      { label: "Golden Visa Minimum", value: "AED 2,000,000", sub: "Eligible for 10-Year Residency" },
      { label: "Average Inquiry Budget", value: "₹2.5 Cr – ₹10 Cr+", sub: "AED 1.1M – AED 4.5M+" },
    ],
    overview: [
      `Indian nationals consistently rank as the single largest foreign buyer demographic in the Dubai real estate market, contributing over AED 30+ Billion in property investments annually. From Tier-1 metro cities like Mumbai, Delhi-NCR, Bengaluru, and Hyderabad to successful NRIs based in the Middle East and the West, Indian demand for Dubai assets is driven by high rental yields (6–9%), zero income/capital gains tax, and the UAE 10-Year Golden Visa.`,
      `However, converting Indian buyers requires nuanced expertise: handling Reserve Bank of India (RBI) Liberalised Remittance Scheme (LRS) transfer timelines, explaining DLD 4% registration fees in Indian Rupees (INR), and understanding preference for branded developer launches (Emaar, Sobha, Damac, Ellington, Nakheel).`,
      `Home Design English (HDE) is engineered specifically as a trusted bridge between India and global real estate markets. We provide localized INR currency toggles, multi-currency ROI projections, and educational cross-border content. By joining the HDE Partner Network, licensed Dubai brokers gain direct access to this highly lucrative client pipeline.`
    ],
    buyerProfile: {
      targetAudience: "Indian Tech Founders, Industrialists, Doctors, Corporate Executives & Gulf NRIs",
      averageBudget: "AED 1,200,000 to AED 8,000,000+ (₹2.7 Cr to ₹18 Cr+)",
      inquiryVelocity: "Highest Daily Volume Across Platform",
      primarySourceMarkets: ["Mumbai & Pune (Maharashtra)", "Delhi-NCR & Gurugram", "Bengaluru (Karnataka)", "Hyderabad (Telangana)", "NRI Hubs (UK, Singapore, USA)"],
    },
    partnerBenefits: [
      {
        icon: "fas fa-flag",
        title: "Dedicated India Lead Pipeline",
        desc: "Receive pre-qualified inquiries from buyers who have already calculated exact INR investment values and DLD registration costs."
      },
      {
        icon: "fas fa-passport",
        title: "Golden Visa Readiness",
        desc: "Over 65% of our Indian inquiries target AED 2M+ units to qualify for 10-year residency for their families."
      },
      {
        icon: "fas fa-money-bill-transfer",
        title: "LRS-Aware Buyers",
        desc: "Clients understand the $250,000/year per individual LRS quota and are primed for multi-family remittance strategies."
      },
      {
        icon: "fas fa-handshake",
        title: "Zero Retainer or Upfront Fee",
        desc: "Pay only a 25% co-brokerage referral upon successful conveyance and clearance of funds with the developer or DLD."
      }
    ],
    faqs: [
      {
        question: "How do Indian buyers transfer funds legally to Dubai?",
        answer: "Indian resident individuals utilize the Reserve Bank of India's Liberalised Remittance Scheme (LRS), which permits legal transfer of up to USD 250,000 per financial year per family member directly to a registered Dubai developer escrow account."
      },
      {
        question: "Which Dubai areas do Indian buyers prefer most?",
        answer: "High-volume demand centers on Downtown Dubai, Business Bay, Dubai Marina, Dubai Hills Estate, JVC (for high rental yield), and Sobha Hartland (MBR City)."
      },
      {
        question: "Can partner brokers connect with Indian buyers directly via WhatsApp?",
        answer: "Yes. Every HDE buyer inquiry contains verified WhatsApp phone numbers, enabling immediate 1-on-1 consultations, digital brochures, and video walkthroughs."
      }
    ]
  },

  'real-estate-referral-program-dubai': {
    slug: 'real-estate-referral-program-dubai',
    type: 'guide',
    badge: 'Co-Brokerage Framework • Dubai',
    title: 'Dubai Real Estate Agent Referral Program | 25% Co-Brokerage Terms | HDE',
    metaDescription: 'Explore the HDE Dubai Real Estate Broker Referral Program. Learn how co-brokerage works, 25% closing referral terms, lead dispatch protocols, and broker qualification.',
    keywords: 'dubai real estate referral program, co-brokerage agreement dubai, real estate agent lead referral dubai, rera broker partnership, dubai property referral commission',
    headline: 'The Transparent Dubai Real Estate Broker Referral Program',
    subheadline: 'Scale your transaction volume with verified buyer introductions from overseas. 0 upfront risk, clear 25% closing commission, and fast-track digital onboarding.',
    stats: [
      { label: "Referral Fee Share", value: "25%", sub: "Of Earned Brokerage Fee" },
      { label: "Upfront Cost", value: "AED 0", sub: "Standard Tier Is Free Forever" },
      { label: "Lead Dispatch Window", value: "< 60 Sec (Pro)", sub: "Instant WhatsApp & Email" },
      { label: "Lead Exclusivity", value: "Max 2 Brokers", sub: "No Saturated Lead Lists" },
    ],
    overview: [
      `In the hyper-competitive Dubai real estate market, acquiring international buyers through Google Ads or social media lead forms has become prohibitively expensive, often resulting in low-quality leads, wrong numbers, and budget mismatches.`,
      `The Home Design English (HDE) Real Estate Referral Program offers a radically better model for licensed RERA brokers. We invest in high-ranking organic content, interactive government fee calculators, and authoritative area guides that educate prospective buyers before they ever submit an inquiry.`,
      `When an investor requests consultation on HDE, they have already configured their budget, understood 4% DLD fees, and selected their target community. We route these high-intent leads to certified partner brokers under our standardized 25% co-brokerage referral agreement.`
    ],
    buyerProfile: {
      targetAudience: "Global Investors, Relocating Families, Expatriates, and Institutional Buyers",
      averageBudget: "AED 1.5M to AED 12M",
      inquiryVelocity: "Continuous Inflow Across 15 Featured Areas",
      primarySourceMarkets: ["India", "United Kingdom", "United States", "Germany", "GCC Region"],
    },
    partnerBenefits: [
      {
        icon: "fas fa-filter-circle-dollar",
        title: "Pre-Educated Clients",
        desc: "Buyers have already used our financial tools and know their exact cash requirements, resulting in 4x higher closing ratios."
      },
      {
        icon: "fas fa-users-slash",
        title: "Strict Anti-Saturation Rule",
        desc: "We never distribute inquiries to dozens of agents. Pro partners enjoy maximum 2-broker routing for optimal conversion."
      },
      {
        icon: "fas fa-file-contract",
        title: "Clear 25% Referral Terms",
        desc: "Transparent, enforceable digital agreement. No hidden charges, no recurring retainers, and zero financial liability for non-closings."
      },
      {
        icon: "fas fa-certificate",
        title: "Verified Pro Broker Badge",
        desc: "Pro partners receive our Verified Gold Seal, showcasing credentialed status to potential buyers on the platform."
      }
    ],
    faqs: [
      {
        question: "When is the 25% referral fee disbursed?",
        answer: "The 25% co-brokerage referral is payable only after you have successfully closed the sale, the transaction is registered with DLD or the developer, and your agency has received its commission."
      },
      {
        question: "What happens if the client does not buy?",
        answer: "You owe nothing. Our program is 100% performance-based. There are zero penalties, fees, or obligations for non-converting inquiries."
      },
      {
        question: "How do I prove my RERA license?",
        answer: "During registration, you enter your Broker Registration Number (BRN) and agency Office Registration Number (ORN). Our compliance team validates these against official public DLD registers."
      }
    ]
  },

  'off-plan-lead-generation-dubai': {
    slug: 'off-plan-lead-generation-dubai',
    type: 'guide',
    badge: 'Developer Launches • Off-Plan Strategy',
    title: 'Dubai Off-Plan Property Lead Generation for Brokers | RERA Partner Program',
    metaDescription: 'Discover high-converting off-plan property leads for Dubai brokers. Receive pre-launch and new developer launch inquiries from overseas investors ready to invest.',
    keywords: 'dubai off plan leads, off plan property lead generation dubai, rera off plan broker partnership, developer launch buyers dubai, dubai off plan commission sharing',
    headline: 'High-Converting Off-Plan Property Inquiries for RERA Brokers',
    subheadline: 'Access active investors seeking off-plan developer launches with flexible payment plans in Dubai. 0 upfront fees, performance-based referral.',
    stats: [
      { label: "Off-Plan Market Share", value: "62%", sub: "Of Total Dubai Sales Volume" },
      { label: "Typical Payment Plan", value: "80/20 & 70/30", sub: "Construction-Linked" },
      { label: "Average Developer Comm.", value: "4% – 7%", sub: "Earned by Licensed Brokerages" },
      { label: "HDE Referral Share", value: "25% of Earned Fee", sub: "Only After Developer Payout" },
    ],
    overview: [
      `Off-plan properties represent over 60% of all real estate sales in Dubai. International buyers are drawn to attractive post-handover payment plans, capital appreciation during construction, and launch-day pricing from premier developers like Emaar, Sobha, Damac, Meraas, Nakheel, and Binghatti.`,
      `For brokers, off-plan sales offer higher developer commissions (often 4% to 7%) with faster transaction turnaround and zero seller negotiations. However, finding serious off-plan buyers overseas who have liquidated capital ready for the initial 10%–20% down payment is the primary challenge.`,
      `Home Design English specializes in educational off-plan content. We explain payment structures, escrow account security, and completion milestones. Through our partner network, licensed brokers receive pre-screened off-plan buyer inquiries ready for launch unit allocations.`
    ],
    buyerProfile: {
      targetAudience: "Yield-Driven Investors, First-Time Dubai Buyers, and Speculative High-ROI Capital",
      averageBudget: "AED 950K to AED 5.5M",
      inquiryVelocity: "Surges During Major Developer Launch Weeks",
      primarySourceMarkets: ["India", "United Kingdom", "Canada", "Singapore", "GCC Expats"],
    },
    partnerBenefits: [
      {
        icon: "fas fa-rocket",
        title: "Developer Launch Readiness",
        desc: "Connect with investors who understand token booking deposits, payment milestones, and launch-day allocation mechanics."
      },
      {
        icon: "fas fa-shield-halved",
        title: "Escrow Protection Education",
        desc: "Our users are pre-educated on Law No. 8 (DLD Developer Escrow Accounts), minimizing skepticism and closing objections."
      },
      {
        icon: "fas fa-percentage",
        title: "Lucrative Off-Plan Payouts",
        desc: "Retain 75% of your high developer commission (4%–7%) while acquiring new international clients at zero acquisition cost."
      },
      {
        icon: "fas fa-clock",
        title: "Real-Time Launch Dispatch",
        desc: "Pro partners receive instant alerts on WhatsApp as soon as international buyers express interest in new project launches."
      }
    ],
    faqs: [
      {
        question: "Can I introduce any developer's project to the buyer?",
        answer: "Yes. You have complete independence to recommend whatever licensed DLD off-plan project best fits the buyer's budget and investment parameters."
      },
      {
        question: "How is the referral fee calculated on off-plan sales?",
        answer: "HDE receives 25% of the total gross commission paid to your brokerage by the developer for that specific transaction. You retain 75%."
      },
      {
        question: "What if the developer pays commission in tranches?",
        answer: "If the developer disburses commission in tranches (e.g. 50% on SPA signing and 50% upon 20% milestone), the referral fee is disbursed proportionally upon receipt."
      }
    ]
  },

  'rera-broker-commission-sharing': {
    slug: 'rera-broker-commission-sharing',
    type: 'guide',
    badge: 'Legal & Compliance • RERA Guidelines',
    title: 'RERA Broker Commission Sharing & Co-Brokerage Guidelines | Dubai Real Estate',
    metaDescription: 'Comprehensive compliance guide to RERA commission sharing, Form A/B/I co-brokerage agreements, digital referral rules, and ethical client introduction in Dubai.',
    keywords: 'rera commission sharing, dubai co-brokerage agreement, form i dubai real estate, rera referral fee legal, dubai broker commission rules dld',
    headline: 'RERA Commission Sharing & Co-Brokerage Compliance Guide',
    subheadline: 'Understand the legal frameworks, Form I co-brokerage agreements, and digital client referral guidelines governing licensed Dubai real estate brokerages.',
    stats: [
      { label: "Standard Co-Brokerage", value: "50/50 or 25% Referral", sub: "Industry Norms in Dubai" },
      { label: "DLD Mandatory Form", value: "Form I (Agent-to-Agent)", sub: "Statutory Agreement" },
      { label: "Client Escrow Protection", value: "100% Guaranteed", sub: "Under DLD Directive" },
      { label: "HDE Platform Model", value: "Digital Introducer (25%)", sub: "Non-Affiliated Referral" },
    ],
    overview: [
      `The Real Estate Regulatory Agency (RERA), the regulatory arm of the Dubai Land Department (DLD), maintains strict guidelines governing how licensed brokers share commissions, represent buyers, and execute co-brokerage agreements.`,
      `Under RERA Law No. 85 of 2006 (Regulating the Real Estate Brokers Register), commission sharing is legally recognized and encouraged between registered real estate brokers and authorized corporate client introducers, provided proper contractual disclosures are executed.`,
      `Home Design English (HDE) operates under strict digital client introduction protocols. HDE is not a real estate brokerage and does not represent clients in property transactions, viewings, or contract signings. Instead, HDE introduces verified international prospects to licensed brokerages who execute statutory Unified Contracts (Form A, B, and F). This guide explains how our digital referral agreements comply with all statutory standards.`
    ],
    buyerProfile: {
      targetAudience: "Licensed RERA Brokers, Agency Managing Directors, and Legal Compliance Officers",
      averageBudget: "All Transaction Tiers (AED 500K to AED 50M+)",
      inquiryVelocity: "Institutional & Enterprise B2B Traffic",
      primarySourceMarkets: ["United Arab Emirates (Dubai & Abu Dhabi)"],
    },
    partnerBenefits: [
      {
        icon: "fas fa-scale-balanced",
        title: "Statutory RERA Alignment",
        desc: "Our digital referral terms mirror standard Dubai co-brokerage practices, ensuring total legal safety for your agency license."
      },
      {
        icon: "fas fa-file-signature",
        title: "Digital Form I Equivalent",
        desc: "Transparent mutual agreement defining 25% referral compensation, 14-day post-clearance disbursement, and zero client solicitation."
      },
      {
        icon: "fas fa-shield-virus",
        title: "Fair-Use Public Verification",
        desc: "We verify credentials exclusively against already public official registers, never requesting proprietary corporate secrets."
      },
      {
        icon: "fas fa-eye",
        title: "Auditable Transaction Trail",
        desc: "Clear digital timestamps of buyer inquiries, lead routing, and communication consent protect brokers from co-brokerage disputes."
      }
    ],
    faqs: [
      {
        question: "Is digital referral commission legal under Dubai real estate law?",
        answer: "Yes. Co-brokerage and client referral arrangements are common and legally sanctioned in Dubai under RERA regulations, provided statutory contracts (such as Form I for broker-to-broker agreements) or clear corporate referral agreements are executed."
      },
      {
        question: "Does HDE hold escrow funds or handle deposit cheques?",
        answer: "No. Home Design English never collects, handles, or holds client purchase deposits, booking cheques, or escrow funds. All financial transactions occur directly between the buyer, the DLD-approved developer escrow account, or authorized conveyancing trustees."
      },
      {
        question: "Can our agency use our own standard Form I with HDE?",
        answer: "Yes. In addition to accepting our digital HDE Referral Terms upon portal registration, agency principals can request countersignature on their internal Form I co-brokerage agreements."
      }
    ]
  }
};

// Unified Export
export const ALL_PARTNER_SEO_PAGES: Record<string, PartnerSeoItem> = {
  ...AREA_PARTNER_DATA,
  ...B2B_GUIDES_DATA,
};

export const PARTNER_SEO_SLUGS = Object.keys(ALL_PARTNER_SEO_PAGES);
export const AREA_PARTNER_SLUGS = Object.keys(AREA_PARTNER_DATA);
export const B2B_GUIDE_SLUGS = Object.keys(B2B_GUIDES_DATA);
