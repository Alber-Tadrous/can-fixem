import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/data/mockData';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading the user from storage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        // For demo purposes, we'll set a mock user
        setUser({
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          role: 'car-owner',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
        });
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      setUser({
        id: '1',
        name: 'John Doe',
        email,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        role: 'car-owner',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      setUser({
        id: '1',
        name: userData.name || 'New User',
        email: userData.email || 'user@example.com',
        avatar: userData.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        role: userData.role || 'car-owner',
        phone: userData.phone || '',
        location: userData.location || '',
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('Update user failed:', error);
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