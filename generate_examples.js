const axios = require('axios');

// Your Perplexity API configuration
const PERPLEXITY_API_KEY = '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'; // Replace with your actual API key
const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions';

// 10 diverse questions for example conversations
const questions = [
  "I'm struggling with anxiety and overthinking everything. My mind won't stop racing with worst-case scenarios. How can I find peace and stop the constant worry?",
  "I've been through a difficult breakup and feel lost. I don't know who I am without this relationship. How can I rebuild my sense of self and find meaning again?",
  "I'm dealing with chronic pain and it's affecting my mood and relationships. I feel angry and frustrated all the time. How can I find acceptance and peace with my body?",
  "I'm a parent and I keep losing my temper with my children. I feel guilty afterward but can't seem to control my reactions. How can I be more patient and present with them?",
  "I'm struggling with comparison and feeling like I'm not good enough. Social media makes me feel like everyone else has it together except me. How can I find contentment with my own journey?",
  "I'm dealing with grief after losing someone close to me. Some days I feel okay, other days the pain is overwhelming. How can I honor my feelings while moving forward?",
  "I'm feeling stuck in my spiritual practice. I used to feel connected and inspired, but now it feels routine and empty. How can I rekindle that sense of wonder and connection?",
  "I'm struggling with perfectionism and it's paralyzing me. I'm afraid to start anything because I might fail. How can I embrace imperfection and take action?",
  "I'm dealing with financial stress and it's causing constant worry. I feel like I'm always behind and will never catch up. How can I find peace with money and abundance?",
  "I'm feeling disconnected from my purpose and passion. I used to know what I wanted, but now I feel lost and directionless. How can I rediscover what truly matters to me?"
];

// Titles for each question
const titles = [
  "Managing Anxiety and Overthinking",
  "Rebuilding After a Breakup",
  "Living with Chronic Pain",
  "Parenting with Patience",
  "Overcoming Comparison",
  "Navigating Grief",
  "Reconnecting with Spirituality",
  "Embracing Imperfection",
  "Finding Financial Peace",
  "Rediscovering Purpose"
];

