-- Add show_in_region_ranking column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_in_region_ranking BOOLEAN NOT NULL DEFAULT true;

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view users" ON users;
CREATE POLICY "Anyone can view users" ON users
  FOR SELECT USING (true); 