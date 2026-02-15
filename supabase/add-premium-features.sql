-- Add premium status to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Custom workout templates table
CREATE TABLE IF NOT EXISTS custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal records tracking
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  reps INTEGER NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_name)
);

-- Enable RLS
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own custom templates"
  ON custom_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Premium users can create custom templates"
  ON custom_templates FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_premium = true
    )
  );

CREATE POLICY "Users can update their own custom templates"
  ON custom_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom templates"
  ON custom_templates FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own PRs"
  ON personal_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert PRs"
  ON personal_records FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update PRs"
  ON personal_records FOR UPDATE
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_custom_templates_user ON custom_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(is_premium) WHERE is_premium = true;
