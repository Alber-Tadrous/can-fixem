import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://srdzhnxqbdntqmqyttfe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZHpobnhxYmRudHFtcXl0dGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ4MDAsImV4cCI6MjA2NDM2MDgwMH0.ZXzGx_h_ybGX_eCDotvk8LtJx_b414wlhp1-srZb7a4',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);