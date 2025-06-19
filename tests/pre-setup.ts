// Pre-setup file to initialize global objects before jest-expo setup
// This must run before jest-expo's internal setup to avoid Object.defineProperty errors

// Ensure global.self is properly defined as an object
if (typeof global.self === 'undefined') {
  global.self = global;
}

// Ensure global.window is properly defined
if (typeof global.window === 'undefined') {
  global.window = global;
}

// Initialize other required globals for React Native environment
global.navigator = global.navigator || {};
global.location = global.location || {};
global.document = global.document || {};

// Mock console methods if needed
if (!global.console) {
  global.console = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
}