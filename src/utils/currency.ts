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