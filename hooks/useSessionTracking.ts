import { useEffect, useRef } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './useAuth';

export function useSessionTracking() {
  const { user, isAuthenticated, sessionId } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const lastRouteRef = useRef<string>('');

  // Track page views
  useEffect(() => {
    const currentRoute = segments.join('/') || 'index';
    
    if (currentRoute !== lastRouteRef.current && sessionId && isAuthenticated) {
      console.log('📊 Tracking page view:', currentRoute);
      
      trackEvent('page_view', 'navigation', {
        route: currentRoute,
        previous_route: lastRouteRef.current,
        timestamp: new Date().toISOString()
      });
      
      lastRouteRef.current = currentRoute;
    }
  }, [segments, sessionId, isAuthenticated]);

  // Track events via API
  const trackEvent = async (eventType: string, eventSubtype?: string, data: any = {}) => {
    if (!sessionId || !isAuthenticated) {
      console.log('⚠️ No active session to track event');
      return;
    }

    try {
      const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.warn('⚠️ No access token for event tracking');
        return;
      }

      const deviceInfo = {
        platform: 'web',
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
          width: window.screen.width,
          height: window.screen.height
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      const response = await fetch('/api/session/log-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          sessionId,
          eventType,
          eventSubtype,
          data,
          userAgent: navigator.userAgent,
          deviceInfo
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Event tracked:', result.eventId);
      } else {
        const error = await response.json();
        console.error('❌ Failed to track event:', error.error);
      }

    } catch (error) {
      console.error('❌ Error tracking event:', error);
    }
  };

  // Track user actions
  const trackUserAction = async (action: string, details?: any) => {
    await trackEvent('user_action', action, {
      action,
      details,
      timestamp: new Date().toISOString()
    });
  };

  // Track API calls
  const trackAPICall = async (endpoint: string, method: string, status: number, duration: number) => {
    await trackEvent('api_call', method.toLowerCase(), {
      endpoint,
      method,
      status_code: status,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
  };

  return {
    trackUserAction,
    trackAPICall,
    trackEvent,
    sessionId,
    isActive: !!sessionId,
  };
}