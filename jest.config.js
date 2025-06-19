module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts,tsx}',
    '<rootDir>/**/__tests__/**/*.{js,ts,tsx}'
  ],
  collectCoverageFrom: [
    'context/**/*.{js,ts,tsx}',
    'hooks/**/*.{js,ts,tsx}',
    'lib/**/*.{js,ts,tsx}',
    'utils/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.(js|ts|tsx)$': ['babel-jest', {
      presets: [
        ['babel-preset-expo', { jsxRuntime: 'automatic' }]
      ]
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|expo|@expo|@supabase|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-navigation|lucide-react-native)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 30000,
  globals: {
    __DEV__: true
  },
  // Fix for Object.defineProperty issues
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  // Prevent Jest from trying to transform certain modules
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true
};