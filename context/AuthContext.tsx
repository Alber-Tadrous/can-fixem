import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';
import { Logger, AppError } from '@/lib/logger';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const session = await SecureStore.getItemAsync('session');
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser(session);
        if (userError) throw new AppError('Failed to get user', 'AUTH_USER_ERROR', 401);

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError) throw new AppError('Failed to get profile', 'PROFILE_ERROR', 404);
          
          if (profile) {
            setUser(profile);
            Logger.info('User session restored', { userId: profile.id });
          }
        }
      }
    } catch (error) {
      Logger.error('Error checking user session', error as Error);
      await SecureStore.deleteItemAsync('session');
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new AppError(error.message, 'AUTH_LOGIN_ERROR', 401);

      if (session) {
        await SecureStore.setItemAsync('session', session.access_token);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) throw new AppError('Profile not found', 'PROFILE_ERROR', 404);
        
        if (profile) {
          setUser(profile);
          Logger.info('User logged in successfully', { userId: profile.id });
        }
      }
    } catch (error) {
      Logger.error('Login failed', error as Error);
      throw error;
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      const { data: { session }, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password!,
      });

      if (error) throw new AppError(error.message, 'AUTH_REGISTER_ERROR', 400);

      if (session) {
        await SecureStore.setItemAsync('session', session.access_token);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: session.user.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              location: userData.location,
              role: userData.role,
            }
          ]);

        if (profileError) throw new AppError('Failed to create profile', 'PROFILE_CREATE_ERROR', 400);

        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (fetchError) throw new AppError('Failed to fetch profile', 'PROFILE_FETCH_ERROR', 404);
        
        if (profile) {
          setUser(profile);
          Logger.info('User registered successfully', { userId: profile.id });
        }
      }
    } catch (error) {
      Logger.error('Registration failed', error as Error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('session');
      setUser(null);
      Logger.info('User logged out successfully');
    } catch (error) {
      Logger.error('Logout failed', error as Error);
      throw new AppError('Failed to logout', 'AUTH_LOGOUT_ERROR', 500);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) {
      throw new AppError('No user logged in', 'AUTH_NO_USER', 401);
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);

      if (error) throw new AppError('Failed to update profile', 'PROFILE_UPDATE_ERROR', 400);

      setUser({ ...user, ...userData });
      Logger.info('User profile updated', { userId: user.id });
    } catch (error) {
      Logger.error('Profile update failed', error as Error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);