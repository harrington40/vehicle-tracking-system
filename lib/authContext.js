import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

/**
 * Simple auth context for VTrack telematics.
 * Replace mock API parts with real backend calls.
 */

const AuthContext = createContext();

const SESSION_KEY = 'vtrack_session_v1';

async function persistSession(session) {
  if (session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Load persisted session on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
            // Basic token expiry check placeholder
          if (!parsed.expiresAt || Date.now() < parsed.expiresAt) {
            setSession(parsed);
          } else {
            await SecureStore.deleteItemAsync(SESSION_KEY);
          }
        }
      } catch (e) {
        console.warn('Session load failed', e);
      } finally {
        setInitializing(false);
        setLoading(false);
      }
    })();
  }, []);

  const buildSession = (user) => ({
    user,
    token: 'dev-token',
    issuedAt: Date.now(),
    // 8h expiry placeholder
    expiresAt: Date.now() + 8 * 60 * 60 * 1000
  });

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) throw new Error('Email and password required');
      // TODO: real API call
      // const res = await api.post('/auth/login',{email,password});
      const user = { email, role: 'fleet_manager', verified: true };
      const newSession = buildSession(user);
      await persistSession(newSession);
      setSession(newSession);
      return newSession;
    } catch (e) {
      setError(e.message || 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      if (!name || !email || !password) throw new Error('All fields required');
      // TODO: real API call
      // await api.post('/auth/register',{name,email,password});
      return await login(email, password);
    } catch (e) {
      setError(e.message || 'Registration failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [login]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await persistSession(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!session) return;
    // Placeholder: extend expiry
    const refreshed = { ...session, expiresAt: Date.now() + 8 * 60 * 60 * 1000 };
    setSession(refreshed);
    await persistSession(refreshed);
  }, [session]);

  const value = {
    session,
    user: session?.user || null,
    loading,
    initializing,
    error,
    login,
    register,
    logout,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}