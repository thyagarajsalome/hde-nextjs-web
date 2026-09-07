import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../src/utils/currency';

describe('Currency Formatter Utility (formatCurrency)', () => {
  it('formats INR currency correctly for Indian mode', () => {
    const formatted = formatCurrency(2500000, 'IN');
    // Expect ₹ symbol and Indian numbering (25,00,000)
    expect(formatted).toContain('25,00,000');
  });

  it('formats USD currency correctly for USA mode', () => {
    const formatted = formatCurrency(450000, 'US');
    // Expect $ symbol and US numbering (450,000)
    expect(formatted).toContain('450,000');
    expect(formatted).toContain('$');
  });

  it('formats AED currency correctly for UAE / Dubai mode', () => {
    const formatted = formatCurrency(1500000, 'AE');
    // Expect AED prefix and formatted number (1,500,000)
    expect(formatted).toContain('AED');
    expect(formatted).toContain('1,500,000');
  });

  it('gracefully handles 0 and negative amounts without crashing', () => {
    expect(formatCurrency(0, 'IN')).toBeTruthy();
    expect(formatCurrency(0, 'US')).toBeTruthy();
    expect(formatCurrency(0, 'AE')).toBeTruthy();
  });
});
