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

    // Ensure user profile exists before creating conversation
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        console.log('User profile not found, creating one...');
        const { error: createProfileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email!,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          });
        
        if (createProfileError) {
          console.error('Failed to create user profile:', createProfileError);
          throw new Error('Failed to create user profile');
        }
      }
    } catch (profileErr) {
      console.error('Profile check/creation failed:', profileErr);
      setError('Failed to verify user profile. Please try logging out and back in.');
      return null;
    }

    try {
      console.log('Creating conversation:', { title, userId: user.id, firstMessage });
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title,
          preview: firstMessage ? firstMessage.substring(0, 100) : null,
          message_count: 0,
          last_message_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error creating conversation:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data) {
        console.error('No data returned from conversation insert');
        throw new Error('No data returned from conversation creation');
      }

      if (!data.id) {
        console.error('Conversation created but no data returned:', data);
        throw new Error('Conversation created but no ID returned');
      }

      console.log('Conversation created successfully:', data.id);
      
      // Refresh conversations list
      await fetchConversations();
      
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', {
        error: err,
        user: user?.id,
        title,
        firstMessage
      });
      
      // More specific error messages
      if (err instanceof Error) {
        if (err.message.includes('violates row-level security policy')) {
          setError('Authentication error. Please try logging out and back in.');
        } else if (err.message.includes('violates foreign key constraint')) {
          setError('User profile error. Please try refreshing the app.');
        } else if (err.message.includes('no ID returned')) {
          setError('Database error. Please check your connection and try again.');
        } else {
          setError(`Failed to create conversation: ${err.message}`);
        }
      } else {
        setError('Failed to create conversation. Please try again.');
      }
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