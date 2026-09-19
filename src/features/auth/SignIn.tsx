"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../config/supabaseClient";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate.push("/dashboard");
    } catch (err: any) {
      console.error("Sign In Error:", err);
      setError(err.message || "Failed to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      setError("Failed to sign in with Google.");
    }
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-6">Sign In to your account</h2>
      
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm bg-white dark:bg-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mb-6 transition-all"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5"/>
        {isSubmitting ? "Signing In..." : "Sign in with Google"}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-zinc-700"></div></div>
        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400">Or continue with</span></div>
      </div>

      <form onSubmit={handleSignIn} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Email address</label>
          <div className="mt-1">
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-zinc-800 dark:text-zinc-100" 
              placeholder="you@example.com" 
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">Password</label>
          <div className="mt-1">
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-zinc-800 dark:text-zinc-100" 
              placeholder="••••••••" 
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white dark:text-zinc-950 bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">{error}</h3>
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          New here? <Link href="/signup" className="font-semibold text-primary hover:text-primary-hover">Create an account</Link>
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 font-medium">
          <i className="fab fa-whatsapp"></i>
          <span>Get instant construction reports &amp; house plans delivered on WhatsApp</span>
        </p>
      </div>
    </>
  );
};

export default SignIn;
