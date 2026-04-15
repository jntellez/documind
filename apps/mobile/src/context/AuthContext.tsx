import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthUser } from '@documind/types';
import { tokenStorage } from '../lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al iniciar la app, verificamos si hay token guardado
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await tokenStorage.get();
      const userDataString = await AsyncStorage.getItem('user_data');

      if (token && userDataString) {
        const userData = JSON.parse(userDataString);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (token: string, newUser: AuthUser) => {
    await tokenStorage.save(token);
    await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
    setUser(newUser);
  };

  const signOut = async () => {
    await tokenStorage.remove();
    await AsyncStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
