
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

// Create a client specifically for working with profiles
const SUPABASE_URL = "https://kksxzbcvosofafpkstow.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrc3h6YmN2b3NvZmFmcGtzdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzU3MzcsImV4cCI6MjA2MjA1MTczN30.vFyv-n7xymV41xu7qyBskGKeMP8I8psg7vV0q1bta-w";

// We use a non-typed client to avoid type issues until the types are properly synchronized
const profilesClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export interface AuthOperations {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

export const useAuthOperations = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  fetchProfile: (userId: string) => Promise<void>
): AuthOperations => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        
        // Provide more specific error messages based on the error code
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account before logging in.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else {
          throw error;
        }
      }

      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${data.user?.email}!`,
      });
      
      console.log('Login successful:', data);
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Check if the profiles table exists by making a small query
      const { error: tableCheckError } = await profilesClient
        .from('profiles')
        .select('id')
        .limit(1);
      
      const profilesTableExists = !tableCheckError;

      // Now attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Only attempt to create profile if the profiles table exists
        if (profilesTableExists) {
          try {
            // Create a profile record
            const { error: profileError } = await profilesClient
              .from('profiles')
              .insert({
                id: data.user.id,
                first_name: firstName,
                last_name: lastName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (profileError) {
              console.error('Error creating profile:', profileError.message);
              // Continue with signup even if profile creation fails
            }
          } catch (profileError: any) {
            console.error('Error creating profile:', profileError.message);
            // Continue with signup even if profile creation fails
          }
        } else {
          console.log('Profiles table does not exist. Skipping profile creation.');
        }

        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Signed out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      // Fixed: Using getUser() instead of getUserByEmail()
      const { data, error: userError } = await supabase.auth.getUser();
      
      if (userError || !data.user) {
        throw new Error('User not found');
      }

      const { error } = await profilesClient
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id);

      if (error) {
        throw error;
      }

      // Refresh profile data
      fetchProfile(data.user.id);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
};
