import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        try {
          // Wait a bit for the database to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile:', error);
            if (error.code === 'PGRST116') {
              console.log('Profile not found - user may need to complete registration');
              // Don't set user to null here, let the registration flow handle it
            }
          } else if (profile) {
            setUser(profile);
          }
        } catch (err) {
          console.error('Error in auth state change:', err);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      
      if (session?.user) {
        // Wait a bit for the database to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found - user may need to complete registration');
          }
        } else if (profile) {
          setUser(profile);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error(error.message);
      }

      if (session?.user) {
        // Wait a bit for the database to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile after login:', profileError);
          if (profileError.code === 'PGRST116') {
            throw new Error('Profile not found. Please contact support.');
          } else {
            throw new Error('Failed to load user profile');
          }
        }
        
        if (profile) {
          setUser(profile);
        }
      }
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      console.log('Starting registration for:', userData.email, 'Role:', userData.role);
      
      // Validate required fields
      if (!userData.email || !userData.password || !userData.name || !userData.role) {
        throw new Error('Missing required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password length
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // First, sign up the user with email confirmation disabled
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        
        // Handle specific error cases
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          throw new Error('An account with this email already exists');
        } else if (signUpError.message.includes('password')) {
          throw new Error('Password must be at least 6 characters long');
        } else if (signUpError.message.includes('email')) {
          throw new Error('Please enter a valid email address');
        }
        
        throw new Error(signUpError.message);
      }

      if (!authData?.user) {
        throw new Error('Registration failed - no user session created');
      }

      console.log('User signed up successfully:', authData.user.id);

      // Wait for the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 3000)); // Increased wait time

      // Create the profile with all provided data
      const profileData = {
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        avatar_url: userData.avatar || null,
        street1: userData.street1 || null,
        street2: userData.street2 || null,
        city: userData.city || null,
        state: userData.state || null,
        zip: userData.zip || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Creating profile with data:', profileData);

      // Insert profile (no upsert needed for new users)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // If profile creation fails, we should clean up the auth user
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.error('Error cleaning up auth user:', cleanupError);
        }
        
        // Handle specific profile creation errors
        if (profileError.code === '23505') {
          throw new Error('An account with this email already exists');
        } else if (profileError.message.includes('permission') || profileError.code === '42501') {
          throw new Error('Permission denied. Please try again.');
        } else if (profileError.code === '23503') {
          throw new Error('Invalid user data. Please try again.');
        }
        
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      console.log('Profile created successfully:', profile);

      // If this is a service provider, create the service provider record
      if (userData.role === 'service-provider') {
        console.log('Creating service provider record...');
        
        const serviceProviderData = {
          user_id: authData.user.id,
          business_name: userData.businessName || `${userData.name}'s Service`,
          description: userData.description || 'Professional automotive service provider',
          services: userData.services || [],
          service_radius: userData.serviceRadius || 25,
          rating: null,
          review_count: 0,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('Creating service provider with data:', serviceProviderData);

        // Insert service provider record (no upsert needed for new users)
        const { data: serviceProvider, error: serviceProviderError } = await supabase
          .from('service_providers')
          .insert([serviceProviderData])
          .select()
          .single();

        if (serviceProviderError) {
          console.error('Service provider creation error:', serviceProviderError);
          
          // Clean up profile and auth user if service provider creation fails
          try {
            await supabase.from('profiles').delete().eq('id', authData.user.id);
            await supabase.auth.signOut();
          } catch (cleanupError) {
            console.error('Error cleaning up after service provider creation failure:', cleanupError);
          }
          
          throw new Error(`Failed to create service provider record: ${serviceProviderError.message}`);
        } else {
          console.log('Service provider record created successfully:', serviceProvider);
        }
      }

      setUser(profile);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('Error updating user:', error);
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