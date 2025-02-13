import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  clearError: () => set({ error: null }),
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;

      if (authData.user) {
        // Fetch user profile with role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError) throw userError;

        if (userData) {
          set({
            user: userData,
            loading: false,
          });
        } else {
          throw new Error('User profile not found');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      set({
        error: 'Invalid email or password',
        loading: false,
      });
      throw error;
    }
  },
  signUp: async (email: string, password: string, isAdmin = false) => {
    try {
      set({ loading: true, error: null });

      // Check if user is authorized to create admin account
      if (isAdmin) {
        const { data: currentUser } = await supabase.auth.getUser();
        if (!currentUser?.user) throw new Error('Authentication required');

        const { data: adminCheck } = await supabase
          .from('users')
          .select('role')
          .eq('id', currentUser.user.id)
          .single();

        if (!adminCheck || adminCheck.role !== 'admin') {
          throw new Error('Unauthorized to create admin accounts');
        }
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email,
          password,
        }
      );

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: email,
            role: isAdmin ? 'admin' : 'user',
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (newUser) {
          set({
            user: newUser,
            loading: false,
          });
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({
        error: error.message || 'Failed to create account',
        loading: false,
      });
      throw error;
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await supabase.auth.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({
        error: 'Failed to sign out',
        loading: false,
      });
      throw error;
    }
  },
  initialize: async () => {
    try {
      console.log('Initializing session...');

      const { data, error } = await supabase.auth.getSession();
      console.log('Session Data:', data);
      console.log('Session Error:', error);

      if (data?.session?.user) {
        console.log('Fetching user data for:', data.session.user.id);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (userError) throw userError;

        console.log('User Data Retrieved:', userData);

        if (userData) {
          set({ user: userData });
        }
      }
    } catch (err) {
      console.error('Error initializing auth:', err);
      set({ error: 'Failed to initialize session' });
    } finally {
      set({ loading: false });
    }
  },
}));
