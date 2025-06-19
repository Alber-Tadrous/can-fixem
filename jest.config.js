module.exports = {
  preset: 'jest-expo',
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
  testEnvironment: 'node',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|expo-router|@supabase|react-native|@react-native)/)'
  ]
};