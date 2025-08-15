import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Message = Database['public']['Tables']['messages']['Row'];

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = async (content: string, isUser: boolean, guidanceData?: any): Promise<Message | null> => {
    if (!conversationId) return null;

    try {
      console.log('Attempting to save message:', {
        conversationId,
        contentLength: content.length,
        isUser,
        hasGuidanceData: !!guidanceData,
        guidanceDataType: typeof guidanceData
      });
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content,
          is_user: isUser,
          guidance_data: guidanceData || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase INSERT error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          conversationId,
          isUser,
          contentLength: content.length
        });
        throw error;
      }

      if (!data) {
        console.error('No data returned from insert operation');
        throw new Error('No data returned from database');
      }

      console.log('Message saved successfully:', {
        messageId: data.id,
        conversationId: data.conversation_id,
        isUser: data.is_user
      });
      
      // Add to local state
      setMessages(prev => [...prev, data]);
      
      return data;
    } catch (err) {
      console.error('Complete error in addMessage:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        conversationId,
        isUser,
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(`Database error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    addMessage,
    clearMessages,
  };
};