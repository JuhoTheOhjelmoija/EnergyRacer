-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  region TEXT,
  daily_goal INTEGER DEFAULT 400,
  total_caffeine INTEGER DEFAULT 0,
  show_in_region_ranking BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create consumption table
CREATE TABLE IF NOT EXISTS consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  drink_name TEXT NOT NULL,
  caffeine_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view users for leaderboard" ON users
  FOR SELECT USING (show_in_region_ranking = true);

-- Create policies for consumption table
CREATE POLICY "Users can view their own consumption" ON consumption
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consumption" ON consumption
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consumption" ON consumption
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own consumption" ON consumption
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for achievements table
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- Create policies for user_achievements table
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS users_region_idx ON users(region);
CREATE INDEX IF NOT EXISTS users_total_caffeine_idx ON users(total_caffeine);
CREATE INDEX IF NOT EXISTS consumption_user_id_idx ON consumption(user_id);
CREATE INDEX IF NOT EXISTS consumption_created_at_idx ON consumption(created_at);
CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_achievements_achievement_id_idx ON user_achievements(achievement_id);

-- Insert default achievements
INSERT INTO achievements (id, title, description, icon, total) VALUES
  ('11111111-1111-1111-1111-111111111111', 'First Cup', 'Add your first caffeine entry', 'coffee', 1),
  ('22222222-2222-2222-2222-222222222222', 'Early Bird', 'Add 5 morning entries (before 8 AM)', 'sunrise', 5),
  ('33333333-3333-3333-3333-333333333333', 'Caffeine Master', 'Reach 1000mg total caffeine', 'zap', 1000),
  ('44444444-4444-4444-4444-444444444444', 'Consistent Consumer', 'Add entries for 7 consecutive days', 'flame', 7),
  ('55555555-5555-5555-5555-555555555555', 'Night Owl', 'Log caffeine after 8:00 PM for 3 consecutive days', 'moon', 3),
  ('66666666-6666-6666-6666-666666666666', 'Variety Seeker', 'Log 5 different types of caffeine sources in a single week', 'droplet', 5),
  ('77777777-7777-7777-7777-777777777777', 'Caffeine Apprentice', 'Reach a total of 1,000mg of caffeine consumed', 'award', 1000),
  ('88888888-8888-8888-8888-888888888888', 'Caffeine Enthusiast', 'Reach a total of 5,000mg of caffeine consumed', 'award', 5000),
  ('99999999-9999-9999-9999-999999999999', 'Caffeine Addict', 'Reach a total of 10,000mg of caffeine consumed', 'award', 10000),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Caffeine Master', 'Reach a total of 25,000mg of caffeine consumed', 'crown', 25000),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Caffeine Legend', 'Reach a total of 50,000mg of caffeine consumed', 'star', 50000),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Entry Milestone: 10', 'Log 10 caffeine entries', 'trending-up', 10),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Entry Milestone: 50', 'Log 50 caffeine entries', 'trending-up', 50),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Entry Milestone: 100', 'Log 100 caffeine entries', 'trending-up', 100),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Entry Milestone: 500', 'Log 500 caffeine entries', 'trending-up', 500),
  ('11111111-1111-1111-1111-111111111112', 'Energy Bomb', 'Consume 500mg of caffeine in a single day', 'zap', 500),
  ('11111111-1111-1111-1111-111111111113', 'Weekly Streak', 'Log caffeine for 7 consecutive days', 'flame', 7),
  ('11111111-1111-1111-1111-111111111114', 'Monthly Streak', 'Log caffeine for 30 consecutive days', 'flame', 30),
  ('11111111-1111-1111-1111-111111111115', 'Quarterly Streak', 'Log caffeine for 90 consecutive days', 'flame', 90),
  ('11111111-1111-1111-1111-111111111116', 'Coffee Connoisseur', 'Log 50 cups of coffee', 'coffee', 50),
  ('11111111-1111-1111-1111-111111111117', 'Energy Drink Enthusiast', 'Log 20 energy drinks', 'zap', 20),
  ('11111111-1111-1111-1111-111111111118', 'Tea Aficionado', 'Log 30 cups of tea', 'leaf', 30),
  ('11111111-1111-1111-1111-111111111119', 'Espresso Express', 'Log 5 espressos in a single day', 'rocket', 5),
  ('11111111-1111-1111-1111-111111111120', 'Early Bird', 'Log caffeine before 6:00 AM five times', 'clock', 5),
  ('11111111-1111-1111-1111-111111111121', 'Weekend Warrior', 'Log caffeine on 5 consecutive weekends', 'calendar', 5),
  ('11111111-1111-1111-1111-111111111122', 'Global Explorer', 'Log 5 different drink types', 'target', 5),
  ('11111111-1111-1111-1111-111111111123', 'Caffeine Scholar', 'Read 10 articles about caffeine in the app', 'lightbulb', 10),
  ('11111111-1111-1111-1111-111111111124', 'Social Sipper', 'Share your caffeine stats on social media 3 times', 'heart', 3),
  ('11111111-1111-1111-1111-111111111125', 'Leaderboard Legend', 'Reach the top 3 on your regional leaderboard', 'trophy', 1),
  ('11111111-1111-1111-1111-111111111126', 'Perfect Balance', 'Maintain the same daily caffeine intake (±10mg) for 7 days', 'sparkles', 7),
  ('11111111-1111-1111-1111-111111111127', 'Caffeine Scientist', 'Track your mood alongside caffeine for 14 days', 'medal', 14)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars bucket
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "Anyone can upload an avatar" on storage.objects;
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

drop policy if exists "Users can update their own avatars" on storage.objects;
create policy "Users can update their own avatars"
  on storage.objects for update
  using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

drop policy if exists "Users can delete their own avatars" on storage.objects;
create policy "Users can delete their own avatars"
  on storage.objects for delete
  using ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] ); 