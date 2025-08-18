/*
  # Add Feedback Table

  1. New Table
    - `feedback` table to store user feedback submissions
    - Includes user_id, feedback_type, message, rating, and metadata
    - Supports different types of feedback (bug, feature, general, etc.)

  2. Security
    - Enable RLS on `feedback` table
    - Add policy for users to submit their own feedback
    - Add policy for admins to read all feedback

  3. Features
    - Feedback type enum for categorization
    - Rating field for satisfaction level
    - Metadata JSON field for additional context
    - Automatic timestamps
*/

-- Create enum for feedback types
CREATE TYPE feedback_type AS ENUM (
  'bug',
  'feature_request',
  'general',
  'praise',
  'complaint'
);

-- Create feedback table
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

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
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

CREATE POLICY "Admins can view all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND email IN ('admin@feelbetter.com') -- Add admin emails here
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_type_idx ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at);
CREATE INDEX IF NOT EXISTS feedback_rating_idx ON feedback(rating);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_feedback_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_feedback_timestamp_trigger
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_timestamp();
