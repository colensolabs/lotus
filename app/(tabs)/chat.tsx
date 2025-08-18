import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send, User, Bot as feelbetter, MessageSquare, Square } from 'lucide-react-native';
import { getBuddhistGuidance } from '@/components/ApiClient';
import { StreamingGuidance } from '@/components/StreamingGuidance';
import { StreamingText } from '@/components/StreamingText';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useStreamingSpeed } from '@/hooks/useStreamingSpeed';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const SUGGESTION_PROMPTS = [
"How can I handle disagreements calmly and respectfully?",
"How can I deepen empathy and understanding in my relationships?",
"How can I be more present in conversations?",
"What can I do when someone close hurts me?",
"How can I support someone in a tough time?",
"What role does forgiveness play in healthy relationships?",
"How do I balance my needs with those I care about?",
"What habits build more meaningful connections?",
"How can I heal after conflict or disappointment?",
];

const getRandomSuggestions = (count: number = 3): string[] => {
  const shuffled = [...SUGGESTION_PROMPTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
  isCancelled?: boolean;
  isFollowUp?: boolean;
  guidance?: {
    intro: string;
    practicalSteps: string;
    reflection: string;
    scripture: {
      text: string;
      source: string;
      explanation: string;
    };
    outro: string;
  };
  simpleResponse?: string;
}

export default function ChatScreen() {
  const { initialPrompt, conversationId, exampleQuestion, exampleGuidanceResponse, reset } = useLocalSearchParams<{ 
    initialPrompt?: string;
    exampleQuestion?: string;
    exampleGuidanceResponse?: string;
    conversationId?: string;
    reset?: string;
  }>();
  const { speedValue, speed } = useStreamingSpeed();
  
  // Debug logging for speed value
  useEffect(() => {
    console.log('Chat screen speed value changed:', { speedValue, speed });
  }, [speedValue, speed]);
  const { createConversation, updateConversation } = useConversations();
  const { messages: dbMessages, addMessageToConversation, clearMessages } = useMessages(conversationId || null);
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);

  // Track if we've processed the initial setup
  const [hasProcessedInitialSetup, setHasProcessedInitialSetup] = useState(false);
  
  // Add a cancellation token to track ongoing API calls
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  
  // Single reset effect that triggers when navigation parameters change
  useEffect(() => {
    console.log('Reset effect triggered:', {
      conversationId,
      initialPrompt: !!initialPrompt,
      exampleQuestion: !!exampleQuestion,
      hasExampleGuidanceResponse: !!exampleGuidanceResponse,
      reset,
    });
    
    // Reset all state when navigation parameters change
    setMessages([]);
    setCurrentConversationId(conversationId || null);
    setConversationStarted(false);
    setStreamingMessageId(null);
    setIsLoading(false);
    setInputText('');
    clearMessages();
    setSuggestions(getRandomSuggestions(2));
    setHasProcessedInitialSetup(false);
  }, [conversationId, initialPrompt, exampleQuestion, exampleGuidanceResponse, reset]);

  useEffect(() => {
    console.log('Initial setup effect triggered:', {
      hasProcessedInitialSetup,
      conversationId: !!conversationId,
      initialPrompt: !!initialPrompt,
      exampleQuestion: !!exampleQuestion,
      exampleGuidanceResponse: !!exampleGuidanceResponse,
      reset,
    });
    
    if (!hasProcessedInitialSetup) {
      if (conversationId) {
        // This is an existing conversation
        console.log('Setting up existing conversation');
        setCurrentConversationId(conversationId);
        setConversationStarted(true);
      } else if (initialPrompt && typeof initialPrompt === 'string') {
        // This is a new conversation with an initial prompt
        console.log('Setting up conversation with initial prompt');
        setCurrentConversationId(null);
        setMessages([]);
        setConversationStarted(false);
        console.log('Initial prompt disabled:', initialPrompt);
        setConversationStarted(true);
      } else {
        // This is a completely new conversation with no initial prompt
        console.log('Setting up new conversation');
        setCurrentConversationId(null);
        setMessages([]);
        setConversationStarted(false);
      }
      setHasProcessedInitialSetup(true);
    }
  }, [conversationId, initialPrompt, exampleQuestion, exampleGuidanceResponse, reset]);

  // Handle initial prompt by automatically sending it
  useEffect(() => {
    if (initialPrompt && typeof initialPrompt === 'string' && hasProcessedInitialSetup && !conversationStarted) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, hasProcessedInitialSetup, conversationStarted]); 

  const handleExampleConversation = async () => {
    if (!exampleQuestion || !exampleGuidanceResponse) return;

    // Reset conversation state for new example
    setConversationStarted(false);
    setMessages([]);

    try {
      console.log('Handling example conversation:', {
        question: exampleQuestion,
        hasGuidanceResponse: !!exampleGuidanceResponse,
        guidanceType: typeof exampleGuidanceResponse,
        userAuthenticated: !!user,
      });

      // Parse the guidance response from JSON string
      let guidance: any;
      try {
        guidance = JSON.parse(exampleGuidanceResponse);
      } catch (parseError) {
        console.error('Failed to parse guidance response:', parseError);
        return;
      }

      // Create user message and show it immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        text: exampleQuestion,
        isUser: true,
        timestamp: new Date(),
      };

      // Add user message immediately for instant feedback
      setMessages([userMessage]);
      setConversationStarted(true);

      // Show typing indicator
      setIsLoading(true);

      // Check authentication in parallel while showing typing indicator
      let isAuthenticated = !!user;
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds total
      
      while (!isAuthenticated && attempts < maxAttempts) {
        console.log(`Authentication attempt ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        isAuthenticated = !!user;
        attempts++;
      }
      
      // Simulate API delay (1-2 seconds) - this happens regardless of auth status
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Create bot message with streaming enabled
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: guidance.intro || 'Guidance response',
        isUser: false,
        timestamp: new Date(),
        guidance: guidance,
        isStreaming: true, // Enable streaming for examples
        isCancelled: false, // Allow animation
      };

      // Add bot message and start streaming
      setMessages([userMessage, botMessage]);
      setStreamingMessageId(botMessage.id);
      setIsLoading(false);

      // Handle database operations based on authentication status
      if (!isAuthenticated) {
        console.log('User not authenticated - skipping database save');
        return;
      }

      // Create new conversation
      const title = exampleQuestion.length > 50 
        ? exampleQuestion.substring(0, 50) + '...' 
        : exampleQuestion;
      
      console.log('Creating conversation with authenticated user:', !!user);
      const newConversationId = await createConversation(title, exampleQuestion);
      if (!newConversationId) {
        // Privacy is enabled - continue without saving to database
        console.log('Privacy enabled - continuing example without conversation ID');
        setCurrentConversationId(null);
      } else {
        setCurrentConversationId(newConversationId);
      }

      // Save messages to database (only if conversation was created)
      if (newConversationId) {
        try {
          await addMessageToConversation(newConversationId, exampleQuestion, true);
          await addMessageToConversation(newConversationId, guidance.intro || 'Guidance response', false, {
            isFollowUp: false,
            guidance: guidance,
          });
          
          // Update conversation stats
          await updateConversation(newConversationId, {
            preview: exampleQuestion.substring(0, 100),
            last_message_at: new Date().toISOString(),
          });
          
          console.log('Example conversation saved successfully');
        } catch (error) {
          console.error('Failed to save example conversation messages:', error);
        }
      } else {
        console.log('Privacy enabled - example conversation not saved to database');
      }
    } catch (error) {
      console.error('Error handling example conversation:', error);
      setIsLoading(false);
    }
  };

  // Handle example conversation by pre-populating messages
  useEffect(() => {
    console.log('Example conversation effect triggered:', {
      exampleQuestion,
      hasExampleGuidanceResponse: !!exampleGuidanceResponse,
      hasProcessedInitialSetup,
      conversationStarted,
      reset,
    });
    
    if (exampleQuestion && exampleGuidanceResponse && hasProcessedInitialSetup) {
      console.log('Calling handleExampleConversation');
      handleExampleConversation();
    }
  }, [exampleQuestion, exampleGuidanceResponse, hasProcessedInitialSetup, reset]);

  // Separate effect for loading messages when conversationId changes
  useEffect(() => {
    if (conversationId && dbMessages.length > 0) {
      console.log('Loading conversation history:', {
        conversationId,
        messageCount: dbMessages.length,
        messages: dbMessages.map(msg => ({
          id: msg.id,
          isUser: msg.is_user,
          content: msg.content?.substring(0, 50) + '...',
          hasGuidanceData: !!msg.guidance_data,
          guidanceData: msg.guidance_data,
        }))
      });
      
      const loadedMessages: Message[] = dbMessages.map(msg => {
        const message: Message = {
          id: msg.id,
          text: msg.content,
          isUser: msg.is_user,
          timestamp: new Date(msg.created_at || Date.now().toString()),
          isFollowUp: (msg.guidance_data as any)?.isFollowUp || false,
          guidance: (msg.guidance_data as any)?.guidance || undefined,
          simpleResponse: (msg.guidance_data as any)?.simpleResponse || undefined,
          isStreaming: false,
          isCancelled: true, // This ensures no streaming animation for historical messages
        };
        
        console.log('Mapped message:', {
          id: message.id,
          isUser: message.isUser,
          hasGuidance: !!message.guidance,
          hasSimpleResponse: !!message.simpleResponse,
          isFollowUp: message.isFollowUp,
        });
        
        return message;
      });
      
      console.log('Setting loaded messages:', loadedMessages.length);
      setMessages(loadedMessages);
      
      // Scroll to bottom when loading conversation history
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [conversationId, dbMessages]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;
    if (isLoading) return;

    let conversationIdToUse = currentConversationId || conversationId || null;

    // Create new conversation if this is the first message
    if (!conversationIdToUse) {
      const title = messageText.length > 50 
        ? messageText.substring(0, 50) + '...' 
        : messageText;
      
      conversationIdToUse = await createConversation(title, messageText);
      if (!conversationIdToUse) {
        // Privacy is enabled - continue without saving to database
        console.log('Privacy enabled - continuing without conversation ID');
        setCurrentConversationId(null);
      } else {
        setCurrentConversationId(conversationIdToUse);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Generate a unique request ID for this API call
    const requestId = Date.now().toString();
    setCurrentRequestId(requestId);
    
    // Save user message to database immediately
    try {
      if (conversationIdToUse) {
        const savedUserMessage = await addMessageToConversation(conversationIdToUse, messageText, true);
        if (savedUserMessage) {
          console.log('User message saved successfully');
        } else {
          console.log('User message not saved - privacy enabled');
        }
      }
    } catch (error) {
      console.error('Failed to save user message:', error);
    }

    // Determine if this is a follow-up message
    const isFollowUp = conversationStarted && messages.length > 0;

    try {
      console.log('Starting API call to getBuddhistGuidance...');
      const guidance = await getBuddhistGuidance(messageText, isFollowUp, preferences || undefined);
      console.log('API call completed successfully!');
      
      // Debug: Log the guidance response
      console.log('Guidance response received:', {
        isFollowUp: guidance.isFollowUp,
        hasSimpleResponse: !!guidance.simpleResponse,
        intro: guidance.intro?.substring(0, 100) + '...',
        hasGuidance: !!guidance.intro,
      });
      
      const messageId = (Date.now() + 1).toString();
      
      let botMessage: Message;
      
      // Check if this is a safety guardrail response (has intro but no other guidance fields)
      const isSafetyResponse = guidance.intro && 
        !guidance.practicalSteps && 
        !guidance.reflection && 
        !guidance.scripture.text && 
        !guidance.outro;

      if (guidance.isFollowUp && guidance.simpleResponse) {
        // Follow-up response - simple format
        console.log('Creating follow-up message with simple response');
        botMessage = {
          id: messageId,
          text: guidance.simpleResponse,
          isUser: false,
          timestamp: new Date(),
          isStreaming: true,
          isFollowUp: true,
          simpleResponse: guidance.simpleResponse,
        };
      } else if (isSafetyResponse) {
        // Safety guardrail response - display as simple alert message
        console.log('Creating safety guardrail message');
        botMessage = {
          id: messageId,
          text: guidance.intro,
          isUser: false,
          timestamp: new Date(),
          isStreaming: true,
          simpleResponse: guidance.intro, // Use simpleResponse to trigger simple display
        };
      } else {
        // Initial structured response
        console.log('Creating structured guidance message');
        botMessage = {
          id: messageId,
          text: guidance.intro,
          isUser: false,
          timestamp: new Date(),
          isStreaming: true,
          guidance,
        };
        
        // Debug: Log the guidance object structure
        console.log('Guidance object structure:', {
          hasIntro: !!guidance.intro,
          hasPracticalSteps: !!guidance.practicalSteps,
          hasReflection: !!guidance.reflection,
          hasScripture: !!guidance.scripture,
          hasOutro: !!guidance.outro,
          introLength: guidance.intro?.length || 0,
        });
      }
      
      console.log('Adding bot message to state:', {
        messageId,
        isFollowUp: botMessage.isFollowUp,
        hasGuidance: !!botMessage.guidance,
        hasSimpleResponse: !!botMessage.simpleResponse,
      });
      
      setMessages(prev => [...prev, botMessage]);
      setStreamingMessageId(messageId);
      
      // Save bot message to database
      try {
        if (conversationIdToUse) {
          const guidanceData = guidance.isFollowUp && guidance.simpleResponse 
            ? {
                isFollowUp: true,
                simpleResponse: guidance.simpleResponse,
              }
            : isSafetyResponse
            ? {
                isFollowUp: false,
                simpleResponse: guidance.intro, // Save safety response as simple response
              }
            : {
                isFollowUp: false,
                guidance,
              };
          
          const messageContent = guidance.isFollowUp && guidance.simpleResponse 
            ? guidance.simpleResponse 
            : guidance.intro;
            
          const savedBotMessage = await addMessageToConversation(conversationIdToUse, messageContent, false, guidanceData);
          if (savedBotMessage) {
            console.log('Bot message saved successfully:', savedBotMessage.id);
            
            // Update conversation preview and stats only if message was saved
            await updateConversation(conversationIdToUse, {
              preview: messageText.substring(0, 100),
              last_message_at: new Date().toISOString(),
            });
          } else {
            console.log('Bot message not saved - privacy enabled');
          }
        }
      } catch (error) {
        console.error('Failed to save bot message:', error);
        console.error('Bot message save error details:', error);
      }

      if (!conversationStarted) {
        setConversationStarted(true);
      }
    } catch (error) {
      console.error('API Error occurred:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
      });
      
      Alert.alert(
        'Error',
        'Failed to get guidance. Please try again.'
      );
      
      // Remove the user message from UI if API call failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleStreamingComplete = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false }
          : msg
      )
    );
    setStreamingMessageId(null);
  };

  const handleStreamingCancel = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: false, isCancelled: true }
          : msg
      )
    );
    setStreamingMessageId(null);
  };

  const handleRetry = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: true, isCancelled: false }
          : msg
      )
    );
    setStreamingMessageId(messageId);
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSendMessage(suggestion);
    setConversationStarted(true);
  };

  const SuggestionBubbles = () => (
    <View style={styles.suggestionsContainer}>
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={styles.suggestionBubble}
          onPress={() => handleSuggestionPress(suggestion)}
          activeOpacity={0.7}
        >
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMessage = (message: Message) => {
    console.log('Rendering message:', {
      id: message.id,
      isUser: message.isUser,
      isFollowUp: message.isFollowUp,
      hasGuidance: !!message.guidance,
      hasSimpleResponse: !!message.simpleResponse,
      text: message.text?.substring(0, 50) + '...',
    });
    
    if (message.isUser) {
      return (
        <View key={message.id} style={styles.userMessageContainer}>
          <View style={styles.userMessage}>
            <Text style={styles.userMessageText}>{message.text}</Text>
          </View>
        </View>
      );
    }
    
    // Handle follow-up messages with simple streaming text
    if (message.isFollowUp && message.simpleResponse) {
      console.log('Rendering follow-up message with simple response');
      return (
        <View key={message.id} style={styles.botMessageContainer}>
          <View style={styles.botIconContainer}>
            <Image source={require('../../assets/images/logo2.jpg')} style={styles.botIconImage} />
          </View>
          <View style={styles.botMessage}>
                         <StreamingText
               text={message.simpleResponse}
               speed={speedValue}
               onComplete={() => handleStreamingComplete(message.id)}
               isCancelled={message.isCancelled}
               hapticsEnabled={true}
               style={styles.followUpText}
             />
            {message.isStreaming && streamingMessageId === message.id && (
              <View style={styles.followUpControlsContainer}>
                <TouchableOpacity
                  style={styles.followUpShowButton}
                  onPress={() => handleStreamingCancel(message.id)}
                  activeOpacity={0.7}
                >
                  <Square size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.followUpShowButtonText}>Show</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }
    
    // Handle safety guardrail messages (simple response without follow-up or guidance)
    if (message.simpleResponse && !message.isFollowUp && !message.guidance) {
      console.log('Rendering safety guardrail message');
      return (
        <View key={message.id} style={styles.botMessageContainer}>
          <View style={styles.botIconContainer}>
            <Image source={require('../../assets/images/logo2.jpg')} style={styles.botIconImage} />
          </View>
          <View style={styles.botMessage}>
            <StreamingText
              text={message.simpleResponse}
              speed={speedValue}
              onComplete={() => handleStreamingComplete(message.id)}
              isCancelled={message.isCancelled}
              hapticsEnabled={true}
              style={styles.safetyAlertText}
            />
            {message.isStreaming && streamingMessageId === message.id && (
              <View style={styles.followUpControlsContainer}>
                <TouchableOpacity
                  style={styles.followUpShowButton}
                  onPress={() => handleStreamingCancel(message.id)}
                  activeOpacity={0.7}
                >
                  <Square size={16} color="#FFFFFF" strokeWidth={2} />
                  <Text style={styles.followUpShowButtonText}>Show</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      );
    }
    
    // Handle structured guidance messages
    console.log('Rendering structured guidance message');
    return (
      <View key={message.id} style={styles.botMessageContainer}>
        <View style={styles.botIconContainer}>
          <Image source={require('../../assets/images/logo2.jpg')} style={styles.botIconImage} />
        </View>
        <View style={styles.botMessage}>
          {message.guidance ? (
                         <StreamingGuidance
               guidance={message.guidance}
               speed={speedValue}
               isCancelled={message.isCancelled}
             />
          ) : (
            <Text style={styles.followUpText}>{message.text}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.headerLogoContainer}>
            <Image source={require('../../assets/images/logo2.jpg')} style={styles.headerLogoImage} />
          </View>
          <Text style={styles.headerTitle}>
            {conversationId ? 'Continue Chat' : 'feel better'}
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Image source={require('../../assets/images/logo2.jpg')} style={styles.emptyStateLogo} />
              <Text style={styles.emptyStateTitle}>Share what's on your heart</Text>
              <Text style={styles.emptyStateText}>
                Ask for guidance on any challenge you're facing, and receive compassionate Buddhist wisdom.
              </Text>
              <SuggestionBubbles />
            </View>
          )}
          
          {messages.map((message, index) => {
            console.log(`Message ${index}:`, {
              id: message.id,
              isUser: message.isUser,
              text: message.text?.substring(0, 30) + '...',
              hasGuidance: !!message.guidance,
              hasSimpleResponse: !!message.simpleResponse,
            });
            return renderMessage(message);
          })}
          
          {isLoading && (
            <TypingIndicator />
          )}
        </ScrollView>

        <View style={[styles.inputContainer, Platform.OS === 'ios' && styles.inputContainerIOS]}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Share what's troubling you..."
            placeholderTextColor="#A0A0A0"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#D4AF37" />
            ) : (
              <Send size={20} color={!inputText.trim() ? '#C0C0C0' : '#FFFFFF'} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    paddingTop: Platform.OS === 'ios' ? 50 : 0,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerLogoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F9F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  headerLogoImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2C2C2C',
  },
  messagesContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2C2C2C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  suggestionsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    gap: 8,
  },
  suggestionBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2C2C2C',
    lineHeight: 18,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userMessage: {
    backgroundColor: '#D4AF37',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  userMessageText: {
    color: '#FEFEFE',
    fontSize: 15,
    lineHeight: 22,
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  botIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  botIconImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  botMessage: {
    flex: 1,
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainerIOS: {},
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2C2C2C',
    backgroundColor: '#F9F7F4',
    minHeight: 60,
    maxHeight: 100,
    marginRight: 12,
    textAlignVertical: Platform.OS === 'ios' ? 'center' : 'top',
    ...Platform.select({
      ios: {
        paddingTop: 16,
        paddingBottom: 16,
      },
    }),
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#D4AF37',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#E8E8E8',
    shadowOpacity: 0,
  },
  followUpText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 24,
  },
  safetyAlertText: {
    fontSize: 15,
    color: '#D32F2F',
    lineHeight: 24,
    fontWeight: '500',
  },
  followUpControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  followUpShowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  followUpShowButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  introText: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  sectionText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 24,
  },
  practicalStepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepsContainer: {
    marginTop: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 22,
    flex: 1,
  },
  scriptureSection: {
    backgroundColor: '#F9F7F4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    marginBottom: 16,
  },
  scriptureText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  scriptureSource: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
  },
  explanationSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#5A5A5A',
    lineHeight: 20,
  },
  outroContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  outroText: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});