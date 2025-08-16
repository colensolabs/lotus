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
      // Check if user is actually authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 Session check:', { session: !!session, sessionError, userId: session?.user?.id });
      
      if (!session) {
        console.log('❌ No valid session found');
        return null;
      }

      // Step 1: Check current user profile
      console.log('🔍 Step 1: Checking user profile...');
      const { data: profile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('id', user.id)
        .single();
      // Step 2: Create profile if it doesn't exist
      if (!profile) {
        console.log('➕ Step 2: Creating user profile...');
        const { data: newProfile, error: createProfileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email!,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          })
          .select('id')
          .single();

        console.log('📝 Profile creation result:', { newProfile, createProfileError });
        
        if (createProfileError) {
          console.error('❌ Failed to create profile:', createProfileError);
          throw createProfileError;
        }
      }
      console.log('📋 Profile check result:', { profile, profileCheckError });

      // Step 3: Create conversation
      console.log('💬 Step 3: Creating conversation...');
      const conversationData = {
        user_id: user.id,
        title,
        preview: firstMessage ? firstMessage.substring(0, 100) : null,
      };
      console.log('📝 Conversation data:', conversationData);

      // Try to insert conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select('id, title, user_id')
        .single();

      console.log('💬 Raw Supabase response:', { data, error });
      console.log('💬 Data type:', typeof data, 'Data keys:', data ? Object.keys(data) : 'null');

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data) {
        console.error('❌ No data returned from insert');
        throw new Error('No data returned from conversation insert');
      }

      if (!data.id) {
        console.error('❌ No ID in returned data:', data);
        throw new Error('No ID in returned conversation data');
      }

      console.log('🎉 Success! Conversation ID:', data.id);
      
      // Step 4: Refresh conversations list
      await fetchConversations();
      
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      console.error('💥 createConversation error:', err);
      if (err instanceof Error) {
        console.error('💥 Error message:', err.message);
        console.error('💥 Error stack:', err.stack);
      }
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