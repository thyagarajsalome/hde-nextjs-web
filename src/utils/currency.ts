export const formatCurrency = (amount: number, forceRegion?: 'IN' | 'US' | 'AE'): string => {
  let region = forceRegion;
  if (!region && typeof window !== 'undefined') {
    region = (window.localStorage.getItem('hde_region') as 'IN' | 'US' | 'AE') || 'IN';
  }
  if (region === 'AE') {
    return `AED ${(amount || 0).toLocaleString('en-AE', { maximumFractionDigits: 0 })}`;
  }
  const isUS = region === 'US';

  return (amount || 0).toLocaleString(isUS ? "en-US" : "en-IN", {
    style: "currency",
    currency: isUS ? "USD" : "INR",
    maximumFractionDigits: 0,
  });
};

/**
 * Converts numbers into standard Indian numbering system words (Crores, Lakhs, Thousands, Hundreds).
 * Example: 3640000 -> "Thirty Six Lakhs Forty Thousand Rupees Only"
 */
export function numberToIndianWords(amount: number): string {
  const num = Math.round(Math.abs(amount));
  if (num === 0) return "Zero Rupees Only";

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    const t = tens[Math.floor(n / 10)];
    const o = ones[n % 10];
    return o ? `${t} ${o}` : t;
  }

  function convertThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const hStr = h > 0 ? `${ones[h]} Hundred` : "";
    const restStr = convertTwoDigits(rest);
    if (hStr && restStr) return `${hStr} and ${restStr}`;
    return hStr || restStr;
  }

  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const hundreds = num % 1000;

  const parts: string[] = [];
  if (crores > 0) parts.push(`${convertTwoDigits(crores)} Crore${crores > 1 ? "s" : ""}`);
  if (lakhs > 0) parts.push(`${convertTwoDigits(lakhs)} Lakh${lakhs > 1 ? "s" : ""}`);
  if (thousands > 0) parts.push(`${convertTwoDigits(thousands)} Thousand`);
  if (hundreds > 0) parts.push(convertThreeDigits(hundreds));

  return `${parts.join(" ")} Rupees Only`.replace(/\s+/g, " ").trim();
}