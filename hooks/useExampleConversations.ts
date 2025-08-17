import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ExampleConversation {
  id: string;
  title: string;
  question: string;
  guidance_response: any; // This will be the structured guidance object
  created_at: string | null;
  updated_at: string | null;
  is_active: boolean | null;
}

export const useExampleConversations = () => {
  const [examples, setExamples] = useState<ExampleConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('example_conversations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setExamples(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching example conversations:', err);
      setError('Failed to load example conversations');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    examples,
    isLoading,
    error,
    refetch: fetchExamples,
  };
};