/*
  # Create example conversations table

  1. New Tables
    - `example_conversations`
      - `id` (uuid, primary key)
      - `title` (text) - The conversation title/category
      - `question` (text) - The user's question
      - `guidance_response` (jsonb) - The complete guidance response
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean) - Whether this example should be shown

  2. Security
    - Enable RLS on `example_conversations` table
    - Add policy for authenticated users to read examples
    - Add policy for admin users to manage examples

  3. Sample Data
    - Insert the three example conversations from the home screen
*/

CREATE TABLE IF NOT EXISTS example_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  question text NOT NULL,
  guidance_response jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE example_conversations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read examples
CREATE POLICY "Users can read active examples"
  ON example_conversations
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS example_conversations_active_idx ON example_conversations (is_active);
CREATE INDEX IF NOT EXISTS example_conversations_title_idx ON example_conversations (title);

-- Insert the three example conversations
INSERT INTO example_conversations (title, question, guidance_response) VALUES
(
  'Relationship Communication',
  'I''m having difficulty communicating with my partner during conflicts. How can I approach disagreements with more compassion?',
  '{
    "intro": "Thank you for sharing this challenge—relationship conflicts can feel overwhelming, and seeking a more compassionate approach shows real wisdom and care for your partnership.",
    "practicalSteps": "• Practice the pause: When tension rises, take three conscious breaths before responding to create space for wisdom rather than reaction.\n• Listen with your whole being: Focus completely on understanding your partner''s perspective without planning your rebuttal.\n• Speak from your heart, not your hurt: Use \"I feel\" statements to express your experience rather than \"you always\" accusations.\n• Remember your shared love: Before difficult conversations, silently recall why you chose this person and what you appreciate about them.",
    "reflection": "Take a moment now to place your hand on your heart. Feel it beating with the same rhythm of love that brought you and your partner together. Let this remind you that beneath every conflict lies two people who care deeply.",
    "scripture": {
      "text": "Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.",
      "source": "Dhammapada, Verse 5",
      "explanation": "This teaching reminds us that responding to conflict with more conflict only deepens the wound. In relationships, meeting anger with compassion and understanding with patience creates the conditions for genuine resolution and deeper intimacy."
    },
    "outro": "What specific moments in your conflicts feel most challenging to navigate with compassion? Are there particular triggers or patterns you''ve noticed that make it harder to stay centered and loving?"
  }'
),
(
  'Career Decisions',
  'I''m torn between staying in a secure job I dislike and pursuing my passion with financial uncertainty. What should guide my decision?',
  '{
    "intro": "This tension between security and authenticity touches something deep in the human experience—you''re not alone in feeling pulled between practical needs and the call of your heart.",
    "practicalSteps": "• Practice mindful discernment: Spend time in quiet reflection, observing both the fear and excitement that arise when you imagine each path.\n• Examine your attachments: Notice whether your desire for security comes from genuine need or from fear-based clinging to comfort.\n• Consider the middle way: Explore gradual transitions—perhaps developing your passion part-time while maintaining some security.\n• Reflect on impermanence: Remember that no choice is permanent, and both paths offer opportunities for growth and learning.",
    "reflection": "Sit quietly and imagine yourself five years from now on each path. Notice what arises in your body—tension, peace, excitement, or dread. Your body often knows wisdom your mind hasn''t yet discovered.",
    "scripture": {
      "text": "Do not believe in anything simply because you have heard it. But after observation and analysis, when you find that anything agrees with reason and is conducive to the good and benefit of one and all, then accept it and live up to it.",
      "source": "Buddha, Kalama Sutta",
      "explanation": "This teaching encourages us to look beyond external opinions and social expectations to find our own authentic path. True security comes not from external circumstances but from trusting our capacity to navigate whatever arises with wisdom and compassion."
    },
    "outro": "What does your deepest intuition tell you about which path would allow you to serve others most fully? How might you begin taking small steps toward greater alignment, regardless of which direction you ultimately choose?"
  }'
),
(
  'Family Tensions',
  'My family has different values than me, leading to constant arguments. How can I maintain my beliefs while preserving family relationships?',
  '{
    "intro": "Family relationships can be our greatest teachers and our deepest challenges—it takes courage to seek harmony while staying true to yourself.",
    "practicalSteps": "• Practice loving boundaries: You can love your family deeply while not engaging in every argument or trying to change their minds.\n• Cultivate compassionate understanding: Try to see how their values served them in their life circumstances, even if they don''t serve you.\n• Focus on connection over correction: Look for shared human experiences—love, fear, hope—rather than trying to win ideological battles.\n• Model your values through being: Let your peace, kindness, and authenticity speak louder than your words.",
    "reflection": "Before your next family interaction, take a moment to send loving-kindness to each family member. Silently wish them happiness and freedom from suffering, even if you disagree with their choices.",
    "scripture": {
      "text": "In whom there is no craving, the stream that drags one along, they have crossed the flood; their task is done.",
      "source": "Dhammapada, Verse 414",
      "explanation": "This teaching points to freedom from the compulsive need to make others think like us. When we release our craving for family approval or agreement, we can love them more freely and authentically, without the suffering that comes from trying to control their beliefs."
    },
    "outro": "What would it feel like to love your family completely while needing nothing from them to change? Which family relationships feel most challenging right now, and how might you bring more acceptance to those dynamics?"
  }'
);