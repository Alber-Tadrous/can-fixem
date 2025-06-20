import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { sessionTracker } from '@/lib/sessionTracker';
import { useAuth } from './useAuth';

export function useSessionTracking() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const lastRouteRef = useRef<string>('');
  const sessionStartedRef = useRef<boolean>(false);

  // Track page views
  useEffect(() => {
    const currentRoute = segments.join('/') || 'index';
    
    if (currentRoute !== lastRouteRef.current && sessionTracker.isActive) {
      sessionTracker.trackPageView(currentRoute, {
        previous_route: lastRouteRef.current,
        timestamp: new Date().toISOString()
      });
      
      lastRouteRef.current = currentRoute;
    }
  }, [segments]);

  // Start session when user logs in
  useEffect(() => {
    if (isAuthenticated && user && !sessionStartedRef.current) {
      console.log('🎯 useSessionTracking: Starting session for authenticated user');
      sessionStartedRef.current = true;
      
      sessionTracker.startSession(user.id, 'email').catch(error => {
        console.error('❌ useSessionTracking: Failed to start session:', error);
        // Don't reset the flag on error - we still want to track the session locally
      });
    }
  }, [isAuthenticated, user]);

  // End session when user logs out
  useEffect(() => {
    if (!isAuthenticated && sessionStartedRef.current) {
      console.log('🎯 useSessionTracking: User logged out, session should already be ended');
      sessionStartedRef.current = false;
      
      // Don't end session here - it should be handled by the logout function
      // This is just to reset our local flag
    }
  }, [isAuthenticated]);

  return {
    trackUserAction: sessionTracker.trackUserAction.bind(sessionTracker),
    trackAPICall: sessionTracker.trackAPICall.bind(sessionTracker),
    sessionId: sessionTracker.sessionId,
    isActive: sessionTracker.isActive,
    sessionDuration: sessionTracker.sessionDuration,
    activityStats: sessionTracker.activityStats
  };
}