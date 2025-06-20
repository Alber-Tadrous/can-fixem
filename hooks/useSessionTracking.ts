import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { sessionTracker } from '@/lib/sessionTracker';
import { useAuth } from './useAuth';

export function useSessionTracking() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const lastRouteRef = useRef<string>('');

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
    if (isAuthenticated && user && !sessionTracker.isActive) {
      console.log('🎯 useSessionTracking: Starting session for authenticated user');
      sessionTracker.startSession(user.id, 'email').catch(error => {
        console.error('❌ useSessionTracking: Failed to start session:', error);
      });
    }
  }, [isAuthenticated, user]);

  // End session when user logs out
  useEffect(() => {
    if (!isAuthenticated && sessionTracker.isActive) {
      console.log('🎯 useSessionTracking: Ending session for logged out user');
      sessionTracker.endSession('manual', 'User logged out').catch(error => {
        console.error('❌ useSessionTracking: Failed to end session:', error);
      });
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