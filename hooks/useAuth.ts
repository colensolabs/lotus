import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  session: Session | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    session: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        isAuthenticated: !!session,
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setAuthState({
        isAuthenticated: !!session,
        user: session?.user ?? null,
        session,
        isLoading: false,
      });

      // Create or update user profile when user signs in
      if (event === 'SIGNED_IN' && session?.user) {
        await createOrUpdateUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createOrUpdateUserProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'email'
        });

      if (error) {
        console.error('Error creating/updating user profile:', error);
      }
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email || !password || !name) {
        return { success: false, error: 'All fields are required' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            display_name: name.trim(),
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check if user needs to confirm email
      if (data.user && !data.session) {
        return { 
          success: false, 
          error: 'Please check your email and click the confirmation link to complete registration.' 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      // The auth state change listener will handle updating the state
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email) {
        return { success: false, error: 'Email is required' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Password reset failed. Please try again.' };
    }
  };

  return {
    ...authState,
    login,
    logout,
    register,
    resetPassword,
  };
};