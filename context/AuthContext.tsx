import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { sessionTracker } from '@/lib/sessionTracker';

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
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out - clearing user state');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in - loading profile');
        try {
          // Wait a bit for the database to be ready
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('❌ Error fetching profile:', error);
            if (error.code === 'PGRST116') {
              console.log('⚠️ Profile not found - user may need to complete registration');
              // Don't set user to null here, let the registration flow handle it
            }
          } else if (profile) {
            console.log('✅ Profile loaded successfully:', profile.email);
            setUser(profile);
          }
        } catch (err) {
          console.error('❌ Error in auth state change:', err);
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
      console.log('🔍 Checking current user session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('👤 Found existing session for:', session.user.email);
        // Wait a bit for the database to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('❌ Error fetching profile:', profileError);
          if (profileError.code === 'PGRST116') {
            console.log('⚠️ Profile not found - user may need to complete registration');
          }
        } else if (profile) {
          console.log('✅ Profile loaded on startup:', profile.email);
          setUser(profile);
        }
      } else {
        console.log('🚫 No existing session found');
      }
    } catch (error) {
      console.error('❌ Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Starting login process for:', email);
      setIsLoading(true);
      
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (session?.user) {
        console.log('✅ Login successful for:', session.user.email);
        // Profile will be loaded by the auth state change listener
        // Don't set loading to false here - let the auth state change handle it
      }
    } catch (error) {
      console.error('❌ Error logging in:', error);
      setIsLoading(false); // Only set loading to false on error
      throw error;
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      console.log('📝 Starting registration for:', userData.email, 'Role:', userData.role);
      
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
        console.error('❌ Signup error:', signUpError);
        
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

      console.log('✅ User signed up successfully:', authData.user.id);

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

      console.log('📝 Creating profile with data:', profileData);

      // Insert profile (no upsert needed for new users)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        
        // If profile creation fails, we should clean up the auth user
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.error('❌ Error cleaning up auth user:', cleanupError);
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

      console.log('✅ Profile created successfully:', profile);

      // If this is a service provider, create the service provider record
      if (userData.role === 'service-provider') {
        console.log('🔧 Creating service provider record...');
        
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

        console.log('🔧 Creating service provider with data:', serviceProviderData);

        // Insert service provider record (no upsert needed for new users)
        const { data: serviceProvider, error: serviceProviderError } = await supabase
          .from('service_providers')
          .insert([serviceProviderData])
          .select()
          .single();

        if (serviceProviderError) {
          console.error('❌ Service provider creation error:', serviceProviderError);
          
          // Clean up profile and auth user if service provider creation fails
          try {
            await supabase.from('profiles').delete().eq('id', authData.user.id);
            await supabase.auth.signOut();
          } catch (cleanupError) {
            console.error('❌ Error cleaning up after service provider creation failure:', cleanupError);
          }
          
          throw new Error(`Failed to create service provider record: ${serviceProviderError.message}`);
        } else {
          console.log('✅ Service provider record created successfully:', serviceProvider);
        }
      }

      setUser(profile);
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Starting logout process...');
      console.log('👤 Current user before logout:', user?.email);
      console.log('📊 Session tracker active:', sessionTracker.isActive);
      console.log('📊 Current session ID:', sessionTracker.sessionId);
      
      setIsLoading(true);
      
      // End session tracking BEFORE calling Supabase signOut
      if (sessionTracker.isActive) {
        console.log('📊 Ending session tracking...');
        try {
          await sessionTracker.endSession('manual', 'User initiated logout');
          console.log('✅ Session tracking ended successfully');
        } catch (sessionError) {
          console.error('⚠️ Error ending session tracking:', sessionError);
          // Don't fail logout if session tracking fails
        }
      } else {
        console.log('📊 No active session to end');
      }
      
      // Clear user state immediately to prevent UI issues
      console.log('🧹 Clearing user state...');
      setUser(null);
      
      // Call Supabase signOut - this will trigger the auth state change
      console.log('📡 Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all sessions
      });
      
      if (error) {
        console.error('❌ Supabase logout error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
        });
        
        // Don't throw the error - we want the logout to appear successful to the user
        // User state is already cleared above
      } else {
        console.log('✅ Supabase signOut successful');
      }
      
      console.log('🎉 Logout process completed - auth state change will trigger navigation');
      
    } catch (error) {
      console.error('❌ Unexpected error during logout:', error);
      
      // Even on unexpected errors, ensure user state is cleared
      setUser(null);
      
      // Don't throw the error - we want logout to always appear successful
      console.log('⚠️ Logout had errors but user state cleared');
      
    } finally {
      setIsLoading(false);
      console.log('🏁 Logout process finished, isLoading set to false');
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      console.log('📝 Updating user profile:', userData);
      
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);

      if (error) {
        console.error('❌ Error updating user:', error);
        throw error;
      }

      console.log('✅ User profile updated successfully');
      setUser({ ...user, ...userData });
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  };

  const contextValue = {
    user, 
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  console.log('🔄 AuthContext render - User:', user?.email || 'None', 'Loading:', isLoading, 'Authenticated:', !!user);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);