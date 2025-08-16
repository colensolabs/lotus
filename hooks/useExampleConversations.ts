import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ExampleConversation {
  id: string;
  title: string;
  question: string;
  guidance_response: {
    intro: string;
    practicalSteps: string;
    reflection: string;
    scripture: {
      text: string;
      source: string;
      explanation: string;
    };
    outro: string;
  };
  created_at: string;
  updated_at: string;
  is_active: boolean;
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
      setError('Failed to load examples');
    } finally {
      setIsLoading(false);
    }
  };

  const getExampleByQuestion = (question: string): ExampleConversation | null => {
    return examples.find(example => example.question === question) || null;
  };

  return {
    examples,
    isLoading,
    error,
    fetchExamples,
    getExampleByQuestion,
  };
};