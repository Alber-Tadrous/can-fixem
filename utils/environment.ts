// Environment detection utilities
export const ENV_CONFIG = {
  get isBrowser() { return typeof window !== 'undefined'; },
  get isServer() { return typeof window === 'undefined'; },
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Safe accessors
  getWindow: () => typeof window !== 'undefined' ? window : undefined,
  getDocument: () => typeof document !== 'undefined' ? document : undefined,
  getNavigator: () => typeof window !== 'undefined' && window.navigator ? window.navigator : undefined,
  getLocalStorage: () => typeof window !== 'undefined' && window.localStorage ? window.localStorage : undefined,
  getSessionStorage: () => typeof window !== 'undefined' && window.sessionStorage ? window.sessionStorage : undefined,
};

// Safe browser detection
export const isBrowser = () => typeof window !== 'undefined';
export const isServer = () => typeof window === 'undefined';

// Safe storage utilities
export class UniversalStorage {
  private isAvailable: boolean;
  
  constructor() {
    this.isAvailable = this.checkAvailability();
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
      console.warn('localStorage not available');
      return false;
    }
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Failed to set localStorage item:', e);
      return false;
    }
  }
  
  getItem(key: string, defaultValue: any = null): any {
    if (!this.isAvailable) {
      return defaultValue;
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
      return false;
    }
    
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Failed to remove localStorage item:', e);
      return false;
    }
  }
}

export const storage = new UniversalStorage();