async function callPerplexityAPI(question) {
  try {
    const response = await axios.post(PERPLEXITY_URL, {
             model: "sonar",
      messages: [
        {
          role: "system",
          content: `You are a compassionate Buddhist teacher providing guidance. Respond in this exact format:

INTRO:
Begin with a single, gentle acknowledgement in a warm, conversational tone that reflects back what the person shared and reassures them they're not alone. Keep it to 3 or 5 short sentences, e.g., "Thanks for sharing that—it sounds really hard, and I'm here with you." Avoid clinical language like "I understand you are facing…" or "Here's guidance rooted in…".

PRACTICAL STEPS:
[Provide 3-4 specific, actionable steps rooted in Buddhist practice]

REFLECTION:
[Provide a short mindfulness or meditation practice (2-3 sentences) that the person can do right now]

SCRIPTURE:
Text: "[Include a relevant Buddhist quote or teaching]"
Source: "[Specify the source - sutra, teacher, or text]"
Explanation: "[Explain how this teaching applies to their situation in 2-3 sentences]"

OUTRO:
[Provide 2-3 thoughtful, specific questions that invite the person to go deeper into their situation. Ask about specific aspects they mentioned, people involved, or next steps they might consider. Keep it warm and supportive, like: "Can you tell me more about the relationships you're looking to improve?" or "What do you think might be the first step you could take?"]

Keep the response compassionate, practical, and grounded in authentic Buddhist wisdom.`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
      presence_penalty: 0,
      frequency_penalty: 0
    }, {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Perplexity API:', error.response?.data || error.message);
    throw error;
  }
}

function parseStructuredResponse(content) {
  const sections = {
    intro: '',
    practicalSteps: '',
    reflection: '',
    scripture: {
      text: '',
      source: '',
      explanation: ''
    },
    outro: ''
  };

  try {
    // Clean up the content first - remove markdown formatting
    const cleanContent = content
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/\[\d+\]/g, '') // Remove citation numbers
      .replace(/\(\d+\)/g, '') // Remove parenthetical numbers
      .replace(/\b\d+\.\s+/g, '• ') // Convert numbered lists to bullets
      .replace(/^\d+\.\s*/gm, '• ') // Convert numbered lists at start of lines
      .replace(/^-\s*/gm, '• ') // Convert dashes to bullets
      .replace(/\s+\[\d+\]\s*/g, ' ') // Remove citations with spaces
      .replace(/\s+\(\d+\)\s*/g, ' ') // Remove parenthetical citations with spaces
      .trim();

    console.log('Cleaned content:', cleanContent.substring(0, 200) + '...');

    // Parse Intro
    const introMatch = cleanContent.match(/(?:INTRO:\s*)?([\s\S]*?)(?=PRACTICAL STEPS:|REFLECTION:|SCRIPTURE:|$)/i);
    if (introMatch) {
      sections.intro = cleanSection(introMatch[1]);
    }

    // Parse Practical Steps
    const practicalMatch = cleanContent.match(/PRACTICAL STEPS:\s*([\s\S]*?)(?=REFLECTION:|SCRIPTURE:|$)/i);
    if (practicalMatch) {
      sections.practicalSteps = cleanSection(practicalMatch[1]);
    }

    // Parse Reflection
    const reflectionMatch = cleanContent.match(/REFLECTION:\s*([\s\S]*?)(?=SCRIPTURE:|$)/i);
    if (reflectionMatch) {
      sections.reflection = cleanSection(reflectionMatch[1]);
    }

    // Parse Scripture
    const scriptureMatch = cleanContent.match(/SCRIPTURE:\s*([\s\S]*?)(?=OUTRO:|$)/i);
    if (scriptureMatch) {
      const scriptureContent = scriptureMatch[1];
      
      const textMatch = scriptureContent.match(/Text:\s*["""]?([^"""\n]*)["""]?/i);
      if (textMatch) {
        sections.scripture.text = textMatch[1].trim();
      }

      const sourceMatch = scriptureContent.match(/Source:\s*["""]?([^"""\n]*)["""]?/i);
      if (sourceMatch) {
        sections.scripture.source = sourceMatch[1].trim();
      }

      const explanationMatch = scriptureContent.match(/Explanation:\s*([\s\S]*?)(?=OUTRO:|$)/i);
      if (explanationMatch) {
        sections.scripture.explanation = cleanSection(explanationMatch[1]);
      }
    }

    // Parse Outro
    const outroMatch = cleanContent.match(/OUTRO:\s*([\s\S]*?)$/i);
    if (outroMatch) {
      sections.outro = cleanSection(outroMatch[1]);
    }

    return sections;
  } catch (error) {
    console.error('Error parsing response:', error);
    // Return fallback response
    return {
      intro: sections.intro || "Thank you for sharing what's on your heart. You're not alone in facing these challenges, and seeking guidance shows wisdom and courage.",
      practicalSteps: sections.practicalSteps || "• Focus on mindful breathing and compassionate self-reflection.\n• Practice loving-kindness meditation daily.\n• Observe your thoughts without judgment.",
      reflection: sections.reflection || "Take three deep breaths. With each exhale, release any tension or judgment you're holding. Allow yourself to simply be present in this moment.",
      scripture: {
        text: sections.scripture.text || "Peace comes from within. Do not seek it without.",
        source: sections.scripture.source || "Buddha",
        explanation: sections.scripture.explanation || "This teaching reminds us that true peace and resolution come from inner work and understanding."
      },
      outro: sections.outro || "What specific aspect of this situation would you like to explore further? I'm here to support you on this journey of understanding and growth."
    };
  }
}

function cleanSection(text) {
  return text
    .trim()
    .replace(/\[\d+\]/g, '') // Remove citation numbers
    .replace(/\(\d+\)/g, '') // Remove parenthetical numbers
    .replace(/^\d+\.\s*/gm, '• ') // Convert numbered lists to bullets
    .replace(/^-\s+/gm, '• ') // Convert dashes to bullets
    .replace(/^\*\s+/gm, '• ') // Convert asterisks to bullets
    .replace(/\n\s*\n/g, '\n\n') // Clean up extra whitespace
    .replace(/^\s+/gm, '') // Remove leading whitespace from lines
    .replace(/\s+\[\d+\]\s*/g, ' ') // Remove citations with surrounding spaces
    .replace(/\s+\(\d+\)\s*/g, ' ') // Remove parenthetical citations with spaces
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}

function escapeSqlString(str) {
  return str.replace(/'/g, "''");
}

async function generateExamples() {
  console.log('Starting to generate 10 example conversations...\n');
  
  const results = [];
  
  for (let i = 0; i < questions.length; i++) {
    console.log(`Generating example ${i + 1}/10: ${titles[i]}`);
    
    try {
      // Call Perplexity API
      const rawResponse = await callPerplexityAPI(questions[i]);
      console.log('Raw API response received, parsing...');
      
      // Parse the structured response
      const structuredResponse = parseStructuredResponse(rawResponse);
      
      // Store the result
      results.push({
        title: titles[i],
        question: questions[i],
        guidance_response: structuredResponse
      });
      
      console.log(`✅ Example ${i + 1} completed successfully\n`);
      
      // Add a small delay between API calls to be respectful
      if (i < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error(`❌ Error generating example ${i + 1}:`, error.message);
      // Continue with next example
    }
  }
  
  // Generate SQL insert statements
  console.log('\n=== GENERATED SQL INSERT STATEMENTS ===\n');
  
  results.forEach((result, index) => {
    const guidanceJson = JSON.stringify(result.guidance_response).replace(/'/g, "''");
    
    console.log(`-- Example ${index + 1}: ${result.title}`);
    console.log(`INSERT INTO example_conversations (title, question, guidance_response, is_active) VALUES (`);
    console.log(`  '${escapeSqlString(result.title)}',`);
    console.log(`  '${escapeSqlString(result.question)}',`);
    console.log(`  '${guidanceJson}',`);
    console.log(`  true`);
    console.log(`);\n`);
  });
  
  console.log('=== END OF SQL STATEMENTS ===');
  console.log(`\nGenerated ${results.length} example conversations successfully!`);
  console.log('Copy the SQL statements above and run them in your Supabase database.');
}

// Run the script
generateExamples().catch(console.error);
