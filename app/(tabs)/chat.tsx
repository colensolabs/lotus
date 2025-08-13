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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Send, User, Bot as Lotus, MessageSquare } from 'lucide-react-native';
import { getBuddhistGuidance } from '@/components/ApiClient';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

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
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: guidance.intro,
          isUser: false,
          timestamp: new Date(),
          guidance,
        };
        setMessages(prev => [...prev, botMessage]);
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
          <Text style={styles.botMessageText}>{message.text}</Text>
          
          {message.guidance && (
            <View style={styles.guidanceContainer}>
              <View style={styles.practicalStepsCard}>
                <Text style={styles.sectionTitle}>Practical Steps</Text>
                <View style={styles.stepsContainer}>
                  {message.guidance.practicalSteps
                    .split(/[•\n]/)
                    .filter(step => step.trim().length > 0)
                    .map((step, index) => (
                      <View key={index} style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step.trim()}</Text>
                      </View>
                    ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reflection</Text>
                <Text style={styles.sectionText}>{message.guidance.reflection}</Text>
              </View>

              <View style={styles.scriptureSection}>
                <Text style={styles.sectionTitle}>Buddhist Teaching</Text>
                <Text style={styles.scriptureText}>"{message.guidance.scripture.text}"</Text>
                <Text style={styles.scriptureSource}>— {message.guidance.scripture.source}</Text>
              </View>

              <View style={styles.explanationSection}>
                <Text style={styles.explanationTitle}>Understanding the Teaching</Text>
                <Text style={styles.explanationText}>{message.guidance.scripture.explanation}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
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
            </View>
          )}
          
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#D4AF37" />
              <Text style={styles.loadingText}>Seeking wisdom...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
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
  botMessageText: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  guidanceContainer: {
    marginTop: 8,
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
    marginBottom: 0,
  },
  explanationSection: {
    marginTop: 16,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B6B6B',
    marginLeft: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingVertical: 12,
    fontSize: 15,
    color: '#2C2C2C',
    backgroundColor: '#F9F7F4',
    maxHeight: 100,
    marginRight: 12,
    lineHeight: 20,
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