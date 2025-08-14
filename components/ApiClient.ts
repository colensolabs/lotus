interface BuddhistGuidanceResponse {
  intro: string;
  practicalSteps: string;
  reflection: string;
  scripture: {
    text: string;
    source: string;
    explanation: string;
  };
  outro: string;
  isFollowUp?: boolean;
  simpleResponse?: string;
}

interface ApiResponse {
  content: string;
  practicalSteps?: string;
  reflection?: string;
  scripture?: {
    text: string;
    source: string;
    explanation: string;
  };
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const API_KEY = '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'; // Replace with your actual API key

export class BuddhistGuidanceAPI {
  constructor() {
    // Using hardcoded API key
  }

  async getBuddhistGuidance(userMessage: string, isFollowUp: boolean = false): Promise<BuddhistGuidanceResponse> {
    const prompt = isFollowUp ? this.createFollowUpPrompt(userMessage) : this.createStructuredPrompt(userMessage);

    try {
      const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: isFollowUp 
                ? 'You are a compassionate Buddhist counselor. Respond naturally and conversationally to continue the dialogue. Keep responses warm, supportive, and grounded in Buddhist wisdom without formal structure.'
                : 'You are a compassionate Buddhist counselor providing guidance rooted in authentic Buddhist teachings. Always respond with structured advice in the exact format requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // Debug: Log the raw API response
      console.log('Raw API Response:', content);
      console.log('---');
      
      return isFollowUp ? this.parseFollowUpResponse(content) : this.parseStructuredResponse(content);
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to get Buddhist guidance. Please try again.');
    }
  }

  private createStructuredPrompt(userMessage: string): string {
    return `
Please provide Buddhist guidance for this situation: "${userMessage}"

Respond in this exact format:

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

Keep the response compassionate, practical, and grounded in authentic Buddhist wisdom.
    `;
  }

  private createFollowUpPrompt(userMessage: string): string {
    return `
This is a follow-up question in an ongoing Buddhist guidance conversation: "${userMessage}"

Please provide a compassionate, conversational response that:
- Directly addresses their follow-up question
- Maintains the warm, supportive tone from the initial guidance
- Offers practical Buddhist wisdom without formal structure
- Keeps the response natural and flowing, like a caring conversation
- Is 2-4 paragraphs maximum
- Ends with a gentle question to continue the dialogue

Respond naturally without any special formatting or sections.
    `;
  }

  private parseStructuredResponse(content: string): BuddhistGuidanceResponse {
    console.log('Parsing content:', content.substring(0, 200) + '...');
    
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
        .replace(/\[\d+\]/g, '') // Remove citation numbers like [1], [5], etc.
        .replace(/\(\d+\)/g, '') // Remove parenthetical numbers like (1), (5)
        .replace(/\b\d+\.\s+/g, '• ') // Convert numbered lists to bullets
        .replace(/^\d+\.\s*/gm, '• ') // Convert numbered lists at start of lines
        .replace(/^\d+\.\s*/gm, '• ') // Convert numbered lists to bullets
        .replace(/^-\s*/gm, '• ') // Convert dashes to bullets
        .replace(/\s+\[\d+\]\s*/g, ' ') // Remove citations with spaces
        .replace(/\s+\(\d+\)\s*/g, ' ') // Remove parenthetical citations with spaces
        .trim();

      // Parse Intro
      const introMatch = cleanContent.match(/(?:INTRO:\s*)?([\s\S]*?)(?=PRACTICAL STEPS:|REFLECTION:|SCRIPTURE:|$)/i);
      console.log('Intro match:', introMatch ? introMatch[1].substring(0, 100) + '...' : 'No match');
      if (introMatch) {
        sections.intro = this.cleanSection(introMatch[1]);
      }

      // Parse Practical Steps
      const practicalMatch = cleanContent.match(/PRACTICAL STEPS:\s*([\s\S]*?)(?=REFLECTION:|SCRIPTURE:|$)/i);
      console.log('Practical match:', practicalMatch ? practicalMatch[1].substring(0, 100) + '...' : 'No match');
      if (practicalMatch) {
        sections.practicalSteps = this.cleanSection(practicalMatch[1]);
      }

      // Parse Reflection
      const reflectionMatch = cleanContent.match(/REFLECTION:\s*([\s\S]*?)(?=SCRIPTURE:|$)/i);
      if (reflectionMatch) {
        sections.reflection = this.cleanSection(reflectionMatch[1]);
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
          sections.scripture.explanation = this.cleanSection(explanationMatch[1]);
        }
      }

      // Parse Outro
      const outroMatch = cleanContent.match(/OUTRO:\s*([\s\S]*?)$/i);
      if (outroMatch) {
        sections.outro = this.cleanSection(outroMatch[1]);
      }

      // Debug logging to see what we're parsing
      console.log('Parsed sections:', {
        intro: sections.intro.substring(0, 100) + '...',
        practicalSteps: sections.practicalSteps.substring(0, 100) + '...',
        reflection: sections.reflection.substring(0, 100) + '...',
      });

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

  private parseFollowUpResponse(content: string): BuddhistGuidanceResponse {
    // Clean up the content
    const cleanContent = content
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/\*/g, '') // Remove italic markdown
      .replace(/\[\d+\]/g, '') // Remove citation numbers
      .replace(/\(\d+\)/g, '') // Remove parenthetical numbers
      .trim();

    return {
      intro: '',
      practicalSteps: '',
      reflection: '',
      scripture: {
        text: '',
        source: '',
        explanation: ''
      },
      outro: '',
      isFollowUp: true,
      simpleResponse: cleanContent
    };
  }

  private cleanSection(text: string): string {
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
}

// Singleton instance
const apiInstance = new BuddhistGuidanceAPI();

export const getBuddhistGuidance = async (message: string, isFollowUp: boolean = false): Promise<BuddhistGuidanceResponse> => {
  return apiInstance.getBuddhistGuidance(message, isFollowUp);
};