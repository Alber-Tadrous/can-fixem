import { useEffect } from 'react';
import { useAuth } from './useAuth';

export function useAPITracking() {
  const { sessionId, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only set up tracking if we're in a web environment and have an active session
    if (typeof window === 'undefined' || typeof window.fetch === 'undefined' || !sessionId || !isAuthenticated) {
      return;
    }

    // Intercept fetch requests
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      const method = args[1]?.method || 'GET';
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        // Track successful API call (only for non-session tracking APIs to avoid recursion)
        if (sessionId && !url.includes('/api/session/')) {
          trackAPICall(url, method, response.status, duration);
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Track failed API call (only for non-session tracking APIs)
        if (sessionId && !url.includes('/api/session/')) {
          trackAPICall(url, method, 0, duration);
        }
        
        throw error;
      }
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, [sessionId, isAuthenticated]);

  const trackAPICall = async (endpoint: string, method: string, status: number, duration: number) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token || !sessionId) return;

      await fetch('/api/session/log-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          sessionId,
          eventType: 'api_call',
          eventSubtype: method.toLowerCase(),
          data: {
            endpoint,
            method,
            status_code: status,
            duration_ms: duration,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (error) {
      console.warn('⚠️ Failed to track API call:', error);
    }
  };
}