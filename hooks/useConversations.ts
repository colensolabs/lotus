import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@/types/database';

type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });

      if (error) {
        throw error;
      }

      setConversations(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (title: string, firstMessage?: string): Promise<string | null> => {
    console.log('🚀 createConversation called with:', { title, firstMessage, userId: user?.id });
    
    if (!user) return null;

    try {
      // First, ensure user profile exists
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.error('Failed to ensure user profile:', upsertError);
        throw upsertError;
      }

      // Now create the conversation
      console.log('👤 User details:', { 
        id: user.id, 
        email: user.email, 
        metadata: user.user_metadata 
      });

      console.log('🔍 Checking if user profile exists...');
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      console.log('📋 Existing profile check result:', { existingProfile, checkError });

      if (!existingProfile) {
        console.log('➕ Creating user profile...');
        const profileData = {
          id: user.id,
          email: user.email!,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString(),
        };
        console.log('📝 Profile data to insert:', profileData);

        const { data: newProfile, error: profileError } = await supabase
          .from('user_profiles')
          .insert(profileData)
          .select('id')
          .single();

        console.log('✅ Profile creation result:', { newProfile, profileError });

        if (profileError) {
          console.error('❌ Profile creation failed:', profileError);
          throw profileError;
        }
      } else {
        console.log('✅ User profile already exists');
      }

      // Now create the conversation
      console.log('💬 Creating conversation...');
      const conversationData = {
        user_id: user.id,
        title,
        preview: firstMessage ? firstMessage.substring(0, 100) : null,
      };
      console.log('📝 Conversation data to insert:', conversationData);

      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select('*')
        .single();

      console.log('💬 Conversation creation result:', { conversation, conversationError });

      if (conversationError) {
        console.error('Failed to create conversation:', conversationError);
        console.error('❌ Conversation creation failed:', {
          error: conversationError,
          code: conversationError.code,
          message: conversationError.message,
          details: conversationError.details,
          hint: conversationError.hint
        });
        throw conversationError;
      }

      if (!conversation?.id) {
        console.error('No conversation ID returned');
        console.error('❌ No conversation ID returned. Full response:', conversation);
        throw new Error('No conversation ID returned');
      }

      // Refresh conversations list
      console.log('🎉 Conversation created successfully with ID:', conversation.id);

      console.log('🔄 Refreshing conversations list...');
      await fetchConversations();
      
      return conversation.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      console.error('💥 Error in createConversation:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      console.log('❌ No user found');
      return null;
    }
  };

  const updateConversation = async (conversationId: string, updates: Partial<Conversation>) => {
    try {
      console.log('Updating conversation:', conversationId, updates);
      
      const { error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', conversationId);

      if (error) {
        console.error('Supabase error updating conversation:', error);
        throw error;
      }

      console.log('Conversation updated successfully');
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, ...updates }
            : conv
        )
      );
    } catch (err) {
      console.error('Error updating conversation:', err);
      setError('Failed to update conversation');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: true })
        .eq('id', conversationId);

      if (error) {
        throw error;
      }

      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
    }
  };

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
  };
};