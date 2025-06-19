// Test setup file that runs after the test environment is established
import 'react-native-gesture-handler/jestSetup';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Stack: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
  Tabs: {
    Screen: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock @expo-google-fonts/poppins
jest.mock('@expo-google-fonts/poppins', () => ({
  Poppins_400Regular: 'Poppins_400Regular',
  Poppins_500Medium: 'Poppins_500Medium',
  Poppins_600SemiBold: 'Poppins_600SemiBold',
  Poppins_700Bold: 'Poppins_700Bold',
}));

// Mock lucide-react-native
jest.mock('lucide-react-native', () => ({
  ArrowLeft: 'ArrowLeft',
  Plus: 'Plus',
  Trash2: 'Trash2',
  Upload: 'Upload',
  Check: 'Check',
  Mail: 'Mail',
  Lock: 'Lock',
  ArrowRight: 'ArrowRight',
  Wrench: 'Wrench',
  Car: 'Car',
  Chrome: 'Chrome',
  User: 'User',
  MessageSquare: 'MessageSquare',
  Clock: 'Clock',
  MapPin: 'MapPin',
  Search: 'Search',
  Bell: 'Bell',
  Star: 'Star',
  ChevronRight: 'ChevronRight',
  Settings: 'Settings',
  CreditCard: 'CreditCard',
  CircleHelp: 'CircleHelp',
  LogOut: 'LogOut',
  Filter: 'Filter',
  RefreshCw: 'RefreshCw',
  ChevronLeft: 'ChevronLeft',
  X: 'X',
}));

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: {
    Item: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'mock-image-uri', fileSize: 1000000 }],
    })
  ),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');