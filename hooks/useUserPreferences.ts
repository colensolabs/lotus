import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '@/types/database';

type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
type BuddhistTradition = UserPreferences['buddhist_tradition'];

// Common topics of interest for Buddhist guidance
export const AVAILABLE_TOPICS = [
  'Anxiety & Stress',
  'Relationships',
  'Grief & Loss',
  'Anger Management',
  'Self-Compassion',
  'Mindfulness',
  'Meditation',
  'Work-Life Balance',
  'Parenting',
  'Addiction Recovery',
  'Depression',
  'Spiritual Growth',
  'Forgiveness',
  'Purpose & Meaning',
  'Health & Illness',
  'Financial Stress',
  'Family Conflicts',
  'Career Decisions',
  'Loneliness',
  'Self-Doubt',
];

export const BUDDHIST_TRADITIONS = [
  { value: 'secular' as const, label: 'Secular/Non-religious', description: 'Buddhist principles without religious context' },
  { value: 'general_buddhist' as const, label: 'General Buddhist', description: 'Core Buddhist teachings across traditions' },
  { value: 'theravada' as const, label: 'Theravada', description: 'Traditional Buddhism of Southeast Asia' },
  { value: 'mahayana' as const, label: 'Mahayana', description: 'Great Vehicle tradition including Pure Land' },
  { value: 'tibetan' as const, label: 'Tibetan', description: 'Vajrayana and Tibetan Buddhist practices' },
  { value: 'zen' as const, label: 'Zen', description: 'Japanese and Chinese Chan meditation traditions' },
];

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences(null);
      setIsLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setPreferences(data || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrUpdatePreferences = async (
    topicsOfInterest: string[],
    buddhistTradition: BuddhistTradition
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          topics_of_interest: topicsOfInterest,
          buddhist_tradition: buddhistTradition,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPreferences(data);
      return { success: true };
    } catch (err) {
      console.error('Error updating preferences:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update preferences' 
      };
    }
  };

  const updateTopics = async (topics: string[]): Promise<{ success: boolean; error?: string }> => {
    if (!preferences) {
      return createOrUpdatePreferences(topics, 'general_buddhist');
    }
    return createOrUpdatePreferences(topics, preferences.buddhist_tradition);
  };

  const updateTradition = async (tradition: BuddhistTradition): Promise<{ success: boolean; error?: string }> => {
    const topics = preferences?.topics_of_interest || [];
    return createOrUpdatePreferences(topics, tradition);
  };

  return {
    preferences,
    isLoading,
    error,
    fetchPreferences,
    createOrUpdatePreferences,
    updateTopics,
    updateTradition,
  };
};