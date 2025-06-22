
"use client";

import type { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase as sbClient } from '@/lib/supabase/client'; // Use the potentially null client from our robust initializer
import type { UserProfile } from '@/types/ai-schemas';
// If you have generated Supabase types, you can uncomment the next line
// import type { Database } from '@/types/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  isPremium: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = sbClient; // Use the imported client
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userIdToFetch: string | undefined) => {
    if (!userIdToFetch || !supabase) { // Check if supabase client is available
      setUserProfile(null);
      setIsPremium(false);
      if (!supabase) console.warn("AuthContext: Supabase client not available for fetchUserProfile.");
      return;
    }

    try {
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userIdToFetch)
        .maybeSingle(); 

      if (error) {
        console.error(`AuthContext: Error fetching user profile for ID ${userIdToFetch}:`, error.message);
        setUserProfile(null);
        setIsPremium(false);
      } else if (profileData) {
        const profile = profileData as UserProfile;
        setUserProfile(profile);
        const currentSubscriptionStatus = profile?.subscription_status?.toLowerCase() || 'free';
        const premiumStatuses = ['active_premium', 'premium_monthly', 'premium_yearly', 'active'];
        const newIsPremium = premiumStatuses.some(status => currentSubscriptionStatus.includes(status));
        setIsPremium(newIsPremium);
      } else {
        setUserProfile(null);
        setIsPremium(false);
      }
    } catch (e: any) {
        console.error(`AuthContext: Critical error in fetchUserProfile for ID ${userIdToFetch}:`, e.message);
        setUserProfile(null);
        setIsPremium(false);
    }
  }, [supabase]); // Add supabase to dependency array

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setIsPremium(false);
      console.warn("AuthContext: Supabase client not initialized. Auth features disabled for this session.");
      return () => {}; // Return an empty cleanup function
    }

    const getInitialSessionAndProfile = async () => {
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("AuthContext: Error getting initial session:", sessionError.message);
      }
      
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        setUserProfile(null);
        setIsPremium(false);
      }
      setIsLoading(false);
    };

    getInitialSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setIsLoading(true);
        setSession(newSession);
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserProfile(currentUser.id);
        } else {
          setUserProfile(null);
          setIsPremium(false);
        }
        setIsLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const signOutUser = async () => {
    if (!supabase) {
      console.warn("AuthContext: Supabase client not initialized. Cannot sign out.");
      // Simulate sign out locally if Supabase is not available
      setIsLoading(true);
      setSession(null);
      setUser(null);
      setUserProfile(null);
      setIsPremium(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    await supabase.auth.signOut();
    // Auth listener will handle setting session, user, profile to null, and isPremium to false.
  };

  const refreshUserProfileData = useCallback(async () => {
    const currentUser = user; 
    if (currentUser && supabase) { // Check supabase client
      await fetchUserProfile(currentUser.id);
    } else if (!supabase) {
      console.warn("AuthContext: Supabase client not initialized. Cannot refresh profile.");
    }
  }, [user, supabase, fetchUserProfile]); // Add supabase to dependency array

  const value = {
    session,
    user,
    userProfile,
    isPremium,
    isLoading,
    signOut: signOutUser,
    refreshUserProfile: refreshUserProfileData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
