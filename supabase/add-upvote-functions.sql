-- Function to increment upvotes
CREATE OR REPLACE FUNCTION increment_upvotes(request_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE feature_requests
  SET upvotes = upvotes + 1
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement upvotes
CREATE OR REPLACE FUNCTION decrement_upvotes(request_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE feature_requests
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
