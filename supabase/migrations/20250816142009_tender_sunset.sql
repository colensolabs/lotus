/*
  # Add User Preferences for Topics and Buddhist Traditions

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `topics_of_interest` (text array)
      - `buddhist_tradition` (enum: secular, general_buddhist, theravada, mahayana, tibetan, zen)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policy for users to manage their own preferences

  3. Changes
    - Create enum type for Buddhist traditions
    - Add indexes for efficient querying
    - Add trigger to update timestamp on changes
*/

-- Create enum for Buddhist traditions
CREATE TYPE buddhist_tradition AS ENUM (
  'secular',
  'general_buddhist', 
  'theravada',
  'mahayana',
  'tibetan',
  'zen'
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  topics_of_interest text[] DEFAULT '{}',
  buddhist_tradition buddhist_tradition DEFAULT 'general_buddhist',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS user_preferences_tradition_idx ON user_preferences(buddhist_tradition);
CREATE INDEX IF NOT EXISTS user_preferences_topics_idx ON user_preferences USING GIN(topics_of_interest);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp updates
CREATE TRIGGER update_user_preferences_timestamp_trigger
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_timestamp();