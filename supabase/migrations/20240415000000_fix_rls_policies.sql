-- Poistetaan vanhat käytännöt
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Anyone can view users" ON users;

-- Luodaan uudet käytännöt
-- Kuka tahansa voi nähdä käyttäjät (leaderboardia varten)
CREATE POLICY "Anyone can view users" ON users
  FOR SELECT USING (true);

-- Kirjautuneet käyttäjät voivat lisätä itselleen profiilin
CREATE POLICY "Authenticated users can insert their own profile" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Käyttäjät voivat päivittää omaa profiiliaan
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id); 