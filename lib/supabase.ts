import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { isBrowser } from '@/utils/environment';

export const supabase = createClient(
  'https://srdzhnxqbdntqmqyttfe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZHpobnhxYmRudHFtcXl0dGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ4MDAsImV4cCI6MjA2NDM2MDgwMH0.ZXzGx_h_ybGX_eCDotvk8LtJx_b414wlhp1-srZb7a4',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // Add additional options to ensure proper session management
      flowType: 'pkce',
      debug: false, // Set to true for debugging auth issues
    },
  }
);

// Add a helper function to completely clear the session
export const clearSupabaseSession = async () => {
  if (typeof window === 'undefined') {
    console.log('🧹 Server environment - skipping session clear');
    return;
  }
  
  try {
    console.log('🧹 Clearing Supabase session completely...');
    
    // Sign out with global scope
    await supabase.auth.signOut({ scope: 'global' });
    
    // Clear AsyncStorage keys related to Supabase
    const keys = await AsyncStorage.getAllKeys();
    const supabaseKeys = keys.filter(key => 
      key.includes('supabase') || 
      key.includes('auth') ||
      key.includes('sb-')
    );
    
    if (supabaseKeys.length > 0) {
      await AsyncStorage.multiRemove(supabaseKeys);
      console.log('🧹 Cleared AsyncStorage keys:', supabaseKeys);
    }
    
    console.log('✅ Supabase session cleared completely');
  } catch (error) {
    console.error('❌ Error clearing Supabase session:', error);
  }
};