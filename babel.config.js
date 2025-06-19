module.exports = function (api) {
  api.cache(true);
  
  const isTest = api.env('test');
  
  return {
    presets: [
      ['babel-preset-expo', { 
        jsxRuntime: 'automatic',
        // Use classic runtime for tests to avoid issues
        jsxImportSource: isTest ? undefined : 'react'
      }],
      ...(isTest ? [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'commonjs'
        }],
        '@babel/preset-typescript'
      ] : [])
    ],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: process.cwd() + '/.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true
      }],
      // Add reanimated plugin for tests
      ...(isTest ? [] : ['react-native-reanimated/plugin'])
    ]
  };
};