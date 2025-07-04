import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth"; // Import your AuthContext hook
import "./AuthPage.css";

const AuthPage = () => {
  const [userType, setUserType] = useState("student");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  // Use the auth context
  const { 
    user, 
    session, 
    loading: authLoading,
    error: authError,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateUserProfile,
    getUserRole,
    isAuthenticated
  } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to appropriate page
    if (isAuthenticated && isAuthenticated() && !authLoading) {
      const userRole = getUserRole();
      if (userRole === 'student') {
        navigate("/home", { replace: true });
      } else if (userRole === 'club') {
        navigate("/clubpage", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, session, authLoading, navigate, isAuthenticated, getUserRole]);

  // Set error from auth context if exists
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const assignRole = async (userEmail, selectedUserType) => {
    if (!userEmail) return;
    
    // Determine role based on email domain or user selection
    let role = userEmail.endsWith("@adypu.edu.in") ? "student" : selectedUserType;

    try {
      const result = await updateUserProfile({ 
        role: role, 
        user_type: role,
        email: userEmail 
      });
      
      if (!result.success) {
        console.error("Failed to assign role:", result.error);
        setError("Failed to assign role");
        return false;
      }
      
      console.log("Role assigned successfully:", role);
      return true;
    } catch (err) {
      console.error("Role assignment failed:", err.message);
      setError("Role assignment failed");
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle(userType);
      if (!result.success) {
        setError(result.error);
      }
      // Note: For OAuth, the actual sign-in happens via redirect
      // The role assignment will be handled in the auth context
    } catch (err) {
      console.error("Google sign in error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, userType, {
          full_name: email.split('@')[0], // Use email prefix as name
          email: email
        });
      }

      if (!result.success) {
        setError(result.error);
        return;
      }
      
      if (result.data.user) {
        if (!isLogin && !result.data.session) {
          setError("Please check your email for a verification link.");
          return;
        }
        
        // For login, check if user needs role assignment
        if (isLogin && !result.data.user.user_metadata?.role) {
          await assignRole(result.data.user.email, userType);
        }
        
        console.log("Authentication successful:", result.data.user);
        // The auth context will handle the redirect via useEffect
      }
    } catch (err) {
      console.error("Email auth error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (!result.success) {
        setError("Failed to sign out");
      } else {
        setError(null);
        navigate("/login", { replace: true });
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setError("Failed to sign out");
    }
  };

  // Show loading spinner while checking initial session
  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  // If user is logged in, show user info
  if (isAuthenticated && isAuthenticated()) {
    const userRole = getUserRole() || "Not assigned";
    return (
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <span className="auth-logo">👥</span>
            <h1 className="gradient-text">Campus-Buddy</h1>
            <p>Welcome back!</p>
          </div>

          <div className="user-info">
            <div className="user-avatar">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="avatar-img" />
              ) : (
                <div className="avatar-placeholder">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3>{user.user_metadata?.full_name || user.email}</h3>
            <p className="user-email">{user.email}</p>
            <p className="user-role">Role: <span className="role-badge">{userRole}</span></p>
            
            {/* Debug info - remove in production */}
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              <p>User ID: {user.id}</p>
              <p>Email Confirmed: {user.email_confirmed_at ? 'Yes' : 'No'}</p>
              <p>Created: {new Date(user.created_at).toLocaleString()}</p>
            </div>

            <div className="user-actions">
              <button className="gradient-button" onClick={handleSignOut}>
                Sign Out
              </button>
              <button 
                className="gradient-button" 
                onClick={() => {
                  if (userRole === 'student') {
                    navigate("/home");
                  } else if (userRole === 'club') {
                    navigate("/clubpage");
                  } else {
                    navigate("/home");
                  }
                }}
              >
                Go to {userRole === 'club' ? 'Club Dashboard' : 'Home'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <span className="auth-logo">👥</span>
          <h1 className="gradient-text">Campus-Buddy</h1>
          <p>Connect, Discover, Participate</p>
        </div>

        <div className="user-toggle">
          <button
            className={`toggle-btn ${userType === "student" ? "active" : ""}`}
            onClick={() => setUserType("student")}
          >
            Student
          </button>
          <button
            className={`toggle-btn ${userType === "club" ? "active" : ""}`}
            onClick={() => setUserType("club")}
          >
            Club
          </button>
        </div>

        <button
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading || authLoading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Signing in..." : `Continue with Google as ${userType}`}
        </button>

        <div className="divider"><span>or</span></div>

        <form className="auth-form" onSubmit={handleEmailAuth}>
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            required 
            disabled={loading || authLoading}
          />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            required 
            disabled={loading || authLoading}
            minLength={6}
          />
          <button type="submit" className="gradient-button" disabled={loading || authLoading}>
            {loading ? "Loading..." : isLogin ? `Sign in as ${userType}` : `Sign up as ${userType}`}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        <div className="auth-footer">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <span onClick={() => {
                setIsLogin(false);
                setError(null);
              }}>Sign up</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => {
                setIsLogin(true);
                setError(null);
              }}>Log in</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;