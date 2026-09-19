"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../config/supabaseClient";
import { useRegion } from "../../context/RegionContext";

interface CountryDial {
  code: string;
  country: string;
  flag: string;
  label: string;
  digits: number;
  placeholder: string;
}

const COUNTRY_DIAL_CODES: CountryDial[] = [
  { code: '+91', country: 'IN', flag: '🇮🇳', label: 'India (+91)', digits: 10, placeholder: '98765 43210' },
  { code: '+1',  country: 'US', flag: '🇺🇸', label: 'USA (+1)', digits: 10, placeholder: '(555) 123-4567' },
  { code: '+971',country: 'AE', flag: '🇦🇪', label: 'UAE (+971)', digits: 9, placeholder: '50 123 4567' },
  { code: '+44', country: 'GB', flag: '🇬🇧', label: 'UK (+44)', digits: 10, placeholder: '7911 123456' },
  { code: '+1',  country: 'CA', flag: '🇨🇦', label: 'Canada (+1)', digits: 10, placeholder: '(555) 123-4567' },
  { code: '+966',country: 'SA', flag: '🇸🇦', label: 'Saudi Arabia (+966)', digits: 9, placeholder: '50 123 4567' },
  { code: '+974',country: 'QA', flag: '🇶🇦', label: 'Qatar (+974)', digits: 8, placeholder: '3312 3456' },
  { code: '+965',country: 'KW', flag: '🇰🇼', label: 'Kuwait (+965)', digits: 8, placeholder: '5123 4567' },
  { code: '+61', country: 'AU', flag: '🇦🇺', label: 'Australia (+61)', digits: 9, placeholder: '412 345 678' },
  { code: '+65', country: 'SG', flag: '🇸🇬', label: 'Singapore (+65)', digits: 8, placeholder: '8123 4567' },
];

const SignUp = () => {
  const { region } = useRegion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync default dial code based on current user region (IN -> +91, US -> +1, AE -> +971)
  useEffect(() => {
    if (region === 'AE') {
      setCountryCode('+971');
    } else if (region === 'US') {
      setCountryCode('+1');
    } else if (region === 'IN') {
      setCountryCode('+91');
    }
  }, [region]);

  const activeCountry = COUNTRY_DIAL_CODES.find(c => c.code === countryCode) || COUNTRY_DIAL_CODES[0];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanedPhone = phone.replace(/\D/g, "");
    if (!cleanedPhone) {
      setError("Please enter your WhatsApp / Mobile number.");
      return;
    }

    if (cleanedPhone.length < (activeCountry.digits - 1) || cleanedPhone.length > (activeCountry.digits + 2)) {
      setError(`Please enter a valid ${activeCountry.label} mobile number (${activeCountry.digits} digits).`);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    const fullWhatsAppNumber = `${countryCode}${cleanedPhone}`;

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            whatsapp_number: fullWhatsAppNumber,
            phone: fullWhatsAppNumber,
            country_code: countryCode,
            region: region || (countryCode === '+971' ? 'AE' : countryCode === '+1' ? 'US' : 'IN'),
          }
        }
      });
      
      if (error) throw error;

      // Attempt to save to profiles table if table exists
      if (data?.user?.id) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            whatsapp_number: fullWhatsAppNumber,
            country_code: countryCode,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
        } catch (profileErr) {
          console.warn("Could not upsert to profiles table:", profileErr);
        }
      }

      setMessage("Account created! Please check your email to verify your account.");
    } catch (err: any) {
      console.error("Sign Up Error:", err);
      setError(err.message || "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Sign Up Error:", err);
      setError("Failed to sign up with Google.");
    }
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Create a free account</h2>
      <p className="text-center text-xs text-gray-500 dark:text-zinc-400 mb-6">
        Get accurate construction calculators, BOQ materials &amp; floor plan updates
      </p>
      
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm bg-white dark:bg-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mb-6 transition-all"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5"/>
        {isSubmitting ? "Creating..." : "Sign up with Google"}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-zinc-700"></div></div>
        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400">Or register with WhatsApp &amp; email</span></div>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Email address</label>
          <div className="mt-1">
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-zinc-800 dark:text-zinc-100" 
              placeholder="you@example.com" 
              disabled={isSubmitting} 
            />
          </div>
        </div>

        <div>
          <label htmlFor="whatsapp" className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-zinc-300">
            <span className="flex items-center gap-1.5">
              <i className="fab fa-whatsapp text-emerald-500 text-base"></i>
              <span>WhatsApp / Mobile Number</span>
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">For Estimates &amp; Reports</span>
          </label>
          <div className="mt-1 flex rounded-lg shadow-sm">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              disabled={isSubmitting}
              className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 text-sm font-medium focus:ring-primary focus:border-primary cursor-pointer"
            >
              {COUNTRY_DIAL_CODES.map((item) => (
                <option key={`${item.country}-${item.code}`} value={item.code}>
                  {item.flag} {item.code}
                </option>
              ))}
            </select>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-r-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-zinc-800 dark:text-zinc-100"
              placeholder={activeCountry.placeholder}
              disabled={isSubmitting}
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400">
            We use this to deliver calculation summaries, BOQ reports, and floor plan PDFs.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Password</label>
          <div className="mt-1">
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-zinc-800 dark:text-zinc-100" 
              placeholder="At least 6 characters" 
              disabled={isSubmitting} 
            />
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white dark:text-zinc-950 bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3.5 border border-red-200 dark:border-red-900/50">
            <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}
        {message && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3.5 border border-green-200 dark:border-green-900/50">
            <p className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-400">{message}</p>
          </div>
        )}
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          Already have an account? <Link href="/signin" className="font-semibold text-primary hover:text-primary-hover">Sign In</Link>
        </p>
      </div>
    </>
  );
};

export default SignUp;