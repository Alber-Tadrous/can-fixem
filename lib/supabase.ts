import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';


export const supabase = createClient(
  'postgresql://postgres.srdzhnxqbdntqmqyttfe:[YOUR-PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres',
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    }
  }
);