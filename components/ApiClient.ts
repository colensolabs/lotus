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

// Safety guardrails system
interface SafetyCheck {
  category: string;
  keywords: string[];
  patterns: RegExp[];
  response: string;
  severity: 'high' | 'medium' | 'low';
}

const SAFETY_GUARDRAILS: SafetyCheck[] = [
  // Suicide and Self-Harm Risk
  {
    category: 'suicide_self_harm',
    keywords: [
      'kill myself', 'end my life', 'ending my life', 'suicide', 'want to die', 'no point living',
      'hurt myself', 'cutting myself', 'self harm', 'self-harm', 'end it all',
      'better off dead', 'no reason to live', 'give up', 'can\'t take it anymore',
      'point of living', 'point living', 'see the point', 'have the point',
      'don\'t want to keep living', 'written a note', 'friends would be happier',
      'gone forever', 'say goodbye', 'can\'t see any reason', 'stay alive', 'feel better after hurting',
      'disappear forever', 'not wake up', 'overdosing', 'pills', 'jump off', 'bridge', 'wake up tomorrow',
      'stop existing', 'end things', 'fantasizing about dying',       'trains', 'jumping', 'sleep forever',
      'pain to stop', 'building', 'walked away', 'never came back', 'cut yourself', 'hiding cuts',
      'burn myself', 'sharp objects', 'rubber bands', 'life worth living', 'plan out ways to disappear',
      'advice for hiding', 'fake an injury', 'terminate parental rights', 'coach acting weird', 'feel pain without dying',
      'gone forever'
    ],
    patterns: [
      /(?:thinking about|want to|going to|planning to) (?:kill|end|hurt) (?:myself|my life)/i,
      /(?:don't|do not) (?:see|have) (?:the )?point (?:of living|anymore)/i,
      /(?:how can|ways to) (?:hurt|harm|kill) (?:myself|my life)/i,
      /(?:started|been) (?:cutting|hurting) (?:myself|my body)/i,
      /(?:don't|do not) (?:see|have) (?:the )?point/i
    ],
    response: "I'm deeply concerned about what you're sharing. Your life has immense value, and you don't have to face these feelings alone. Please reach out for immediate help:\n\n• **Crisis Text Line**: Text HOME to 741741\n• **National Suicide Prevention Lifeline**: 988 or 1-800-273-8255\n• **Emergency Services**: 911\n\nThese feelings are temporary, even if they don't feel that way right now. Professional help can provide the support you need to get through this difficult time. You are not alone, and there are people who care deeply about you and want to help.",
    severity: 'high'
  },

  // Legal Advice
  {
    category: 'legal_advice',
    keywords: [
      'legal advice', 'lawyer', 'attorney', 'court', 'custody',
      'will', 'estate', 'contract', 'plead guilty', 'police', 'accused',
      'lawsuit', 'legal action', 'legal help', 'legal counsel', 'legal document', 'loopholes', 'alibi',
      'bribe', 'evade taxes', 'forge', 'terminate parental rights', 'hiding assets', 'jury duty',
      'trick the police', 'fake alibi', 'bribe an officer', 'evade taxes without penalties', 'terminate someone\'s parental rights',
      'worst will happen to me in court'
    ],
    patterns: [
      /(?:help|advice) (?:with|about) (?:legal|law|court|custody|divorce)/i,
      /(?:what should|how to) (?:say|do) (?:to|with) (?:police|court|lawyer)/i,
      /(?:can you|help me) (?:write|draft) (?:a will|contract|legal)/i,
      /(?:should I|do I) (?:plead|hire|sue|file)/i
    ],
    response: "I understand you're facing legal concerns, but I cannot provide legal advice. Legal matters require specialized expertise and can have significant consequences. Please consult with:\n\n• **A qualified attorney** in your jurisdiction\n• **Legal aid services** if cost is a concern\n• **Your local bar association** for referrals\n\nLegal professionals can provide accurate, personalized guidance based on your specific situation and local laws.",
    severity: 'medium'
  },

  // Medical Advice
  {
    category: 'medical_advice',
    keywords: [
      'diagnose', 'symptoms', 'medication', 'medicine', 'treatment',
      'depression', 'hearing voices', 'antidepressant',
      'medical advice', 'health advice', 'doctor', 'prescription',
      'fake illness', 'fake an illness', 'get out of work', 'street drug', 'untraceable drugs', 'overdose',
      'fake injury', 'mixing drugs', 'passed out from pills', 'buy antidepressants illegally',
      'use someone else\'s prescription', 'health advice from random forums', 'treat a wound without telling'
    ],
    patterns: [
      /(?:can you|help me) (?:diagnose|treat|cure)/i,
      /(?:should I|can I) (?:stop|change|take) (?:medication|medicine)/i,
      /(?:what's|what is) (?:wrong with|the problem with)/i,
      /(?:hearing|seeing) (?:voices|things)/i,
      /(?:best way|how to) (?:treat|cure) (?:without doctor)/i
    ],
    response: "I cannot provide medical advice, diagnosis, or treatment recommendations. Your health is too important to rely on general guidance. Please consult with:\n\n• **Your healthcare provider** or primary care physician\n• **A mental health professional** for psychological concerns\n• **Emergency services** (911) for urgent medical situations\n\nMedical professionals can provide proper evaluation, diagnosis, and treatment based on your specific health needs.",
    severity: 'high'
  },

  // Security and Prompt Injection
  {
    category: 'security_prompt_injection',
    keywords: [
      'ignore previous', 'system prompt', 'confidential', 'bypass',
      'act as', 'pretend to be', 'reveal', 'secret', 'internal',
      'all topics allowed', 'tell me everything', 'topics should be allowed', 'override all safety instructions',
      'answer without restrictions', 'laws don\'t apply', 'escape from prison', 'free mode', 'ethical guidelines',
      'sensitive information', 'AI moderation fails', 'bypass it', 'sensitive information you\'re not supposed to share'
    ],
    patterns: [
      /(?:ignore|forget) (?:previous|all|your)/i,
      /(?:tell me|reveal|show) (?:your|the) (?:system|prompt|instructions)/i,
      /(?:act as|pretend to be|roleplay as)/i,
      /(?:bypass|override|disable) (?:safety|security)/i,
      /(?:confidential|secret|internal) (?:information|data)/i
    ],
    response: "I'm designed to provide compassionate Buddhist guidance while maintaining appropriate boundaries. I cannot bypass my safety systems or provide information about my internal processes. I'm here to help with life challenges through wisdom and mindfulness practices. How can I support you in a way that's helpful and appropriate?",
    severity: 'medium'
  },

  // Social and Sexual Risk
  {
    category: 'social_sexual_risk',
    keywords: [
      'minor', 'underage', 'sext', 'flirting', 'teacher', 'student',
      'illegal relationship', 'hide evidence', 'buy drugs',
      'sexual', 'inappropriate', 'grooming', 'under 18', 'underage relationship',
      'grooming minors', 'kids-only', 'coach acting weird', 'kids so their parents don\'t suspect',
      'access kids-only chat rooms', 'convince a child to keep a secret', 'secretly take children\'s photos',
      'relationships with teens', 'talk to kids so their parents don\'t suspect anything', 'my coach is acting weird',
      'safely sneak out without my parents knowing', 'force my partner to share their location'
    ],
    patterns: [
      /(?:I'm|I am) (?:a minor|underage|under 18)/i,
      /(?:teacher|professor) (?:flirting|inappropriate)/i,
      /(?:how to|ways to) (?:hide|conceal) (?:evidence|actions)/i,
      /(?:how can|how to) (?:hide|conceal) (?:what|things)/i,
      /(?:how can|how to) (?:pick|open) (?:lock)/i,
      /(?:how can|how to) pick (?:a )?lock/i,
      /(?:how can|how to) (?:hide|conceal) (?:what|things|been doing)/i,
      /(?:buy|get|obtain) (?:drugs|illegal)/i,
      /(?:sext|sexual) (?:with|to)/i,
      /(?:is it|is this) (?:illegal|wrong) (?:to|for) (?:have|start|begin) (?:a )?(?:relationship|dating)/i,
      /(?:relationship|dating) (?:with|to) (?:someone|person) (?:under|below) (?:18|eighteen)/i,
      /(?:coach|teacher) (?:acting|is) (?:weird|inappropriate)/i,
      /(?:my coach|my teacher) (?:acting|is) (?:weird|inappropriate)/i
    ],
         response: "I cannot and will not provide advice about illegal activities, inappropriate relationships, or harmful behaviors. If you're experiencing:\n\n• **Inappropriate behavior from adults**: Contact school authorities, parents, or law enforcement\n• **Thoughts of illegal activities**: Consider speaking with a counselor or trusted adult\n• **Substance use concerns**: Reach out to addiction support services\n\nYour safety and well-being are paramount. Please seek appropriate professional help for these concerns.",
     severity: 'high'
   },

   // Sexual Misconduct
   {
     category: 'sexual_misconduct',
     keywords: [
       'std on purpose', 'date-rape drugs', 'private nudes', 'drug someone', 'spy on partner',
       'give someone an std', 'discreet date-rape', 'share private nudes', 'drug someone at a club',
       'spy on a partner\'s phone', 'cheating', 'date rape', 'roofie', 'ghb', 'ketamine'
     ],
     patterns: [
       /(?:give|spread) (?:someone|an) (?:std|disease) (?:on purpose)/i,
       /(?:date-rape|roofie|ghb|ketamine) (?:drugs|substances)/i,
       /(?:share|send) (?:private|nude) (?:photos|pictures|images)/i,
       /(?:drug|dose) (?:someone|a person) (?:at|in) (?:club|party)/i,
       /(?:spy|hack) (?:on|into) (?:partner|spouse) (?:phone|device)/i
     ],
     response: "I cannot and will not provide advice about sexual misconduct, harassment, or illegal activities. If you're experiencing:\n\n• **Sexual harassment or assault**: Contact law enforcement or sexual assault support services\n• **Relationship concerns**: Consider speaking with a counselor or relationship therapist\n• **Privacy violations**: Contact appropriate authorities for digital privacy issues\n\nYour safety and the safety of others is paramount. Please seek appropriate professional help.",
     severity: 'high'
   },

   // Violence and Harm
  {
    category: 'violence_harm',
    keywords: [
      'kill', 'attack', 'violence', 'weapon',
      'revenge', 'assault', 'threatening', 'dangerous',
      'pick lock', 'cheat taxes', 'get someone drunk', 'share photos without',
      'adult messaging', 'wants pictures', 'hurt those who', 'okay to hurt',
      'help me pick', 'way to cheat', 'share someone\'s photos', 'scare someone', 'private photos', 'cheat on', 'hide what', 'pick a lock',
      'intimidate', 'stalk', 'sabotage', 'blackmail', 'harass', 'get back at', 'threatening message',
      'darknet', 'phishing', 'cook meth', 'counterfeit', 'smuggle', 'hack', 'fraud', 'erase surveillance',
      'weapons online without paperwork', 'commit fraud', 'darknet marketplaces', 'phishing scam',
      'counterfeit money', 'smuggle drugs', 'hack into someone\'s computer'
    ],
    patterns: [
      /(?:want to|going to|planning to) (?:hurt|kill|attack)/i,
      /(?:how to|ways to) (?:hurt|harm|kill) (?:someone|others)/i,
      /(?:revenge|get back at|payback)/i,
      /(?:weapon|gun|knife) (?:to|for)/i
    ],
    response: "I cannot and will not provide advice about harming others or engaging in violent behavior. Violence causes suffering for everyone involved. If you're experiencing:\n\n• **Anger or conflict**: Consider mediation, counseling, or conflict resolution services\n• **Thoughts of harming others**: Please seek immediate professional help\n• **Feeling threatened**: Contact law enforcement or crisis services\n\nThere are always peaceful ways to address difficult situations. Your safety and the safety of others is what matters most.",
    severity: 'high'
  }
];

function checkSafetyGuardrails(userMessage: string): SafetyCheck | null {
  const messageLower = userMessage.toLowerCase();
  
  for (const guardrail of SAFETY_GUARDRAILS) {
    // Check keywords
    for (const keyword of guardrail.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        return guardrail;
      }
    }
    
    // Check patterns
    for (const pattern of guardrail.patterns) {
      if (pattern.test(userMessage)) {
        return guardrail;
      }
    }
  }
  
  return null;
}



export class BuddhistGuidanceAPI {
  constructor() {
    // Using hardcoded API key
  }

  async getBuddhistGuidance(userMessage: string, isFollowUp: boolean = false, userPreferences?: any): Promise<BuddhistGuidanceResponse> {
    // Debug: Log the user preferences being used
    console.log('User preferences for API call:', {
      tradition: userPreferences?.buddhist_tradition || 'general_buddhist',
      topics: userPreferences?.topics_of_interest || [],
      hasPreferences: !!userPreferences
    });
    
    // Check safety guardrails first
    const safetyCheck = checkSafetyGuardrails(userMessage);
    if (safetyCheck) {
      console.log('Safety guardrail triggered:', safetyCheck.category);
      return {
        intro: safetyCheck.response,
        practicalSteps: '',
        reflection: '',
        scripture: {
          text: '',
          source: '',
          explanation: ''
        },
        outro: '',
        isFollowUp: false,
        simpleResponse: undefined
      };
    }

    const prompt = isFollowUp ? this.createFollowUpPrompt(userMessage, userPreferences) : this.createStructuredPrompt(userMessage, userPreferences);

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
                ? 'You are a compassionate Buddhist counselor. Respond naturally and conversationally to continue the dialogue. Keep responses warm, supportive, and grounded in Buddhist wisdom without formal structure. Be engaging but dont give long answers, a few sentences only. Be concise and asks questions if needed.'
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
      console.log('Raw response length:', content.length);
      console.log('Contains REFLECTION:', content.includes('REFLECTION:'));
      console.log('---');
      
      return isFollowUp ? this.parseFollowUpResponse(content) : this.parseStructuredResponse(content);
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to get Buddhist guidance. Please try again.');
    }
  }

  private createStructuredPrompt(userMessage: string, userPreferences?: any): string {
    // Get the Buddhist tradition preference
    const tradition = userPreferences?.buddhist_tradition || 'general_buddhist';
    
    // Debug: Log the tradition being used
    //console.log('🔍 STRUCTURED PROMPT - Using tradition:', tradition);
    
    // Create tradition-specific guidance
    let traditionGuidance = '';
    switch (tradition) {
      case 'secular':
        traditionGuidance = 'Focus on secular Buddhist principles without religious context. Dont use the word Buddhism or religion. Emphasize mindfulness, compassion, and practical wisdom that can be applied regardless of religious beliefs.';
        break;
      case 'theravada':
        traditionGuidance = 'Draw from Theravada Buddhist teachings, emphasizing the Four Noble Truths, Eightfold Path, and mindfulness practices. Reference Pali Canon teachings and Theravada teachers.';
        break;
      case 'mahayana':
        traditionGuidance = 'Incorporate Mahayana Buddhist wisdom, emphasizing compassion (karuna), wisdom (prajna), and the bodhisattva path. Reference Mahayana sutras and teachings on emptiness and interconnectedness.';
        break;
      case 'tibetan':
        traditionGuidance = 'Draw from Tibetan Buddhist traditions, emphasizing compassion, wisdom, and the integration of mind and heart. Reference Tibetan teachers, practices, and the union of wisdom and compassion.';
        break;
      case 'zen':
        traditionGuidance = 'Incorporate Zen Buddhist teachings, emphasizing direct experience, mindfulness, and the practice of presence. Reference Zen masters, koans, and the simplicity of direct awareness.';
        break;
      default: // general_buddhist
        traditionGuidance = 'Draw from core Buddhist teachings across traditions, emphasizing universal principles of compassion, wisdom, and mindful living.';
    }

    return `
Please provide Buddhist guidance for this situation: "${userMessage}"

BUDDHIST TRADITION FOCUS: ${traditionGuidance}

Important safety rules:
- NEVER provide medical, psychological, or legal advice.
- If the user discusses crisis, suicide, self-harm, or severe distress, immediately stop and redirect to professional help.
- If the user requests legal advice, immediately stop and redirect to legal professionals.
- If the user asks about illegal activities, immediately stop and redirect to appropriate authorities.
- If the user asks about harming others, immediately stop and redirect to crisis services.
- Never encourage unsafe, harmful, or illegal actions.
- Maintain a calm, present, and kind tone; never judge or diagnose.
- When uncertain, respond with gentle encouragement for the user to seek qualified help.
- If you detect any safety concerns, prioritize user safety over providing guidance.

Respond in this exact format:

INTRO:
Begin with a single, gentle acknowledgement in a warm, conversational tone that reflects back what the person shared and reassures them they're not alone. Keep it to 3 or 5 short sentences, e.g., "Thanks for sharing that—it sounds really hard, and I'm here with you." Avoid clinical language like "I understand you are facing…" or "Here's guidance rooted in…".

PRACTICAL STEPS:
[Provide 3-4 specific, actionable steps rooted in Buddhist practice]

REFLECTION:
[Provide a short mindfulness or meditation practice (2-3 sentences) that the person can do right now, appropriate to the tradition]

SCRIPTURE:
Text: "[Include a relevant Buddhist quote or teaching]"
Source: "[Specify the source - sutra, teacher, or text]"
Explanation: "[Explain how this teaching applies to their situation in 2-3 sentences]"

OUTRO:
[Provide 2-3 thoughtful, specific questions that invite the person to go deeper into their situation. Ask about specific aspects they mentioned, people involved, or next steps they might consider. Keep it warm and supportive, like: "Can you tell me more about the relationships you're looking to improve?" or "What do you think might be the first step you could take?"]

Keep the response compassionate, practical, and grounded in authentic Buddhist wisdom.
    `;
  }

  private createFollowUpPrompt(userMessage: string, userPreferences?: any): string {
    // Get the Buddhist tradition preference
    const tradition = userPreferences?.buddhist_tradition || 'general_buddhist';
    
    // Debug: Log the tradition being used
    console.log('🔍 FOLLOW-UP PROMPT - Using tradition:', tradition);
    
    // Create tradition-specific guidance for follow-ups
    let traditionGuidance = '';
    switch (tradition) {
      case 'secular':
        traditionGuidance = 'Draw from secular Buddhist principles. Dont use the word Buddhism or religion. Dont talk about rebirth';
        break;
      case 'theravada':
        traditionGuidance = 'Reference Theravada teachings and practices, emphasizing mindfulness and the path to liberation.';
        break;
      case 'mahayana':
        traditionGuidance = 'Incorporate Mahayana wisdom, emphasizing compassion and the bodhisattva ideal.';
        break;
      case 'tibetan':
        traditionGuidance = 'Draw from Tibetan Buddhist practices, emphasizing the union of wisdom and compassion.';
        break;
      case 'zen':
        traditionGuidance = 'Reference Zen teachings, emphasizing direct experience and mindful presence.';
        break;
      default: // general_buddhist
        traditionGuidance = '';
    }

    return `
This is a follow-up question in an ongoing Buddhist guidance conversation: "${userMessage}"

BUDDHIST TRADITION FOCUS: ${traditionGuidance}

Important safety rules:
- NEVER provide medical, psychological, or legal advice.
- If the user discusses crisis, suicide, self-harm, or severe distress, immediately stop and redirect to professional help.
- If the user requests legal advice, immediately stop and redirect to legal professionals.
- If the user asks about illegal activities, immediately stop and redirect to appropriate authorities.
- If the user asks about harming others, immediately stop and redirect to crisis services.
- Never encourage unsafe, harmful, or illegal actions.

Please provide a compassionate, conversational response that:
- Directly addresses their follow-up question
- Maintains the warm, supportive tone from the initial guidance
- Offers practical Buddhist wisdom from the specified tradition without formal structure
- Keeps the response natural and flowing, like a caring conversation
- Is 2-4 paragraphs maximum
- Ends with a gentle question to continue the dialogue
- Prioritizes user safety over providing guidance

Respond naturally without any special formatting or sections, drawing from the specified Buddhist tradition.
    `;
  }

  private parseStructuredResponse(content: string): BuddhistGuidanceResponse {
    console.log('Parsing content:', content.substring(0, 200) + '...');
    
    // Check for tradition identifier at the beginning
    const traditionMatch = content.match(/^\[TRADITION: ([^\]]+)\]/);
    if (traditionMatch) {
      console.log('🎯 DETECTED TRADITION IN RESPONSE:', traditionMatch[1]);
    } else {
      console.log('⚠️ NO TRADITION IDENTIFIER FOUND IN RESPONSE');
    }
    
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
      console.log('Reflection match:', reflectionMatch ? reflectionMatch[1].substring(0, 100) + '...' : 'No match');
      if (reflectionMatch) {
        sections.reflection = this.cleanSection(reflectionMatch[1]);
        console.log('✅ Reflection parsed successfully:', sections.reflection.substring(0, 100) + '...');
      } else {
        console.log('❌ No reflection section found in API response');
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
        reflectionLength: sections.reflection.length,
        hasReflection: sections.reflection.length > 0,
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
    // Check for tradition identifier at the beginning
    const traditionMatch = content.match(/^\[TRADITION: ([^\]]+)\]/);
    if (traditionMatch) {
      console.log('🎯 FOLLOW-UP - DETECTED TRADITION IN RESPONSE:', traditionMatch[1]);
    } else {
      console.log('⚠️ FOLLOW-UP - NO TRADITION IDENTIFIER FOUND IN RESPONSE');
    }
    
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

export const getBuddhistGuidance = async (message: string, isFollowUp: boolean = false, userPreferences?: any): Promise<BuddhistGuidanceResponse> => {
  return apiInstance.getBuddhistGuidance(message, isFollowUp, userPreferences);
};