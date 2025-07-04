// Create this as a new file: pages/AuthCallback.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hook/useAuth';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, session, loading, getUserRole, updateUserProfile } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (!loading && session && user) {
        // Check if user has a role, if not assign default
        const currentRole = getUserRole();
        
        if (!currentRole) {
          const userEmail = user.email;
          const defaultRole = userEmail?.endsWith('@adypu.edu.in') ? 'student' : 'student';
          
          try {
            await updateUserProfile({ 
              role: defaultRole, 
              user_type: defaultRole,
              full_name: user.user_metadata?.full_name || userEmail?.split('@')[0]
            });
          } catch (error) {
            console.error('Failed to assign role:', error);
          }
        }
        
        // Redirect based on role
        const role = currentRole || 'student';
        if (role === 'club') {
          navigate('/clubpage', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } else if (!loading && !session) {
        // Auth failed, redirect to login
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [user, session, loading, navigate, getUserRole, updateUserProfile]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>
          <h2>Completing sign in...</h2>
          <p>Please wait while we redirect you.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;