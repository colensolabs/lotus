/*
  # Add Example Conversations

  1. New Data
    - Three example conversations for the home screen
    - Each includes title, question, and structured guidance response
    - All set as active (is_active = true)

  2. Content Areas
    - Relationship communication and conflict resolution
    - Work stress and career decisions
    - Family dynamics and boundaries
*/

-- Insert three example conversations
INSERT INTO example_conversations (title, question, guidance_response, is_active) VALUES 

-- Example 1: Relationship Communication
(
  'Relationship Communication',
  'I''m having difficulty communicating with my partner during conflicts. We both get defensive and nothing gets resolved. How can I approach disagreements with more compassion?',
  '{
    "intro": "Thank you for sharing this challenge with such honesty. Conflict in relationships is natural, and your desire to approach disagreements with compassion shows both wisdom and deep love for your partner.",
    "practicalSteps": "• Practice the sacred pause: Take three conscious breaths before responding when emotions rise\n• Use \"I\" statements to express your feelings without blame or accusation\n• Listen with the intention to understand, not to win or be right\n• Acknowledge your partner''s perspective before sharing your own\n• Set a loving intention before difficult conversations",
    "reflection": "Before your next conversation, place your hand on your heart and set an intention of loving-kindness for both yourself and your partner. Remember that you''re both trying to be heard and understood.",
    "scripture": {
      "text": "Hatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.",
      "source": "Dhammapada 1.5",
      "explanation": "This teaching reminds us that responding to conflict with more conflict only creates suffering. True resolution comes through compassion, patience, and understanding rather than defensiveness or blame."
    },
    "outro": "What specific moments in your conversations feel most challenging? Are there particular topics or times when defensiveness arises most strongly?"
  }',
  true
),

-- Example 2: Work Stress and Career Decisions
(
  'Career Decision Making',
  'I''m feeling overwhelmed at work and considering a career change, but I''m scared of making the wrong decision. The stress is affecting my sleep and relationships. How do I find clarity?',
  '{
    "intro": "Your awareness of how work stress is affecting your whole life shows great mindfulness. Career decisions can feel overwhelming, but there are ways to find clarity through the fog of anxiety.",
    "practicalSteps": "• Create space for stillness: Set aside 10 minutes daily for quiet reflection without devices\n• Practice the ''middle way'' - avoid extreme thinking about staying or leaving\n• Journal about your values and what truly brings you fulfillment\n• Seek wise counsel from trusted friends or mentors\n• Notice what your body tells you when you imagine different paths",
    "reflection": "Sit quietly and imagine yourself one year from now. What would bring you the deepest sense of peace and purpose? Trust the wisdom that arises from stillness.",
    "scripture": {
      "text": "Do not believe in anything simply because you have heard it. But after observation and analysis, when you find that anything agrees with reason and is conducive to the good and benefit of one and all, then accept it and live up to it.",
      "source": "Buddha, Kalama Sutta",
      "explanation": "This teaching encourages us to make decisions based on careful observation and wisdom rather than fear or external pressure. Trust your inner knowing when it aligns with what serves your highest good."
    },
    "outro": "What aspects of your current work bring you joy, and what aspects drain your energy? Understanding this pattern can guide your next steps."
  }',
  true
),

-- Example 3: Family Boundaries and Dynamics
(
  'Family Boundaries',
  'My family has a pattern of guilt-tripping and emotional manipulation when I try to set boundaries. I love them but feel drained after every interaction. How can I maintain my peace while staying connected?',
  '{
    "intro": "Setting boundaries with family while maintaining love and connection is one of life''s most delicate challenges. Your recognition of these patterns shows courage and self-awareness.",
    "practicalSteps": "• Practice compassionate detachment - love them without absorbing their emotions\n• Set clear, kind boundaries and maintain them consistently\n• Respond rather than react - pause before engaging with guilt or manipulation\n• Cultivate your own inner peace through daily meditation or mindfulness\n• Remember that you can''t control their reactions, only your responses",
    "reflection": "Before family interactions, take a moment to center yourself. Imagine a protective bubble of loving-kindness around you that allows love in but keeps manipulation out.",
    "scripture": {
      "text": "You yourself, as much as anybody in the entire universe, deserve your love and affection.",
      "source": "Buddha",
      "explanation": "This teaching reminds us that self-compassion and self-care are not selfish but necessary. We cannot pour from an empty cup, and maintaining our own well-being allows us to love others more fully."
    },
    "outro": "What would it feel like to interact with your family from a place of inner strength rather than obligation? How might this change the dynamic?"
  }',
  true
);