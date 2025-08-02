import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Only access window in browser environment during client-side execution
    if (typeof window !== 'undefined' && window.frameworkReady) {
      window.frameworkReady();
    }
  });
}