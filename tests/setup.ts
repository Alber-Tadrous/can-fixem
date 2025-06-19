import 'react-native-url-polyfill/auto';

// Mock console for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: process.env.VERBOSE_TESTS ? originalConsole.log : jest.fn(),
  warn: originalConsole.warn,
  error: originalConsole.error,
  info: originalConsole.info,
  debug: process.env.VERBOSE_TESTS ? originalConsole.debug : jest.fn(),
};

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (obj: any) => obj.web || obj.default || obj.native,
  },
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 667 }),
  },
}));

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: ({ children }: any) => children,
  },
  Tabs: {
    Screen: ({ children }: any) => children,
  },
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('@expo-google-fonts/poppins', () => ({
  Poppins_400Regular: 'Poppins_400Regular',
  Poppins_500Medium: 'Poppins_500Medium',
  Poppins_600SemiBold: 'Poppins_600SemiBold',
  Poppins_700Bold: 'Poppins_700Bold',
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: ({ children }: any) => children,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => 'ArrowLeft',
  Plus: () => 'Plus',
  Trash2: () => 'Trash2',
  Check: () => 'Check',
  X: () => 'X',
}));

// Mock React Native Picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: {
    Item: ({ children }: any) => children,
  },
}));

// Global test setup
beforeAll(async () => {
  if (process.env.VERBOSE_TESTS) {
    console.log('🧪 Setting up test environment...');
  }
  
  // Ensure we're using test environment
  if (!process.env.NODE_ENV?.includes('test')) {
    console.warn('⚠️  Warning: Not running in test environment');
  }
});

afterAll(async () => {
  if (process.env.VERBOSE_TESTS) {
    console.log('🧹 Cleaning up test environment...');
  }
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});