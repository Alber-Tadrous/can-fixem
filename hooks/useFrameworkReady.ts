import { useEffect } from 'react';
import { isSSR } from '@/utils/environment';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Skip during SSR/static generation
    if (typeof window === 'undefined') {
      console.log('🔧 useFrameworkReady: SSR environment, skipping framework ready call');
      return;
    }
    
    // Only access window in browser environment during client-side execution
    if (window && typeof window.frameworkReady === 'function') {
      try {
        window.frameworkReady();
        console.log('🔧 useFrameworkReady: Framework ready called successfully');
      } catch (error) {
        console.warn('Framework ready callback failed:', error);
      }
    } else {
      console.log('🔧 useFrameworkReady: No framework ready callback found');
    }
  }, []); // Empty dependency array - only run once on mount
}