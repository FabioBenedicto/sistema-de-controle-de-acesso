import { createContext, type ReactNode, useEffect, useState } from 'react';

import { createSession, getMe } from '../services/api';
import type { SessionContextType, Teacher } from '../types';

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined,
);

export function SessionProvider({ children }: SessionProviderProps) {
  const [user, setUser] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          const teacher = await getMe();
          setUser(teacher);
        }
      } catch {
        localStorage.clear();
        setUser(null);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const login = async (body: { protocol: string; password: string }) => {
    const teacher = await createSession(body);
    localStorage.setItem('token', teacher.token!);
    setUser(teacher);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
