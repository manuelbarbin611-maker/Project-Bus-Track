import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@app/lib/api';
import { loginRequest, registerRequest, logoutRequest, getCurrentUser } from '@app/lib/auth';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: any) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await api.getToken();
        if (token) {
          const u = await getCurrentUser();
          setUser(u);
        }
      } catch {
        // token invalid or user fetch failed
        await api.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    if (res?.token) {
      const u = await getCurrentUser();
      setUser(u);
    }
    return res;
  };

  const register = async (payload: any) => {
    const res = await registerRequest(payload);
    if (res?.token) {
      const u = await getCurrentUser();
      setUser(u);
    }
    return res;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
