import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('🏠 Index: Auth state changed - Loading:', isLoading, 'Authenticated:', isAuthenticated);
    
    if (!isLoading) {
      const timeout = setTimeout(() => {
        if (isAuthenticated) {
          console.log('🏠 Index: Redirecting to tabs');
          router.replace('/(tabs)');
        } else {
          console.log('🏠 Index: Redirecting to auth');
          router.replace('/(auth)');
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while determining auth state
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

