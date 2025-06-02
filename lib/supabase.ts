import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';
import { Logger, AppError } from './logger';

class SupabaseService {
  private static instance: SupabaseService;
  private client;

  private constructor() {
    try {
      this.client = createClient(
        EXPO_PUBLIC_SUPABASE_URL,
        EXPO_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
          }
        }
      );
      Logger.info('Supabase client initialized');
    } catch (error) {
      Logger.error('Failed to initialize Supabase client', error as Error);
      throw new AppError('Database connection failed', 'DB_INIT_ERROR', 500);
    }
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient() {
    return this.client;
  }

  public async healthCheck() {
    try {
      const { data, error } = await this.client.from('health_check').select('*');
      if (error) throw error;
      Logger.info('Database health check passed');
      return true;
    } catch (error) {
      Logger.error('Database health check failed', error as Error);
      return false;
    }
  }
}

export const supabase = SupabaseService.getInstance().getClient();