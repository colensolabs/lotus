/*
  # Create example conversations table

  1. New Tables
    - `example_conversations`
      - `id` (uuid, primary key)
      - `title` (text) - Short title for the conversation topic
      - `question` (text) - The example question/prompt
      - `guidance_response` (jsonb) - Pre-generated guidance response
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean) - Whether to show this example

  2. Security
    - Enable RLS on `example_conversations` table
    - Add policy for authenticated users to read active examples

  3. Sample Data
    - Insert initial example conversations
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

CREATE POLICY "Users can read active examples"
  ON example_conversations
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS example_conversations_active_idx ON example_conversations (is_active);
CREATE INDEX IF NOT EXISTS example_conversations_title_idx ON example_conversations (title);

-- Insert sample example conversations
INSERT INTO example_conversations (title, question, guidance_response) VALUES
(
  'Relationship Communication',
  'I''m having difficulty communicating with my partner during conflicts. How can I approach disagreements with more compassion?',
  '{
    "intro": "Thank you for sharing this challenge. Communication during conflict is one of the most difficult yet important skills in relationships, and your desire to approach disagreements with compassion shows great wisdom.",
    "practicalSteps": "• Practice the pause: When you feel tension rising, take three conscious breaths before responding\n• Listen with the intention to understand, not to be right or win the argument\n• Use \"I\" statements to express your feelings without blame: \"I feel hurt when...\" instead of \"You always...\"\n• Acknowledge your partner''s perspective before sharing your own: \"I hear that you feel...\"",
    "reflection": "Before your next difficult conversation, sit quietly for a moment and set the intention to speak and listen from a place of love rather than fear or defensiveness.",
    "scripture": {
      "text": "Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.",
      "source": "Dhammapada, Verse 5",
      "explanation": "This teaching reminds us that responding to conflict with more conflict only creates suffering. True resolution comes through compassion and understanding."
    },
    "outro": "What specific moments in your conversations feel most challenging? Are there particular triggers that make it harder for you to stay compassionate?"
  }'
),
(
  'Career Decisions',
  'I''m torn between staying in a secure job I dislike and pursuing my passion with financial uncertainty. What should guide my decision?',
  '{
    "intro": "This is such a common yet deeply personal struggle. The tension between security and authenticity touches the very heart of how we want to live our lives, and there''s no shame in feeling torn.",
    "practicalSteps": "• Examine your true motivations: Are you staying from genuine responsibility or from fear?\n• Consider the middle path: Can you gradually transition while building skills or savings?\n• Reflect on what \"security\" really means to you beyond just money\n• Seek counsel from people who have made similar transitions, both successfully and unsuccessfully",
    "reflection": "Sit quietly and imagine yourself in five years in each scenario. Notice not just your thoughts, but the feelings that arise in your body. What does your deeper wisdom tell you?",
    "scripture": {
      "text": "Do not believe in anything simply because you have heard it. But after observation and analysis, when you find that anything agrees with reason and is conducive to the good and benefit of one and all, then accept it and live up to it.",
      "source": "Buddha, Kalama Sutta",
      "explanation": "The Buddha encourages us to make decisions based on careful observation and wisdom, not just fear or social expectations. Trust your ability to discern what truly serves your highest good."
    },
    "outro": "What fears come up most strongly when you imagine making this change? And what would you regret more - taking the risk or not taking it?"
  }'
),
(
  'Family Tensions',
  'My family has different values than me, leading to constant arguments. How can I maintain my beliefs while preserving family relationships?',
  '{
    "intro": "Family relationships can be some of our greatest teachers and greatest challenges. It takes courage to stay true to yourself while also honoring the love you have for family members who see the world differently.",
    "practicalSteps": "• Set loving boundaries: You can disagree without being disagreeable\n• Focus on shared values like love, care, and wanting the best for each other\n• Choose your battles wisely - not every difference needs to become a debate\n• Practice compassionate detachment: Love them without needing to change them",
    "reflection": "When you feel triggered by family differences, pause and ask: \"What am I trying to protect or prove right now?\" Often our strongest reactions reveal our deepest attachments.",
    "scripture": {
      "text": "In whom there is no craving, the stream that drags one along, they have crossed the flood; their task is done.",
      "source": "Dhammapada, Verse 414",
      "explanation": "When we stop needing others to validate our beliefs or change their minds, we find peace. We can love without attachment to outcomes."
    },
    "outro": "Which family relationships feel most strained right now? What would it look like to love them exactly as they are while still honoring your own path?"
  }'
),
(
  'Work Stress',
  'I feel overwhelmed by work demands and constantly stressed. How can I find peace in a high-pressure environment?',
  '{
    "intro": "Work stress is one of the most common sources of suffering in modern life. Your awareness of this stress and desire to find peace within it is already the beginning of transformation.",
    "practicalSteps": "• Practice micro-meditations: Take three conscious breaths between tasks or meetings\n• Set realistic boundaries with your time and energy - you cannot pour from an empty cup\n• Focus on one task at a time rather than multitasking, which increases stress\n• Remember that you are not your job - your worth exists beyond your productivity",
    "reflection": "Throughout your workday, periodically ask yourself: \"Am I breathing deeply right now?\" Use your breath as an anchor to return to the present moment.",
    "scripture": {
      "text": "You are what you think. All that you are arises with your thoughts. With your thoughts you make the world.",
      "source": "Dhammapada, Verse 1",
      "explanation": "Our experience of stress often comes from our thoughts about our circumstances rather than the circumstances themselves. By changing our mental patterns, we can find peace even in challenging situations."
    },
    "outro": "What specific aspects of your work create the most stress for you? Are there small changes you could make to create more breathing room in your day?"
  }'
),
(
  'Self-Doubt',
  'I struggle with constant self-criticism and doubt about my abilities. How can I develop more self-compassion?',
  '{
    "intro": "Self-criticism is often our harshest teacher, yet rarely our most effective one. Your recognition of this pattern and desire for self-compassion shows tremendous wisdom and courage.",
    "practicalSteps": "• Notice your inner critic without judgment - simply observe when it arises\n• Ask yourself: \"Would I speak to a dear friend this way?\" Then offer yourself the same kindness\n• Practice loving-kindness meditation, starting with yourself\n• Celebrate small wins and progress rather than focusing only on perceived failures",
    "reflection": "Place your hand on your heart and repeat: \"May I be kind to myself. May I give myself the compassion I need. May I be strong and patient.\"",
    "scripture": {
      "text": "If you truly loved yourself, you would never hurt yourself with stressful thoughts.",
      "source": "Buddha",
      "explanation": "True self-love means protecting our minds from harmful thoughts just as we would protect our bodies from physical harm. Self-compassion is not indulgence - it''s wisdom."
    },
    "outro": "When does your inner critic tend to be loudest? What would change in your life if you treated yourself with the same kindness you show others?"
  }'
),
(
  'Loss and Grief',
  'I''m struggling to cope with the loss of someone close to me. How do I find meaning and peace in grief?',
  '{
    "intro": "Grief is love with nowhere to go, and your pain is a testament to the depth of your connection. There is no timeline for healing, and your feelings are completely valid.",
    "practicalSteps": "• Allow yourself to feel without judgment - grief comes in waves and that''s natural\n• Create meaningful rituals to honor your loved one''s memory\n• Seek support from others who understand loss - you don''t have to carry this alone\n• Practice gentle self-care, especially when grief feels overwhelming",
    "reflection": "When grief feels heavy, breathe deeply and send loving thoughts to your departed loved one. Feel the love that remains, which death cannot touch.",
    "scripture": {
      "text": "Of all footprints, that of the elephant is supreme. Similarly, of all meditative themes, that on death is supreme.",
      "source": "Buddha, Maranasati",
      "explanation": "Contemplating impermanence and death, while difficult, helps us appreciate life more deeply and find peace with the natural cycle of existence."
    },
    "outro": "What memories of your loved one bring you the most comfort? How might you honor their impact on your life in a way that brings meaning to your grief?"
  }'
);