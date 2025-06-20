import { useEffect } from 'react';
import { sessionTracker } from '@/lib/sessionTracker';

// Hook to automatically track API calls
export function useAPITracking() {
  useEffect(() => {
    // Only set up tracking if we're in a web environment
    if (typeof window === 'undefined' || typeof window.fetch === 'undefined') {
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
        
        // Track successful API call (only if session is active)
        if (sessionTracker.isActive) {
          await sessionTracker.trackAPICall(
            url,
            method,
            response.status,
            duration
          );
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Track failed API call (only if session is active)
        if (sessionTracker.isActive) {
          await sessionTracker.trackAPICall(
            url,
            method,
            0, // Error status
            duration
          );
        }
        
        throw error;
      }
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}