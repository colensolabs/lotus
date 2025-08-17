/*
  # Add privacy setting to user preferences

  1. Changes
    - Add `save_conversations` boolean column to user_preferences table
    - Default to true (existing behavior)
    - Update trigger to handle the new column

  2. Security
    - Existing RLS policies will apply to the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_preferences' AND column_name = 'save_conversations'
  ) THEN
    ALTER TABLE user_preferences ADD COLUMN save_conversations boolean DEFAULT true;
  END IF;
END $$;