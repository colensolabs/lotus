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
import { Send, User, Bot as Lotus, MessageSquare } from 'lucide-react-native';
import { getBuddhistGuidance } from '@/components/ApiClient';
import { StreamingGuidance } from '@/components/StreamingGuidance';
import { TypingIndicator } from '@/components/TypingIndicator';
import { useStreamingSpeed } from '@/hooks/useStreamingSpeed';

const SUGGESTION_PROMPTS = [
  "How can I navigate disagreements while staying calm and respectful?",
  "What are some ways to deepen empathy and understanding in my connections?",
  "How might I be more present with others during conversations?",
  "What can I do when I feel hurt by someone close to me?",
  "How can I support someone who is going through a tough time?",
  "What role does forgiveness play in healthy relationships?",
  "How do I balance my own needs with those of people I care about?",
  "What habits encourage more meaningful connections?",
  "How can I heal after conflict or disappointment in a relationship?"
];

const getRandomSuggestions = (count: number = 3): string[] => {
  const shuffled = [...SUGGESTION_PROMPTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
  isCancelled?: boolean;
  guidance?: {
    intro: string;
    practicalSteps: string;
    reflection: string;
    scripture: {
      text: string;
      source: string;
      explanation: string;
    };
  };
}

export default function ChatScreen() {
  const { initialPrompt } = useLocalSearchParams<{ initialPrompt?: string }>();
  const { speedValue } = useStreamingSpeed();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Generate random suggestions on component mount
    setSuggestions(getRandomSuggestions(3));
  }, []);

  useEffect(() => {
    if (initialPrompt && typeof initialPrompt === 'string') {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    getBuddhistGuidance(messageText)
      .then((guidance) => {
        const messageId = (Date.now() + 1).toString();
        const botMessage: Message = {
          id: messageId,
          text: guidance.intro,
          isUser: false,
          timestamp: new Date(),
          isStreaming: true,
          guidance,
        };
        setMessages(prev => [...prev, botMessage]);
        setStreamingMessageId(messageId);
      })
      .catch((error) => {
        console.error('API Error:', error);
        Alert.alert(
          'Error',
          'Failed to get guidance. Please try again.'
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
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
    if (message.isUser) {
      return (
        <View key={message.id} style={styles.userMessageContainer}>
          <View style={styles.userMessage}>
            <Text style={styles.userMessageText}>{message.text}</Text>
          </View>
        </View>
      );
    }
    return (
      <View key={message.id} style={styles.botMessageContainer}>
        <View style={styles.botIconContainer}>
          <Image source={require('../../assets/images/logo2.jpg')} style={styles.botIconImage} />
        </View>
        <View style={styles.botMessage}>
          {message.guidance && (
            <StreamingGuidance
              guidance={message.guidance}
              speed={speedValue}
            />
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
          <Text style={styles.headerTitle}>Lotus Guide</Text>
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
          
          {messages.map(renderMessage)}
          
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
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestionBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
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
    textAlign: 'center',
    lineHeight: 20,
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
});