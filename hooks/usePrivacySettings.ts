import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useConversations } from './useConversations';
import { Alert } from 'react-native';

export const usePrivacySettings = () => {
  const { user } = useAuth();
  const { conversations } = useConversations();
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState<boolean | null>(null); // Start with null to indicate loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPrivacySetting();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadPrivacySetting = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('save_conversations')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading privacy setting:', error);
        setIsPrivacyEnabled(false); // Default to privacy OFF
      } else {
        // If save_conversations is true, privacy is OFF (conversations are saved)
        // If save_conversations is false, privacy is ON (conversations are not saved)
        setIsPrivacyEnabled(!(data?.save_conversations ?? true));
      }
    } catch (error) {
      console.error('Error in loadPrivacySetting:', error);
      setIsPrivacyEnabled(false); // Default to privacy OFF
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrivacySetting = async (privacyEnabled: boolean) => {
    if (!user) return;

    try {
      // If privacy is being enabled, we need to delete existing conversations
      if (privacyEnabled && conversations.length > 0) {
        Alert.alert(
          'Enable Privacy Mode?',
          `You have ${conversations.length} saved conversations. Enabling privacy will delete all existing conversations and prevent future conversations from being saved. This cannot be undone.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Enable Privacy',
              style: 'destructive',
              onPress: async () => {
                await performPrivacyUpdate(privacyEnabled);
              },
            },
          ]
        );
      } else {
        await performPrivacyUpdate(privacyEnabled);
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      Alert.alert('Error', 'Failed to update privacy setting');
    }
  };

  const performPrivacyUpdate = async (privacyEnabled: boolean) => {
    try {
      // If privacy is ON, save_conversations should be false
      // If privacy is OFF, save_conversations should be true
      const saveConversations = !privacyEnabled;

      // Delete conversations if privacy is being enabled
      if (privacyEnabled && conversations.length > 0) {
        const { error: deleteError } = await supabase
          .from('conversations')
          .update({ is_archived: true })
          .eq('user_id', user?.id);

        if (deleteError) throw deleteError;
      }

      // Update the preference
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          save_conversations: saveConversations,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setIsPrivacyEnabled(privacyEnabled);
      console.log(`Privacy ${privacyEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error in performPrivacyUpdate:', error);
      throw error;
    }
  };

  return {
    isPrivacyEnabled,
    updatePrivacySetting,
    isLoading,
  };
};
