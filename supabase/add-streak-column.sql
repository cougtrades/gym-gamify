-- Add last_workout_date column for streak tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_workout_date DATE;
