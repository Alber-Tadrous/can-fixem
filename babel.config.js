module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo'],
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript'
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
    ]
  };
};