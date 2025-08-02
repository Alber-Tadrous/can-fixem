// Enhanced environment detection utilities for SSR compatibility
export const ENV_CONFIG = {
  // Dynamic getters that are evaluated at runtime, not build time
  get isBrowser() { 
    return typeof window !== 'undefined' && typeof window.document !== 'undefined'; 
  },
  get isServer() { 
    return typeof window === 'undefined'; 
  },
  get isSSR() {
    return typeof window === 'undefined' || typeof document === 'undefined';
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Safe accessors that return undefined if not available
  getWindow: () => typeof window !== 'undefined' ? window : undefined,
  getDocument: () => typeof document !== 'undefined' ? document : undefined,
  getNavigator: () => typeof window !== 'undefined' && window.navigator ? window.navigator : undefined,
  getLocalStorage: () => typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined,
  getSessionStorage: () => typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : undefined,
};

// Safe browser detection functions
export const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const isServer = () => typeof window === 'undefined';
export const isSSR = () => typeof window === 'undefined' || typeof document === 'undefined';

// Universal Storage class that works in both SSR and browser environments
export class UniversalStorage {
  private isAvailable: boolean;
  private fallbackStorage: Map<string, string>;
  
  constructor() {
    this.isAvailable = this.checkAvailability();
    this.fallbackStorage = new Map();
  }
  
  private checkAvailability(): boolean {
    try {
      return typeof window !== 'undefined' && 
             typeof window.localStorage !== 'undefined' &&
             window.localStorage !== null;
    } catch (e) {
      return false;
    }
  }
  
  setItem(key: string, value: any): boolean {
    if (!this.isAvailable) {
      // Use fallback storage during SSR
      this.fallbackStorage.set(key, JSON.stringify(value));
      return true;
    }
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Failed to set localStorage item:', e);
      this.fallbackStorage.set(key, JSON.stringify(value));
      return false;
    }
  }
  
  getItem(key: string, defaultValue: any = null): any {
    if (!this.isAvailable) {
      // Use fallback storage during SSR
      const item = this.fallbackStorage.get(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Failed to get localStorage item:', e);
      return defaultValue;
    }
  }
  
  removeItem(key: string): boolean {
    if (!this.isAvailable) {
      this.fallbackStorage.delete(key);
      return true;
    }
    
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Failed to remove localStorage item:', e);
      return false;
    }
  }
  
  clear(): boolean {
    if (!this.isAvailable) {
      this.fallbackStorage.clear();
      return true;
    }
    
    try {
      window.localStorage.clear();
      return true;
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
      return false;
    }
  }
}

export const storage = new UniversalStorage();

// Safe window operation wrapper
export function safeWindowOperation<T>(
  operation: () => T,
  fallback: T | (() => T) = null
): T {
  if (typeof window === 'undefined') {
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
  
  try {
    return operation();
  } catch (error) {
    console.warn('Window operation failed:', error);
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}