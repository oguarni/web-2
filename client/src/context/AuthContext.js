import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    if (token) {
      try {
        const response = await authAPI.verifyToken();
        setUser(response.data.user);
      } catch (error) {
        console.error("Token verification failed, logging out.", error);
        logout();
      }
    }
    setLoading(false);
  }, [token, logout]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // Ensure you are accessing the nested data property correctly
      const { token: newToken, user: userData } = response.data;

      if (newToken && userData) {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'Login response did not contain token or user data.' };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed.'
      };
    }
  };

  const isAdmin = () => user?.tipo === 1;
  const isAdminOrGestor = () => user?.tipo === 1 || user?.tipo === 3;

  const value = {
    user,
    token,
    isAuthenticated: !!user, // isAuthenticated is true if user object exists
    loading,
    login,
    logout,
    isAdmin,
    isAdminOrGestor,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};