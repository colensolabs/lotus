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
        throw error;
      }

      // Add to local state
      setMessages(prev => [...prev, data]);
      
      return data;
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Failed to save message');
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