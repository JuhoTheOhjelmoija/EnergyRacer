-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disable email confirmation requirement
UPDATE auth.config
SET enable_signup_email_confirm = false;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  daily_goal INTEGER DEFAULT 400,
  total_caffeine INTEGER DEFAULT 0,
  show_in_region_ranking BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Caffeine entries table
CREATE TABLE IF NOT EXISTS caffeine_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  drink_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Region rankings table
CREATE TABLE IF NOT EXISTS region_rankings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  region TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_caffeine INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE caffeine_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_rankings ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Caffeine entries table policies
CREATE POLICY "Users can view their own entries" ON caffeine_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON caffeine_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON caffeine_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON caffeine_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Region rankings table policies
CREATE POLICY "Anyone can view region rankings" ON region_rankings
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own rankings" ON region_rankings
  FOR UPDATE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_caffeine_entries_user_id ON caffeine_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_caffeine_entries_created_at ON caffeine_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_region_rankings_region ON region_rankings(region);
CREATE INDEX IF NOT EXISTS idx_region_rankings_user_id ON region_rankings(user_id); 