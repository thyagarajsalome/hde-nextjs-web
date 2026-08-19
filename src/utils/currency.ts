export const formatCurrency = (amount: number, forceRegion?: 'IN' | 'US'): string => {
  let region = forceRegion;
  if (!region && typeof window !== 'undefined') {
    region = (window.localStorage.getItem('hde_region') as 'IN' | 'US') || 'IN';
  }
  const isUS = region === 'US';

  return amount.toLocaleString(isUS ? "en-US" : "en-IN", {
    style: "currency",
    currency: isUS ? "USD" : "INR",
    maximumFractionDigits: 0,
  });
};