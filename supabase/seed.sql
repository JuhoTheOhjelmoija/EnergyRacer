-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create test users with proper authentication
DO $$
BEGIN
  -- Create test user 1
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test1@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  );

  -- Create test user 2
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    '22222222-2222-2222-2222-222222222222',
    'test2@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  );

  -- Create test user 3
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES (
    '33333333-3333-3333-3333-333333333333',
    'test3@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  );
END $$;

-- Insert test users into public.users
INSERT INTO users (id, name, avatar_url, daily_goal, total_caffeine) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test User 1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test1', 400, 1200),
  ('22222222-2222-2222-2222-222222222222', 'Test User 2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test2', 300, 800),
  ('33333333-3333-3333-3333-333333333333', 'Test User 3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test3', 500, 600);

-- Insert test consumption entries
INSERT INTO consumption (id, user_id, drink_name, caffeine_amount) VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Coffee', 100),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Energy Drink', 200),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Tea', 50),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Coffee', 100),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Energy Drink', 200);

-- Insert test achievements
INSERT INTO achievements (id, title, description, icon) VALUES
  ('11111111-1111-1111-1111-111111111111', 'First Coffee', 'Drank your first cup of coffee', 'coffee'),
  ('22222222-2222-2222-2222-222222222222', 'Energy Boost', 'Consumed 200mg of caffeine in one day', 'zap'),
  ('33333333-3333-3333-3333-333333333333', 'Caffeine Master', 'Reached 1000mg total caffeine', 'trophy');

-- Insert test user achievements
INSERT INTO user_achievements (id, user_id, achievement_id) VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'); 