import React, { createContext, useContext, useEffect, useState } from 'react';
import { tokenStorage } from '../lib/storage';

interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al iniciar la app, verificamos si hay token guardado
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = await tokenStorage.get();
    if (token) { }
    setIsLoading(false);
  };

  const signIn = async (token: string, newUser: User) => {
    await tokenStorage.save(token);
    setUser(newUser);
  };

  const signOut = async () => {
    await tokenStorage.remove();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};