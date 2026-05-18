import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Create Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auto-login: Check localStorage for token and user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login Action
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      const { data } = response;
      
      // Save to state
      setUser(data);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Register Action
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register({ name, email, password });
      const { data } = response;
      
      // Save to state
      setUser(data);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);

      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  // Logout Action
  const logout = () => {
    // Clear state
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Method to update user object safely (e.g. when updating bookmarks)
  const updateUser = (newUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
