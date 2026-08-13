-- StudyStake — User Profiles Supabase Schema Migration
-- Creates public.profiles table for storing user profile records with RLS policies

CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  wallet_address text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'sponsor')),
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public access policies for MVP
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public select on profiles') THEN
    CREATE POLICY "Allow public select on profiles" ON public.profiles FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public insert on profiles') THEN
    CREATE POLICY "Allow public insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public update on profiles') THEN
    CREATE POLICY "Allow public update on profiles" ON public.profiles FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public delete on profiles') THEN
    CREATE POLICY "Allow public delete on profiles" ON public.profiles FOR DELETE USING (true);
  END IF;
END $$;
