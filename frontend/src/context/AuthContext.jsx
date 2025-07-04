import React, { createContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Create Auth Context
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithGoogle: async () => {},
  updateUserProfile: async () => {},
  getUserRole: () => null,
  hasRole: () => false,
  isStudent: () => false,
  isClub: () => false,
  supabase: null
});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          setError(error.message);
        } else {
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
        setError(null);

        // Handle specific auth events
        if (event === 'SIGNED_IN') {
          console.log('User signed in:', session?.user?.email);
          
          // For Google OAuth, set role in user metadata if not already set
          if (session?.user && !session.user.user_metadata?.role) {
            const userEmail = session.user.email;
            const defaultRole = userEmail?.endsWith('@adypu.edu.in') ? 'student' : 'student';
            
            try {
              await updateUserMetadata({ role: defaultRole, user_type: defaultRole });
            } catch (err) {
              console.error('Failed to set default role:', err);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to update user metadata
  const updateUserMetadata = async (metadata) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user metadata:', error);
      return { success: false, error: error.message };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, userType = 'student', additionalData = {}) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userType,
            user_type: userType,
            ...additionalData
          }
        }
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (userType = 'student') => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Google sign in error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get user role
  const getUserRole = () => {
    return user?.user_metadata?.role || user?.user_metadata?.user_type || null;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return getUserRole() === role;
  };

  // Check if user is student
  const isStudent = () => {
    return hasRole('student');
  };

  // Check if user is club
  const isClub = () => {
    return hasRole('club');
  };

  // Get user display name
  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email || 'User';
  };

  // Get user avatar
  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!session;
  };

  // Context value
  const value = {
    // State
    user,
    session,
    loading,
    error,
    
    // Auth methods
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateUserProfile,
    
    // Utility methods
    getUserRole,
    hasRole,
    isStudent,
    isClub,
    getUserDisplayName,
    getUserAvatar,
    isAuthenticated,
    
    // Supabase client
    supabase
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export default AuthContext for components that need direct access
export default AuthContext;