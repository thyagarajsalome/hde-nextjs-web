-- Migration: Add whatsapp_number column to profiles table
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Create index for fast searching and admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp_number);

-- Comment
COMMENT ON COLUMN public.profiles.whatsapp_number IS 'User mobile and WhatsApp number with international country code (e.g. +919876543210, +971501234567, +15551234567)';
