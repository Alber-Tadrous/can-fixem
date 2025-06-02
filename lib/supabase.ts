import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(
  'https://srdzhnxqbdntqmqyttfe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyZHpobnhxYmRudHFtcXl0dGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODQ4MDAsImV4cCI6MjA2NDM2MDgwMH0.ZXzGx_h_ybGX_eCDotvk8LtJx_b414wlhp1-srZb7a4',
  {
    auth: {
      persistSession: false,
    }
  }
);