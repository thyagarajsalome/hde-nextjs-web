import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/config/supabaseClient';
import USARentVsBuyCalculator from '@/features/construction/USARentVsBuyCalculator';
import USAPropertyTaxCalculator from '@/features/construction/USAPropertyTaxCalculator';
import USASalaryCalculator from '@/features/construction/USASalaryCalculator';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate static routes for all USA locations x 3 tools
export async function generateStaticParams() {
  const { data: locations } = await supabase
    .from('pseo_locations')
    .select('slug')
    .eq('country', 'USA');

  if (!locations) return [];

  const params: { slug: string }[] = [];
  for (const loc of locations) {
    params.push({ slug: `rent-vs-buy-in-${loc.slug}` });
    params.push({ slug: `property-tax-in-${loc.slug}` });
    params.push({ slug: `salary-needed-to-buy-in-${loc.slug}` });
  }

  return params;
}

// Helper to parse slug
function parseSlug(slug: string) {
  const match = slug.match(/^(rent-vs-buy|property-tax|salary-needed-to-buy)-in-(.+)$/);
  if (!match) return null;
  return {
    toolType: match[1],
    citySlug: match[2],
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseSlug(params.slug);
  if (!parsed) return { title: 'Not Found' };

  const { toolType, citySlug } = parsed;

  const { data: location } = await supabase
    .from('pseo_locations')
    .select('city_name, state_name')
    .eq('slug', citySlug)
    .single();

  if (!location) return { title: 'Not Found' };

  let titlePrefix = '';
  if (toolType === 'rent-vs-buy') titlePrefix = 'Rent vs. Buy Calculator';
  else if (toolType === 'property-tax') titlePrefix = 'Property Tax Calculator';
  else if (toolType === 'salary-needed-to-buy') titlePrefix = 'Salary Needed to Buy a House';

  return {
    title: `${titlePrefix} in ${location.city_name}, ${location.state_name} | HDE`,
    description: `Use our free ${titlePrefix.toLowerCase()} for ${location.city_name}, ${location.state_name} to make informed real estate decisions.`,
  };
}

export default async function RealEstateToolPage({ params }: PageProps) {
  const parsed = parseSlug(params.slug);
  if (!parsed) notFound();

  const { toolType, citySlug } = parsed;

  const { data: location } = await supabase
    .from('pseo_locations')
    .select('*')
    .eq('slug', citySlug)
    .single();

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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {toolName} for {location.city_name}, {location.state_name}
          </h1>
          <p className="text-xl text-primary-50">
            Make informed decisions about real estate in {location.city_name} with our precise calculator tools.
          </p>
        </div>
      </div>

      {/* Calculator Container */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        {CalculatorComponent && <CalculatorComponent />}
      </div>
    </div>
  );
}
