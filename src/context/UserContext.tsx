"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "../config/supabaseClient";
import { User } from "@supabase/supabase-js";

export type PlanTier = 'free' | 'basic' | 'standard' | 'pro';

interface UserContextType {
  user: User | null;
  role: string;
  hasPaid: boolean; 
  planTier: PlanTier;
  tierValue: number;
  credits: number; // Added credits field
  whatsappNumber: string | null;
  updateWhatsAppNumber: (num: string) => Promise<boolean>;
  setHasPaid: (status: boolean) => void;
  loading: boolean;
  installPrompt: any;
  markup: number;
  setMarkup: (val: number) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  isDeveloper?: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('user');
  const [hasPaid, setHasPaid] = useState(false);
  const [planTier, setPlanTier] = useState<PlanTier>('free');
  const [credits, setCredits] = useState<number>(0); // Added credits state
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [markup, setMarkup] = useState(0);
  const [isDeveloper, setIsDeveloper] = useState(false);

  // Initialize Developer Mode (Localhost, query param ?dev=true, or localStorage flag)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const devParam = urlParams.get('dev') || urlParams.get('developer') || urlParams.get('admin');
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const hasDevFlag = window.localStorage.getItem('hde_developer_mode') === 'true';

      if (devParam === 'true' || devParam === '1') {
        window.localStorage.setItem('hde_developer_mode', 'true');
        window.localStorage.setItem('hde_user_has_paid', 'true');
        window.localStorage.setItem('hde_bank_report_paid', 'true');
        setIsDeveloper(true);
        setHasPaid(true);
        setPlanTier('pro');
        setRole('admin');
        setCredits(9999);
      } else if (hasDevFlag || isLocal) {
        setIsDeveloper(true);
        setHasPaid(true);
        setPlanTier('pro');
        setRole('admin');
        setCredits(9999);
      }

      // Expose developer helpers globally in browser console
      (window as any).enableDevAccess = () => {
        window.localStorage.setItem('hde_developer_mode', 'true');
        window.localStorage.setItem('hde_user_has_paid', 'true');
        window.localStorage.setItem('hde_bank_report_paid', 'true');
        setIsDeveloper(true);
        setHasPaid(true);
        setPlanTier('pro');
        setRole('admin');
        setCredits(9999);
        console.log('%c[HDE DevAccess] Full Developer Access Granted! All paywalls, calculators, and reports unlocked.', 'color: #10b981; font-weight: bold; font-size: 14px;');
      };

