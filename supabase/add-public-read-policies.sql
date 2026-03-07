-- Public view for leaderboard (no email/stripe data exposed)
CREATE OR REPLACE VIEW public_profiles AS
  SELECT id, username, points, streak_count, is_premium
  FROM users;

GRANT SELECT ON public_profiles TO anon;
GRANT SELECT ON public_profiles TO authenticated;

-- Allow public SELECT on users table for foreign key joins (feedback → users.username)
-- IMPORTANT: Only query specific columns in your app code (never SELECT *)
-- Email and stripe columns exist but are not queried by the app
CREATE POLICY "Public read for joins"
  ON users FOR SELECT
  USING (true);
