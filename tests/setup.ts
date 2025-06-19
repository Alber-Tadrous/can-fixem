import { beforeAll, afterAll } from '@jest/globals';

// Test environment setup
beforeAll(async () => {
  console.log('Setting up test environment...');
  
  // Ensure we're using test environment
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('test') && 
      !process.env.NODE_ENV?.includes('test')) {
    console.warn('Warning: Not running in test environment');
  }
});

afterAll(async () => {
  console.log('Cleaning up test environment...');
});

// Global test configuration
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: process.env.VERBOSE_TESTS ? console.log : jest.fn(),
  warn: console.warn,
  error: console.error,
};