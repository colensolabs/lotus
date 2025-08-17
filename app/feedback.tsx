import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Send, Star } from 'lucide-react-native';
import { useFeedback, FeedbackType } from '@/hooks/useFeedback';
import { triggerSelectionHaptic } from '@/utils/haptics';

const feedbackTypes: { value: FeedbackType; label: string; description: string }[] = [
  { value: 'general', label: 'General', description: 'General thoughts or suggestions' },
  { value: 'feature_request', label: 'Feature Request', description: 'Suggest a new feature' },
  { value: 'bug', label: 'Bug Report', description: 'Report an issue or problem' },
  { value: 'praise', label: 'Praise', description: 'Share what you love about the app' },
  { value: 'complaint', label: 'Complaint', description: 'Share concerns or issues' },
];

export default function FeedbackScreen() {
  const { submitFeedback, isSubmitting } = useFeedback();
  const [selectedType, setSelectedType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const messageInputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    const success = await submitFeedback({
      feedback_type: selectedType,
      message,
      rating,
    });

    if (success) {
      setMessage('');
      setRating(null);
      setSelectedType('general');
      router.back();
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        <Text style={styles.starsLabel}>How would you rate your experience?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => {
                setRating(star);
                triggerSelectionHaptic();
              }}
              style={styles.starButton}
              activeOpacity={0.7}
            >
              <Star
                size={32}
                color={rating && star <= rating ? '#D4AF37' : '#E0E0E0'}
                fill={rating && star <= rating ? '#D4AF37' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#2C2C2C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={styles.placeholder} />
      </View>

             <KeyboardAvoidingView 
         style={styles.keyboardAvoidingContainer} 
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
       >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
        {/* Feedback Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What type of feedback?</Text>
          <View style={styles.typeContainer}>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeOption,
                  selectedType === type.value && styles.typeOptionSelected,
                ]}
                onPress={() => {
                  setSelectedType(type.value);
                  triggerSelectionHaptic();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.typeLabel,
                    selectedType === type.value && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
                <Text
                  style={[
                    styles.typeDescription,
                    selectedType === type.value && styles.typeDescriptionSelected,
                  ]}
                >
                  {type.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          {renderStars()}
        </View>

                  {/* Message Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your message</Text>
            <TextInput
              ref={messageInputRef}
              style={styles.messageInput}
              placeholder="Share your thoughts, suggestions, or report issues..."
              placeholderTextColor="#A0A0A0"
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              maxLength={1000}
                             onFocus={() => {
                 // Scroll to the input when it gets focus, but not too aggressively
                 setTimeout(() => {
                   scrollViewRef.current?.scrollToEnd({ animated: true });
                 }, 300);
               }}
               blurOnSubmit={false}
               returnKeyType="default"
            />
            <Text style={styles.characterCount}>
              {message.length}/1000 characters
            </Text>
          </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!message.trim() || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!message.trim() || isSubmitting}
          activeOpacity={0.7}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Send Feedback</Text>
            </>
          )}
        </TouchableOpacity>

                 <View style={styles.bottomSpacing} />
       </ScrollView>
     </KeyboardAvoidingView>
   </View>
 );
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F1E8',
    },
    keyboardAvoidingContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9F7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  typeContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  typeOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  typeOptionSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#FDFBF7',
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  typeLabelSelected: {
    color: '#D4AF37',
  },
  typeDescription: {
    fontSize: 14,
    color: '#6B6B6B',
  },
  typeDescriptionSelected: {
    color: '#B8941F',
  },
  starsContainer: {
    paddingHorizontal: 24,
  },
  starsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  messageInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    fontSize: 16,
    color: '#2C2C2C',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  characterCount: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'right',
    marginTop: 8,
    marginRight: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 24,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 50, // Reduced to prevent excessive spacing
  },
});
