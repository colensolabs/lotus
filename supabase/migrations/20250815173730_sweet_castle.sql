/*
  # Fix RLS policy for messages table

  1. Policy Updates
    - Drop existing restrictive policy
    - Add proper INSERT policy for authenticated users
    - Add proper SELECT policy for user's own messages
    - Add proper UPDATE/DELETE policies for user's own messages

  2. Security
    - Ensure authenticated users can insert messages into their own conversations
    - Ensure users can only access messages from their own conversations
*/

-- Drop the existing policy that might be too restrictive
DROP POLICY IF EXISTS "Users can manage own messages" ON messages;

-- Create separate policies for different operations
CREATE POLICY "Users can insert messages into own conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can select own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );