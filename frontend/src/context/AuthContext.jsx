import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

// Create Auth Context
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signOutForced: async () => {},
  signInWithGoogle: async () => {},
  updateUserProfile: async () => {},
  getUserRole: () => null,
  hasRole: () => false,
  isStudent: () => false,
  isClub: () => false,
  getUserDisplayName: () => "User",
  getUserAvatar: () => null,
  isAuthenticated: () => false,
  supabase: null,
  debugAuth: async () => {},
});

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug function to check auth state
  const debugAuth = async () => {
    console.log("🔍 AUTH DEBUG INFO:");
    console.log("Current user state:", user);
    console.log("Current session state:", session);

    try {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();
      console.log("Supabase session:", currentSession);
      console.log("Supabase session error:", error);

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("Supabase user:", currentUser);
      console.log("Supabase user error:", userError);

      // Check localStorage
      const authToken = localStorage.getItem("supabase.auth.token");
      console.log("localStorage auth token:", authToken ? "exists" : "null");

      // Check for multiple auth tokens
      Object.keys(localStorage).forEach((key) => {
        if (key.includes("auth") || key.includes("supabase")) {
          console.log(`localStorage ${key}:`, localStorage.getItem(key));
        }
      });
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("🔄 Getting initial session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setError(error.message);
        } else {
          console.log("Initial session:", session ? "exists" : "null");
          setSession(session);
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", {
        event,
        session: session ? "exists" : "null",
        user: session?.user ? "exists" : "null",
        timestamp: new Date().toISOString(),
      });

      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      setError(null);

      // Handle specific auth events
      if (event === "SIGNED_IN") {
        console.log("✅ User signed in:", session?.user?.email);
        if (session?.user) {
          await ensureUserInDatabase(session.user);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🚪 User signed out - clearing all state");
        setUser(null);
        setSession(null);
        setError(null);
        // Clear any additional local storage if needed
        // localStorage.removeItem('your-app-specific-data');
      } else if (event === "TOKEN_REFRESHED") {
        console.log("🔄 Token refreshed");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Ensure user exists in our users table
  const ensureUserInDatabase = async (authUser) => {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking user existence:", fetchError);
        return;
      }

      if (!existingUser) {
        const userRole = authUser.email?.endsWith("@adypu.edu.in")
          ? "student"
          : authUser.user_metadata?.role || "student";

        const userData = {
          id: authUser.id,
          email: authUser.email,
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "User",
          role: userRole,
          batch_year: authUser.user_metadata?.batch_year || null,
          department: authUser.user_metadata?.department || null,
          phone: authUser.user_metadata?.phone || null,
          profile_picture_url: authUser.user_metadata?.avatar_url || null,
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert([userData]);

        if (insertError) {
          console.error("Error creating user in database:", insertError);
        } else {
          console.log("✅ User created in database successfully");
        }
      }
    } catch (error) {
      console.error("Error in ensureUserInDatabase:", error);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (
    email,
    password,
    userType = "student",
    additionalData = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      const role = email.endsWith("@adypu.edu.in") ? "student" : userType;

      const userMetadata = {
        role: role,
        user_type: role,
        full_name: additionalData.full_name || email.split("@")[0],
        batch_year: additionalData.batch_year || null,
        department: additionalData.department || null,
        phone: additionalData.phone || null,
        ...additionalData,
      };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Sign up error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (userType = "student") => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Google sign in error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Standard sign out
  const signOut = async () => {
    setLoading(true);
    setError(null);
    console.log("🚪 Attempting to sign out user...");

    const signOutPromise = supabase.auth.signOut({ scope: "global" });

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 2000)
    );

    const result = await Promise.race([signOutPromise, timeoutPromise]);

    if (result?.error) {
      console.error("Supabase sign out error:", result.error);
      setError(result.error.message);
    } else if (result?.timeout) {
      console.warn("⚠️ Sign out took too long, proceeding with local cleanup.");
    } else {
      console.log("✅ Supabase sign out successful");
    }

    // Clear everything regardless
    localStorage.clear();
    console.log("🧹 Local storage cleared");

    setSession(null);
    setUser(null);
    setLoading(false);

    return { success: !result?.error, timeout: !!result?.timeout };
  };

  // Forced sign out with manual cleanup
  const signOutForced = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🚪 Attempting FORCED sign out...");

      // Step 1: Try normal sign out
      try {
        await supabase.auth.signOut({ scope: "global" });
        console.log("✅ Normal sign out successful");
      } catch (error) {
        console.warn(
          "Normal sign out failed, proceeding with forced cleanup:",
          error
        );
      }

      // Step 2: Clear all possible auth tokens from localStorage
      const keysToRemove = [];
      Object.keys(localStorage).forEach((key) => {
        if (
          key.includes("auth") ||
          key.includes("supabase") ||
          key.includes("sb-")
        ) {
          keysToRemove.push(key);
        }
      });

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`🧹 Removed ${key} from localStorage`);
      });

      // Step 3: Clear sessionStorage
      sessionStorage.clear();
      console.log("🧹 Cleared sessionStorage");

      // Step 4: Clear React state
      setSession(null);
      setUser(null);
      setError(null);

      console.log("✅ Forced sign out completed");

      // Step 5: Force page refresh
      setTimeout(() => {
        window.location.reload();
      }, 100);

      return { success: true };
    } catch (error) {
      console.error("Forced sign out error:", error);
      // Still reload the page even if there's an error
      window.location.reload();
      return { success: false, error: error.message };
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: authError } =
        await supabase.auth.updateUser({
          data: updates,
        });

      if (authError) throw authError;

      if (user?.id) {
        const dbUpdates = {};
        if (updates.full_name) dbUpdates.full_name = updates.full_name;
        if (updates.batch_year) dbUpdates.batch_year = updates.batch_year;
        if (updates.department) dbUpdates.department = updates.department;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.role) dbUpdates.role = updates.role;
        if (updates.profile_picture_url)
          dbUpdates.profile_picture_url = updates.profile_picture_url;

        if (Object.keys(dbUpdates).length > 0) {
          const { error: dbError } = await supabase
            .from("users")
            .update(dbUpdates)
            .eq("id", user.id);

          if (dbError) {
            console.error("Error updating user in database:", dbError);
          }
        }
      }

      return { success: true, data: authData };
    } catch (error) {
      console.error("Update profile error:", error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const getUserRole = () => {
    return user?.user_metadata?.role || user?.user_metadata?.user_type || null;
  };

  const hasRole = (role) => {
    return getUserRole() === role;
  };

  const isStudent = () => {
    return hasRole("student");
  };

  const isClub = () => {
    return hasRole("club");
  };

  const getUserDisplayName = () => {
    return (
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
    );
  };

  const getUserAvatar = () => {
    return (
      user?.user_metadata?.avatar_url ||
      user?.user_metadata?.profile_picture_url ||
      null
    );
  };

  const isAuthenticated = () => {
    return !!user && !!session;
  };

  // Get complete user data from database
  const getUserData = async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user from database:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in getUserData:", error);
      return null;
    }
  };

  // Update user in database directly
  const updateUserInDatabase = async (updates) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error("Error updating user in database:", error);
      return { success: false, error: error.message };
    }
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
    signOutForced, // New forced sign out method
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

    // Database methods
    getUserData,
    updateUserInDatabase,

    // Debug method
    debugAuth,

    // Supabase client
    supabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
