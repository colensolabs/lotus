import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ExampleConversation {
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

export class ExampleConversationsService {
  static async getRandomExamples(count: number = 3): Promise<ExampleConversation[]> {
    try {
      const { data, error } = await supabase
        .from('example_conversations')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching example conversations:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Shuffle the array and return the requested count
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, shuffled.length));
    } catch (error) {
      console.error('Error in getRandomExamples:', error);
      return [];
    }
  }

  static async getAllExamples(): Promise<ExampleConversation[]> {
    try {
      const { data, error } = await supabase
        .from('example_conversations')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true });

      if (error) {
        console.error('Error fetching all example conversations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllExamples:', error);
      return [];
    }
  }

  static async getExampleById(id: string): Promise<ExampleConversation | null> {
    try {
      const { data, error } = await supabase
        .from('example_conversations')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching example conversation by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getExampleById:', error);
      return null;
    }
  }
}