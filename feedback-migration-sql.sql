-- Feedback Table Migration
-- Run these commands in your Supabase Dashboard SQL Editor

-- 1. Create the feedback type enum
DO $$ BEGIN
  CREATE TYPE feedback_type AS ENUM (
    'bug',
    'feature_request',
    'general',
    'praise',
    'complaint'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create the feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  feedback_type feedback_type NOT NULL DEFAULT 'general',
  message text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
CREATE POLICY "Users can submit their own feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_type_idx ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at);
CREATE INDEX IF NOT EXISTS feedback_rating_idx ON feedback(rating);

-- 6. Create function to update timestamp
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for timestamp updates
CREATE TRIGGER update_feedback_timestamp_trigger
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_timestamp();

-- Success message
SELECT 'Feedback table created successfully!' as status;
