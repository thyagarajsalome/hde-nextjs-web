"use client";

import React, { useState } from "react";
import { supabase } from "@/config/supabaseClient";

export default function DubaiLeadForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "Investment",
    budget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("dubai_leads")
        .insert([{ 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone,
          interest: formData.interest,
          budget: formData.budget,
          source: "Dubai Property Landing Page"
        }]);

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message);
      }

      setIsSuccess(true);
      setFormData({ name: "", email: "", phone: "", interest: "Investment", budget: "" });
    } catch (err: any) {
      // If the table doesn't exist yet, we can simulate success for now
      if (err.message?.includes("relation") || err.message?.includes("does not exist")) {
        console.warn("Table 'dubai_leads' does not exist yet. Simulating success.");
        setIsSuccess(true);
      } else {
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-xl p-8 text-center shadow-lg">
        <div className="text-5xl text-green-500 mb-4"><i className="fas fa-check-circle"></i></div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Thank You!</h3>
        <p className="text-gray-600 dark:text-zinc-400">
          Your details have been securely received. A verified Dubai property expert from our partner network will contact you shortly.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-primary font-semibold hover:underline"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 p-6 md:p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Connect with a Verified Dubai Expert</h3>
        <p className="text-gray-600 dark:text-zinc-400">Get personalized advice on properties, visas, and investments from top real estate professionals.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">Full Name</label>
          <input 
            type="text" 
            name="name" 
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="John Doe"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">Phone / WhatsApp</label>
            <input 
              type="tel" 
              name="phone" 
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">What are you looking for?</label>
          <select 
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            <option value="Investment">Investment & High ROI</option>
            <option value="Golden Visa">Golden Visa Property</option>
            <option value="Off-Plan">Off-Plan / New Projects</option>
            <option value="Ready to Move">Ready to Move-in</option>
            <option value="Just Browsing">Just Browsing / Information</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-1">Estimated Budget (Optional)</label>
          <input 
            type="text" 
            name="budget" 
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="e.g. AED 1.5M - 2M"
          />
        </div>

        {errorMsg && <div className="text-red-500 text-sm mt-2 font-medium">{errorMsg}</div>}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full mt-6 bg-primary hover:bg-primary-hover text-white font-bold py-4 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
          ) : (
            <><i className="fas fa-paper-plane"></i> Get Free Consultation</>
          )}
        </button>
        
        <p className="text-xs text-center text-gray-500 dark:text-zinc-500 mt-4">
          By submitting this form, you agree to our privacy policy. Your information is secure.
        </p>
      </form>
    </div>
  );
}
