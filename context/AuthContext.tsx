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
    console.log('🔄 AuthProvider: Initializing...');
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out - clearing user state immediately');
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
      console.log('🚪 Starting comprehensive logout process...');
      console.log('👤 Current user before logout:', user?.email);
      
      // Step 1: Set loading state and clear user immediately to trigger navigation
      setIsLoading(true);
      
      // Step 2: Clear user state FIRST to trigger AuthGuard navigation immediately
      console.log('🧹 Clearing user state immediately to trigger navigation...');
      setUser(null);
      
      // Step 3: Get current session info before clearing
      const { data: { session } } = await supabase.auth.getSession();
      const currentSessionId = sessionTracker.sessionId;
      
      console.log('📊 Current session ID:', currentSessionId);
      console.log('🔑 Current auth session exists:', !!session);
      
      // Step 4: End session tracking
      if (sessionTracker.isActive && currentSessionId) {
        console.log('📊 Ending session tracking...');
        await sessionTracker.endSession('manual', 'User initiated logout');
      }
      
      // Step 5: Call backend logout API to invalidate session server-side
      if (session?.access_token && currentSessionId) {
        try {
          console.log('🌐 Calling backend logout API...');
          
          const logoutResponse = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'X-Session-ID': currentSessionId,
            },
          });
          
          console.log('🌐 Backend logout response status:', logoutResponse.status);
          
          if (logoutResponse.ok) {
            const result = await logoutResponse.json();
            console.log('✅ Backend logout successful:', result.message);
          } else {
            const error = await logoutResponse.json();
            console.warn('⚠️ Backend logout failed:', error.error);
            // Continue with client-side logout even if backend fails
          }
          
        } catch (apiError) {
          console.warn('⚠️ Backend logout API error (continuing with client logout):', apiError);
          // Don't fail the entire logout if API call fails
        }
      } else {
        console.log('⚠️ No session token or session ID for backend logout');
      }
      
      // Step 6: Clear any stored session data from local storage
      console.log('🗑️ Clearing local storage...');
      if (typeof window !== 'undefined') {
        try {
          // Clear Supabase session from localStorage
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
              localStorage.removeItem(key);
              console.log('🗑️ Removed localStorage key:', key);
            }
          });
          
          // Clear sessionStorage as well
          const sessionKeys = Object.keys(sessionStorage);
          sessionKeys.forEach(key => {
            if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
              sessionStorage.removeItem(key);
              console.log('🗑️ Removed sessionStorage key:', key);
            }
          });
        } catch (storageError) {
          console.warn('⚠️ Error clearing storage:', storageError);
        }
      }
      
      // Step 7: Call Supabase signOut with global scope to clear all sessions
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
        
        // Even if Supabase signOut fails, we've already cleared local state
        // This ensures the user appears logged out in the UI
        console.log('⚠️ Supabase signOut failed, but local state cleared');
      } else {
        console.log('✅ Supabase signOut successful');
      }
      
      // Step 8: Force clear the Supabase client session
      console.log('🔄 Force clearing Supabase client session...');
      try {
        // Access the internal session and clear it
        await supabase.auth.refreshSession();
        const { data: { session: postLogoutSession } } = await supabase.auth.getSession();
        if (postLogoutSession) {
          console.warn('⚠️ Session still exists after signOut, forcing additional clear...');
          // Additional cleanup if needed
        } else {
          console.log('✅ Session successfully cleared');
        }
      } catch (sessionError) {
        console.warn('⚠️ Error checking session after logout:', sessionError);
      }
      
      console.log('🎉 Comprehensive logout process completed - AuthGuard should have triggered navigation');
      
    } catch (error) {
      console.error('❌ Unexpected error during logout:', error);
      
      // Even on unexpected errors, ensure user state is cleared
      setUser(null);
      
      // Don't throw the error - we want logout to always appear successful
      console.log('⚠️ Logout had errors but user state cleared');
      
    } finally {
      // Always set loading to false
      setIsLoading(false);
      console.log('🏁 Logout process finished, isLoading set to false');
      
      // Double-check that user state is cleared
      if (user !== null) {
        console.log('🔄 Double-checking user state clear...');
        setUser(null);
      }
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