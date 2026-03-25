import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { clearTrustedSession, isTrustedSessionValid, writeTrustedSession } from '@/lib/trustedSession';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [correctPin, setCorrectPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch PIN from Supabase on mount
  useEffect(() => {
    async function fetchPin() {
      try {
        const { data, error } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'app_pin')
          .single();

        if (error) {
          console.error('Error fetching PIN from Supabase:', error);
          setCorrectPin(null);
        } else if (data) {
          setCorrectPin(data.value);
        }
      } catch (err) {
        console.error('Exception while fetching PIN:', err);
        setCorrectPin(null);
      } finally {
        if (isTrustedSessionValid()) {
          setIsAuthenticated(true);
        } else {
          clearTrustedSession();
        }
        setLoading(false);
      }
    }

    fetchPin();
  }, []);

  const login = (pin: string): boolean => {
    if (correctPin && pin === correctPin) {
      setIsAuthenticated(true);
      writeTrustedSession();
      return true;
    }
    return false;
  };

  const logout = () => {
    clearTrustedSession();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
