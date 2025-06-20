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
import { useSessionTracking } from '@/hooks/useSessionTracking';
import { useAPITracking } from '@/hooks/useAPITracking';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Auth Guard Component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('🛡️ AuthGuard: Effect triggered');
    console.log('🛡️ AuthGuard: User:', user?.email || 'None');
    console.log('🛡️ AuthGuard: Loading state:', isLoading);
    console.log('🛡️ AuthGuard: Authenticated:', isAuthenticated);
    console.log('🛡️ AuthGuard: Current segments:', segments);

    // Don't do anything while loading
    if (isLoading) {
      console.log('🛡️ AuthGuard: Still loading, waiting...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    console.log('🛡️ AuthGuard: In auth group:', inAuthGroup);

    // Add a small delay to ensure navigation state is ready
    const navigationTimeout = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        // User is not signed in and not in auth group, redirect to auth
        console.log('🧭 AuthGuard: Redirecting to auth - user not logged in');
        router.replace('/(auth)');
      } else if (isAuthenticated && inAuthGroup) {
        // User is signed in but in auth group, redirect to main app
        console.log('🧭 AuthGuard: Redirecting to main app - user is logged in');
        router.replace('/(tabs)');
      } else {
        console.log('🛡️ AuthGuard: No navigation needed');
        console.log('🛡️ AuthGuard: User authenticated:', isAuthenticated);
        console.log('🛡️ AuthGuard: In correct section:', inAuthGroup ? 'auth' : 'main');
      }
    }, 100); // Small delay to ensure router is ready

    return () => clearTimeout(navigationTimeout);
  }, [user, isAuthenticated, segments, isLoading, router]);

  // Show loading screen while auth is loading
  if (isLoading) {
    console.log('🛡️ AuthGuard: Showing loading state');
    return null; // Keep splash screen visible
  }

  console.log('🛡️ AuthGuard: Rendering children');
  return <>{children}</>;
}

// Session Tracking Wrapper
function SessionTrackingWrapper({ children }: { children: React.ReactNode }) {
  useSessionTracking();
  useAPITracking();
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
      console.log('🎨 RootLayout: Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    console.log('🎨 RootLayout: Waiting for fonts to load...');
    return null;
  }

  console.log('🎨 RootLayout: Rendering app with fonts loaded');

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SessionTrackingWrapper>
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
          </SessionTrackingWrapper>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}