const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@supabase/supabase-js',
          '@supabase/auth-js',
          '@supabase/realtime-js',
          '@supabase/postgrest-js',
          '@supabase/storage-js',
        ],
      },
    },
    argv
  );

  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
    stream: false,
    util: false,
    buffer: false,
    process: false,
  };

  // Ignore Node.js specific modules
  config.externals = {
    ...config.externals,
    'react-native-sqlite-storage': false,
    'react-native-fs': false,
  };

  return config;
};