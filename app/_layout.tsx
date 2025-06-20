import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSegments } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Auth Guard Component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      console.log('🛡️ AuthGuard: Still loading, waiting...');
      return; // Don't do anything while loading
    }

    const inAuthGroup = segments[0] === '(auth)';

    console.log('🛡️ AuthGuard: User:', user?.email || 'None');
    console.log('🛡️ AuthGuard: In auth group:', inAuthGroup);
    console.log('🛡️ AuthGuard: Current segments:', segments);
    console.log('🛡️ AuthGuard: Loading state:', isLoading);

    if (!user && !inAuthGroup) {
      // User is not signed in and not in auth group, redirect to auth
      console.log('🧭 AuthGuard: Redirecting to auth - user not logged in');
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      // User is signed in but in auth group, redirect to main app
      console.log('🧭 AuthGuard: Redirecting to main app - user is logged in');
      router.replace('/(tabs)');
    } else {
      console.log('🛡️ AuthGuard: No navigation needed');
    }
  }, [user, segments, isLoading, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': require('@expo-google-fonts/poppins/Poppins_400Regular.ttf'),
    'Poppins-Medium': require('@expo-google-fonts/poppins/Poppins_500Medium.ttf'),
    'Poppins-SemiBold': require('@expo-google-fonts/poppins/Poppins_600SemiBold.ttf'),
    'Poppins-Bold': require('@expo-google-fonts/poppins/Poppins_700Bold.ttf'),
  });

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AuthGuard>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="service/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="provider/[id]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
            </Stack>
          </AuthGuard>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}