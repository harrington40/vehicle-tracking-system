import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // TODO: load token / session
      // Example (commented):
      // const token = await SecureStore.getItemAsync('token');
      // if (token) setSession({ user: { email: 'demo@fleet.io', role: 'manager' }});
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email, password) => {
    // TODO: real API call
    setSession({ user: { email, role: 'manager' } });
  }, []);

  const logout = useCallback(async () => {
    // TODO: clear token
    setSession(null);
  }, []);

  const value = { session, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}