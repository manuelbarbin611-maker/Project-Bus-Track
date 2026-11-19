import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@app/lib/api';
import { loginRequest, registerRequest, logoutRequest, getCurrentUser } from '@app/lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  busId: number | null;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: any) => Promise<any>;
  logout: () => Promise<void>;
  setBusId: (busId: number | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [busId, setBusIdState] = useState<number | null>(null);

  // Load bus_id from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('bustrack_selected_bus_id');
        if (raw) {
          setBusIdState(parseInt(raw, 10));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Sync bus_id to AsyncStorage when changed
  const setBusId = async (id: number | null) => {
    setBusIdState(id);
    try {
      if (id === null) {
        await AsyncStorage.removeItem('bustrack_selected_bus_id');
      } else {
        await AsyncStorage.setItem('bustrack_selected_bus_id', id.toString());
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await api.getToken();
        if (token) {
          const u = await getCurrentUser();
          setUser(u?.user ?? u);
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
    if (res?.access_token || res?.token) {
      if (res?.user) {
        setUser(res.user);
      } else {
        const u = await getCurrentUser();
        setUser(u?.user ?? u);
      }
    }
    return res;
  };

  const register = async (payload: any) => {
    const res = await registerRequest(payload);
    if (res?.access_token || res?.token) {
      if (res?.user) {
        setUser(res.user);
      } else {
        const u = await getCurrentUser();
        setUser(u?.user ?? u);
      }
    }
    return res;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, busId, login, register, logout, setBusId }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
