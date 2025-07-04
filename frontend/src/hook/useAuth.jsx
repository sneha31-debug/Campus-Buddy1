import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Ensure all functions are available with fallbacks
  return {
    ...context,
    isAuthenticated: context.isAuthenticated || (() => false),
    getUserRole: context.getUserRole || (() => null),
    hasRole: context.hasRole || (() => false),
    isStudent: context.isStudent || (() => false),
    isClub: context.isClub || (() => false),
    getUserDisplayName: context.getUserDisplayName || (() => 'User'),
    getUserAvatar: context.getUserAvatar || (() => null),
  };
};