-- Feature requests table
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  upvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature upvotes tracking table
CREATE TABLE IF NOT EXISTS feature_upvotes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, request_id)
);

-- Enable RLS
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_upvotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view feature requests"
  ON feature_requests FOR SELECT
  USING (true);

CREATE POLICY "Users can create feature requests"
  ON feature_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view upvotes"
  ON feature_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Users can upvote"
  ON feature_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvote"
  ON feature_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feature_requests_upvotes ON feature_requests(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_feature_upvotes_request ON feature_upvotes(request_id);
