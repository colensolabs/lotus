import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { triggerSelectionHaptic } from '@/utils/haptics';

export type FeedbackType = 'bug' | 'feature_request' | 'general' | 'praise' | 'complaint';

export interface FeedbackSubmission {
  feedback_type: FeedbackType;
  message: string;
  rating?: number | null;
  metadata?: Record<string, any>;
}

export function useFeedback() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (feedback: FeedbackSubmission) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to submit feedback.');
      return false;
    }

    if (!feedback.message.trim()) {
      Alert.alert('Message Required', 'Please enter your feedback message.');
      return false;
    }

    setIsSubmitting(true);
    triggerSelectionHaptic();

    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          feedback_type: feedback.feedback_type,
          message: feedback.message.trim(),
          rating: feedback.rating,
          metadata: {
            app_version: '1.0.0', // You can make this dynamic
            platform: 'mobile',
            ...feedback.metadata,
          },
        });

      if (error) {
        console.error('Error submitting feedback:', error);
        Alert.alert('Error', 'Failed to submit feedback. Please try again.');
        return false;
      }

      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully. We appreciate your input!'
      );
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFeedback,
    isSubmitting,
  };
}
