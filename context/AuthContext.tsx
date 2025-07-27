import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { ENV_CONFIG, isBrowser } from '@/utils/environment';

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  sessionId: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 AuthProvider: Initializing...');
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out - clearing user state immediately');
        setUser(null);
        setSessionId(null);
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
        setSessionId(null);
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
      
      // Step 1: Sign in with Supabase
      const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (session?.user) {
        console.log('✅ Supabase login successful for:', session.user.email);
        
        // Step 2: Start session tracking via API
        try {
          console.log('📊 Starting session tracking...');
          
          const deviceInfo = getDeviceInfo();

          const response = await fetch('/api/session/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              loginMethod: 'email',
              userAgent: ENV_CONFIG.getNavigator()?.userAgent || 'unknown',
              deviceInfo
            })
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Session tracking started:', result.sessionId);
            setSessionId(result.sessionId);
          } else {
            const error = await response.json();
            console.warn('⚠️ Session tracking failed (non-fatal):', error.error);
            // Don't fail login if session tracking fails
          }
        } catch (sessionError) {
          console.warn('⚠️ Session tracking error (non-fatal):', sessionError);
          // Don't fail login if session tracking fails
        }
        
        // Profile will be loaded by the auth state change listener
      }
    } catch (error) {
      console.error('❌ Error logging in:', error);
      setIsLoading(false);
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
      await new Promise(resolve => setTimeout(resolve, 3000));

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

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.error('❌ Error cleaning up auth user:', cleanupError);
        }
        
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

        const { data: serviceProvider, error: serviceProviderError } = await supabase
          .from('service_providers')
          .insert([serviceProviderData])
          .select()
          .single();

        if (serviceProviderError) {
          console.error('❌ Service provider creation error:', serviceProviderError);
          
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
      console.log('📊 Current session ID:', sessionId);
      
      setIsLoading(true);
      
      // Step 1: Clear user state FIRST to trigger AuthGuard navigation immediately
      console.log('🧹 Clearing user state immediately to trigger navigation...');
      setUser(null);
      
      // Step 2: Get current session info before clearing
      const { data: { session } } = await supabase.auth.getSession();
      const currentSessionId = sessionId;
      
      console.log('🔑 Current auth session exists:', !!session);
      
      // Step 3: End session tracking via API
      if (session?.access_token && currentSessionId) {
        try {
          console.log('🌐 Calling backend session end API...');
          
          const response = await fetch('/api/session/end', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              sessionId: currentSessionId,
              logoutMethod: 'manual',
              logoutReason: 'User initiated logout'
            })
          });
          
          console.log('🌐 Backend session end response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ Backend session end successful:', result.message);
          } else {
            const error = await response.json();
            console.warn('⚠️ Backend session end failed:', error.error);
          }
          
        } catch (apiError) {
          console.warn('⚠️ Backend session end API error (continuing with client logout):', apiError);
        }
      }
      
      // Step 4: Clear session ID
      setSessionId(null);
      
      // Step 5: Clear any stored session data from local storage
      console.log('🗑️ Clearing local storage...');
      if (isBrowser()) {
        try {
          const localStorage = ENV_CONFIG.getLocalStorage();
          const sessionStorage = ENV_CONFIG.getSessionStorage();
          
          if (localStorage) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
                localStorage.removeItem(key);
                console.log('🗑️ Removed localStorage key:', key);
              }
            });
          }
          
          if (sessionStorage) {
            const sessionKeys = Object.keys(sessionStorage);
            sessionKeys.forEach(key => {
              if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
                sessionStorage.removeItem(key);
                console.log('🗑️ Removed sessionStorage key:', key);
              }
            });
          }
        } catch (storageError) {
          console.warn('⚠️ Error clearing storage:', storageError);
        }
      }
      
      // Step 6: Call Supabase signOut with global scope
      console.log('📡 Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut({
        scope: 'global'
      });
      
      if (error) {
        console.error('❌ Supabase logout error:', error);
        console.log('⚠️ Supabase signOut failed, but local state cleared');
      } else {
        console.log('✅ Supabase signOut successful');
      }
      
      console.log('🎉 Comprehensive logout process completed');
      
    } catch (error) {
      console.error('❌ Unexpected error during logout:', error);
      setUser(null);
      setSessionId(null);
    } finally {
      setIsLoading(false);
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

  // Helper function to get browser info
  const getBrowserInfo = (): string => {
    if (typeof window === 'undefined') return 'Unknown';
    
    const navigator = window.navigator;
    if (!navigator) return 'Unknown';
    
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  // Helper function to get device info safely
  const getDeviceInfo = () => {
    if (typeof window === 'undefined') {
      return {
        platform: 'server',
        os: 'unknown',
        browser: 'Unknown',
        screen_resolution: 'unknown',
        timezone: 'unknown',
        language: 'unknown'
      };
    }
    
    return {
      platform: 'web',
      os: window.navigator?.platform || 'unknown',
      browser: getBrowserInfo(),
      screen_resolution: window.screen ? `${window.screen.width}x${window.screen.height}` : 'unknown',
      timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unknown',
      language: window.navigator?.language || 'unknown'
    };
  };

  const contextValue = {
    user, 
    isAuthenticated: !!user,
    isLoading,
    sessionId,
    login,
    register,
    logout,
    updateUser
  };

  console.log('🔄 AuthContext render - User:', user?.email || 'None', 'Loading:', isLoading, 'Authenticated:', !!user, 'SessionId:', sessionId);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);