      (window as any).disableDevAccess = () => {
        window.localStorage.removeItem('hde_developer_mode');
        window.localStorage.removeItem('hde_user_has_paid');
        window.localStorage.removeItem('hde_bank_report_paid');
        setIsDeveloper(false);
        console.log('%c[HDE DevAccess] Developer Access Disabled.', 'color: #ef4444; font-weight: bold; font-size: 14px;');
      };
    }
  }, []);

  const tierValue = { free: 0, basic: 1, standard: 2, pro: 3 }[planTier];

  // Refs to prevent duplicate profile queries in parallel and resolve race conditions
  const profilePromiseRef = useRef<Promise<void> | null>(null);
  const fetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const fetchProfile = (userId: string): Promise<void> => {
    // If the profile for this user has already been fetched, return a resolved promise immediately
    if (fetchedUserIdRef.current === userId) {
      return Promise.resolve();
    }
    
    // If a profile request is already in-flight for this user, share that existing promise
    if (profilePromiseRef.current) {
      return profilePromiseRef.current;
    }

    const promise = (async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_paid, plan_tier, role, credits, whatsapp_number')
          .eq('id', userId)
          .maybeSingle(); 
        
        if (error) console.error("Error fetching profile:", error);
        
        const isDev = Boolean(
          isDeveloper ||
          data?.role === 'admin' ||
          data?.role === 'developer' ||
          userId === 'dev-admin'
        );
        const isPaid = Boolean(data?.has_paid || isDev);
        const resolvedTier = data?.plan_tier || (isPaid ? 'pro' : 'free');
        
        setHasPaid(isPaid);
        setPlanTier(resolvedTier);
        setRole(data?.role || 'user');
        if (data?.whatsapp_number) {
          setWhatsappNumber(data.whatsapp_number);
        }

        // Credit allocation:
        // - If credits exist in DB, respect the exact balance.
        // - If null/undefined in DB:
        //   - Existing paid users get 100 credits (Pro default) so they are never blocked.
        //   - New free users get 1 Free Welcome Credit to test saving their first project.
        let userCredits = data?.credits;
        if (userCredits === null || userCredits === undefined) {
          userCredits = (isDev || isDeveloper) ? 9999 : (isPaid ? 100 : 1);
        }
        setCredits(userCredits);
        fetchedUserIdRef.current = userId;
      } catch (err) {
        console.error("Unexpected error fetching profile:", err);
        setHasPaid(false);
        setPlanTier('free');
        setRole('user');
        setCredits(0); // Reset credits on error
      } finally {
        profilePromiseRef.current = null;
      }
    })();

    profilePromiseRef.current = promise;
    return promise;
  };

  const updateWhatsAppNumber = async (num: string): Promise<boolean> => {
    try {
      const cleaned = num.trim();
      setWhatsappNumber(cleaned);

      const { error: authErr } = await supabase.auth.updateUser({
        data: { whatsapp_number: cleaned, phone: cleaned }
      });
      if (authErr) console.warn("Could not update auth user_metadata:", authErr);

      if (user?.id) {
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            whatsapp_number: cleaned,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        } catch (dbErr) {
          console.warn("Could not update profiles table:", dbErr);
        }
      }
      return true;
    } catch (err) {
      console.error("Error updating whatsapp number:", err);
      return false;
    }
  };

  useEffect(() => {
    let active = true;

    // 1. Fetch current session once on load
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!active) return;
        
        if (session?.user) {
          setUser(session.user);
          const metaPhone = session.user.user_metadata?.whatsapp_number || session.user.user_metadata?.phone || null;
          setWhatsappNumber(metaPhone);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setWhatsappNumber(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    initializeAuth();

    // 2. Setup subscription to react to changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      
      try {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser) {
          const metaPhone = sessionUser.user_metadata?.whatsapp_number || sessionUser.user_metadata?.phone || null;
          setWhatsappNumber(metaPhone);
          // Shared promise logic ensures we don't trigger a secondary profile request in parallel
          await fetchProfile(sessionUser.id);
        } else {
          // Reset local states on sign out
          fetchedUserIdRef.current = null;
          setHasPaid(false);
          setPlanTier('free');
          setRole('user');
          setCredits(0); // Reset credits on logout
          setWhatsappNumber(null);
        }
      } catch (err) {
        console.error("onAuthStateChange error:", err);
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    if (user) {
      fetchedUserIdRef.current = null; // Invalidate cached user ID to force a fresh fetch
      await fetchProfile(user.id);
    }
  };

  const handleSignOut = async () => {
    // 1. Immediately reset React state and clear storage synchronously to make UI responsive
    setUser(null);
    setHasPaid(false);
    setPlanTier('free');
    setRole('user');
    setCredits(0);
    setWhatsappNumber(null);
    fetchedUserIdRef.current = null;

    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith("sb-"))
        .forEach(key => localStorage.removeItem(key));
      Object.keys(sessionStorage)
        .filter(key => key.startsWith("sb-"))
        .forEach(key => sessionStorage.removeItem(key));
    } catch (err) {
      console.error("Error clearing storage on logout:", err);
    }

    // 2. Perform fire-and-forget Supabase sign out in the background
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out from supabase:", err);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, role, hasPaid, planTier, tierValue, credits, whatsappNumber, updateWhatsAppNumber,
      setHasPaid, loading, installPrompt, markup, setMarkup, 
      refreshProfile: handleManualRefresh,
      signOut: handleSignOut
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) throw new Error("useUser must be used within a UserProvider");
  return context;
};
