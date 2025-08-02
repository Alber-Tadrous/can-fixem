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
    if (isSSR()) {
      return;
    }
    
    // Only access window in browser environment during client-side execution
    if (typeof window !== 'undefined' && window.frameworkReady) {
      try {
        window.frameworkReady();
      } catch (error) {
        console.warn('Framework ready callback failed:', error);
      }
    }
  }, []); // Empty dependency array - only run once on mount
}