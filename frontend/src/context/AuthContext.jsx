import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeToken, setActiveToken] = useState(null);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('queueless_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await api.getMe();
      setUser(u);
      if (u.role === 'CUSTOMER') {
        fetchActiveToken();
      }
    } catch (e) {
      console.error('Session expired or invalid', e);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveToken = async () => {
    try {
      const tok = await api.getActiveToken();
      setActiveToken(tok);
    } catch (e) {
      setActiveToken(null);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Periodic check for active token status (every 10 seconds for customers)
  useEffect(() => {
    if (!user || user.role !== 'CUSTOMER') return;
    const interval = setInterval(fetchActiveToken, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password, expectedRole) => {
    const res = await api.login(email, password, expectedRole);
    localStorage.setItem('queueless_token', res.token);
    setUser({
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role,
      assignedBranchId: res.assignedBranchId,
      assignedCounterId: res.assignedCounterId,
    });
    if (res.role === 'CUSTOMER') {
      fetchActiveToken();
    }
    return res;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    localStorage.setItem('queueless_token', res.token);
    setUser({
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role,
      assignedBranchId: res.assignedBranchId,
      assignedCounterId: res.assignedCounterId,
    });
    return res;
  };

  const logout = () => {
    localStorage.removeItem('queueless_token');
    setUser(null);
    setActiveToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        activeToken,
        login,
        register,
        logout,
        refreshActiveToken: fetchActiveToken,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
