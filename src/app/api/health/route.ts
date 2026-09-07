import { NextResponse } from 'next/server';
import { supabase } from '@/config/supabaseClient';
import {
  calculateIndiaEMI,
  calculateIndiaConstruction,
  calculateUSARentVsBuy,
  calculateUSAPropertyTax,
  calculateDubaiBuyingCost,
} from '@/utils/calculatorEngines';

export const dynamic = 'force-dynamic';

export interface HealthCheckItem {
  id: string;
  name: string;
  category: 'Infrastructure' | 'Database' | 'India Mode' | 'USA Mode' | 'UAE Mode';
  status: 'operational' | 'degraded' | 'failed';
  latencyMs: number;
  message: string;
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheckItem[] = [];

  // 1. Supabase Database Check
  const dbStart = Date.now();
  try {
    const { error } = await supabase.from('pseo_locations').select('id').limit(1);
    const latency = Date.now() - dbStart;
    if (error) {
      checks.push({
        id: 'supabase_db',
        name: 'Supabase Database',
        category: 'Database',
        status: 'degraded',
        latencyMs: latency,
        message: `Connected with warning: ${error.message}`,
      });
    } else {
      checks.push({
        id: 'supabase_db',
        name: 'Supabase Database',
        category: 'Database',
        status: 'operational',
        latencyMs: latency,
        message: 'Successfully queried pseo_locations table',
      });
    }
  } catch (err: any) {
    checks.push({
      id: 'supabase_db',
      name: 'Supabase Database',
      category: 'Database',
      status: 'failed',
      latencyMs: Date.now() - dbStart,
      message: err?.message || 'Database connection error',
    });
  }

  // 2. India Calculation Engine (EMI & Construction)
  const inStart = Date.now();
  try {
    const emi = calculateIndiaEMI(3000000, 8.5, 20);
    const constr = calculateIndiaConstruction(1200, 1600, 2300, 3300);
    const isValid = emi.monthlyEmi > 0 && constr.standardCost === 2760000;
    checks.push({
      id: 'engine_india',
      name: 'India Calculation Engine (EMI & Construction)',
      category: 'India Mode',
      status: isValid ? 'operational' : 'failed',
      latencyMs: Date.now() - inStart,
      message: isValid
        ? `Verified: 30L @ 8.5% EMI = ₹${emi.monthlyEmi.toLocaleString('en-IN')}/mo; 1200 sqft Standard = ₹${(constr.standardCost / 100000).toFixed(1)}L`
        : 'Calculation outputs did not match expected mathematical range',
    });
  } catch (err: any) {
    checks.push({
      id: 'engine_india',
      name: 'India Calculation Engine',
      category: 'India Mode',
      status: 'failed',
      latencyMs: Date.now() - inStart,
      message: err?.message || 'India engine runtime error',
    });
  }

  // 3. USA Calculation Engine (Rent vs Buy & Property Tax)
  const usStart = Date.now();
  try {
    const rvb = calculateUSARentVsBuy(400000, 20, 6.5, 30, 2200, 1.8);
    const tax = calculateUSAPropertyTax(350000, 1.8);
    const isValid = rvb.monthlyPiti > 0 && tax.annualPropertyTax === 6300;
    checks.push({
      id: 'engine_usa',
      name: 'USA Calculation Engine (Rent vs Buy & Taxes)',
      category: 'USA Mode',
      status: isValid ? 'operational' : 'failed',
      latencyMs: Date.now() - usStart,
      message: isValid
        ? `Verified: $400k Home PITI = $${rvb.monthlyPiti}/mo; $350k Property Tax = $${tax.annualPropertyTax}/yr`
        : 'USA calculation outputs invalid',
    });
  } catch (err: any) {
    checks.push({
      id: 'engine_usa',
      name: 'USA Calculation Engine',
      category: 'USA Mode',
      status: 'failed',
      latencyMs: Date.now() - usStart,
      message: err?.message || 'USA engine runtime error',
    });
  }

  // 4. UAE Dubai Calculation Engine (DLD & Overheads)
  const aeStart = Date.now();
  try {
    const uae = calculateDubaiBuyingCost(1500000, 'Ready Property', 'Cash');
    const isValid = uae.dldRegistrationFee === 60000 && uae.agentCommission === 30000;
    checks.push({
      id: 'engine_uae',
      name: 'Dubai Buying Cost Engine (DLD 4% & Fees)',
      category: 'UAE Mode',
      status: isValid ? 'operational' : 'failed',
      latencyMs: Date.now() - aeStart,
      message: isValid
        ? `Verified: 1.5M AED Property: DLD 4% = AED ${uae.dldRegistrationFee.toLocaleString()}, Commission = AED ${uae.agentCommission.toLocaleString()}`
        : 'UAE DLD fee logic mismatch',
    });
  } catch (err: any) {
    checks.push({
      id: 'engine_uae',
      name: 'Dubai Buying Cost Engine',
      category: 'UAE Mode',
      status: 'failed',
      latencyMs: Date.now() - aeStart,
      message: err?.message || 'UAE engine runtime error',
    });
  }

  // 5. Environment & Infrastructure Check
  checks.push({
    id: 'infra_node',
    name: 'Next.js App Server & Runtime',
    category: 'Infrastructure',
    status: 'operational',
    latencyMs: 1,
    message: `Node ${process.version} | Next.js 16.3 (Turbopack) | Memory: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
  });

  const totalDuration = Date.now() - startTime;
  const hasFailure = checks.some((c) => c.status === 'failed');
  const hasDegraded = checks.some((c) => c.status === 'degraded');

  const overallStatus = hasFailure ? 'unhealthy' : hasDegraded ? 'degraded' : 'operational';
  const httpStatusCode = hasFailure ? 503 : 200;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      totalDurationMs: totalDuration,
      summary: {
        total: checks.length,
        operational: checks.filter((c) => c.status === 'operational').length,
        degraded: checks.filter((c) => c.status === 'degraded').length,
        failed: checks.filter((c) => c.status === 'failed').length,
      },
      checks,
    },
    { status: httpStatusCode }
  );
}
