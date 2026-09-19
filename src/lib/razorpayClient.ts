// src/lib/razorpayClient.ts
/**
 * Client-side Razorpay checkout loader and launcher for HDE Real Estate
 */

export interface RazorpayCheckoutOptions {
  amountInRupees: number;
  itemName: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const scriptId = 'razorpay-checkout-js';
    const existing = document.getElementById(scriptId);
    if (existing) {
      return resolve(true);
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout({
  amountInRupees,
  itemName,
  description,
  prefill = {},
  onSuccess,
  onFailure,
}: RazorpayCheckoutOptions): Promise<boolean> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !(window as any).Razorpay) {
    alert('Could not load payment gateway. Please check your internet connection.');
    if (onFailure) onFailure(new Error('Razorpay SDK failed to load'));
    return false;
  }

  const keyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_RVimcPWU7yAgZr';

  const options = {
    key: keyId,
    amount: Math.round(amountInRupees * 100), // in paise
    currency: 'INR',
    name: 'Home Design English (HDE)',
    description: `${itemName} - ${description}`,
    prefill: {
      name: prefill.name || '',
      email: prefill.email || '',
      contact: prefill.contact || '',
    },
    theme: {
      color: '#4165AF',
    },
    modal: {
      ondismiss: () => {
        if (onFailure) onFailure(new Error('Payment dismissed by user'));
      },
    },
    handler: function (response: any) {
      if (response && response.razorpay_payment_id) {
        onSuccess(response.razorpay_payment_id);
      } else {
        if (onFailure) onFailure(new Error('Invalid payment response'));
      }
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    return true;
  } catch (err) {
    console.error('Error opening Razorpay checkout:', err);
    if (onFailure) onFailure(err);
    return false;
  }
}
