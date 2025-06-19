module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      ['babel-preset-expo', { 
        jsxRuntime: 'automatic'
      }]
    ],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: process.cwd() + '/.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true
      }]
    ],
    env: {
      test: {
        presets: [
          ['babel-preset-expo', { 
            jsxRuntime: 'automatic'
          }],
          ['@babel/preset-env', { 
            targets: { node: 'current' },
            modules: 'commonjs'
          }],
          '@babel/preset-typescript'
        ]
      }
    }
  };
};