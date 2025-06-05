import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Root() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking authentication state
  if (isLoading) {
    return null;
  }

  // Redirect to the appropriate stack based on auth state
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)'} />;
}