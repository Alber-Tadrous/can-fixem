import 'react-native-url-polyfill/auto';

// Polyfill for Object.defineProperty issues
if (typeof global.Object.defineProperty !== 'function') {
  global.Object.defineProperty = function(obj, prop, descriptor) {
    if (obj && typeof obj === 'object') {
      obj[prop] = descriptor.value || descriptor.get?.() || undefined;
    }
    return obj;
  };
}

// Fix for global object issues
if (typeof global.window === 'undefined') {
  global.window = global as any;
}

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

// Mock React Native modules with proper object structure
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    Platform: {
      OS: 'web',
      select: (obj: any) => obj.web || obj.default || obj.native,
      Version: 25,
    },
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
      absoluteFill: {},
      hairlineWidth: 1,
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    Animated: {
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      View: 'Animated.View',
      Text: 'Animated.Text',
    },
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      quad: jest.fn(),
      cubic: jest.fn(),
    },
  };
});

// Mock Expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  useSegments: () => [],
  Stack: {
    Screen: ({ children }: any) => children,
  },
  Tabs: {
    Screen: ({ children }: any) => children,
  },
  Link: ({ children }: any) => children,
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
  isHiddenAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
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

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'test-app',
      slug: 'test-app',
    },
    manifest: {},
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock Lucide icons
jest.mock('lucide-react-native', () => {
  const mockIcon = ({ size = 24, color = 'black', ...props }: any) => 
    `MockIcon(${JSON.stringify({ size, color, ...props })})`;
  
  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return mockIcon;
      }
      return undefined;
    }
  });
});

// Mock React Native Picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: {
    Item: ({ children, ...props }: any) => `PickerItem(${JSON.stringify(props)}): ${children}`,
  },
}));

// Mock Supabase (if needed for unit tests)
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      admin: {
        listUsers: jest.fn(),
        getUserById: jest.fn(),
        deleteUser: jest.fn(),
      },
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
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

// Silence specific warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('componentWillReceiveProps') ||
     args[0].includes('componentWillMount') ||
     args[0].includes('ReactDOM.render'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};