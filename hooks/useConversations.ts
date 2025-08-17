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
    if (!user) return null;

    // Check if user has privacy enabled (don't save conversations)
    try {
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('save_conversations')
        .eq('user_id', user.id)
        .maybeSingle();

      // If save_conversations is false, don't create conversation
      if (preferences && preferences.save_conversations === false) {
        console.log('Privacy enabled - not saving conversation');
        return null;
      }
    } catch (error) {
      console.error('Error checking privacy settings:', error);
      // Continue with saving if we can't check preferences
    }

    try {
      console.log('Creating conversation:', { title, userId: user.id });
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title,
          preview: firstMessage ? firstMessage.substring(0, 100) : null,
          message_count: 0,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating conversation:', error);
        throw error;
      }

      console.log('Conversation created successfully:', data.id);
      
      // Refresh conversations list
      await fetchConversations();
      
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
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