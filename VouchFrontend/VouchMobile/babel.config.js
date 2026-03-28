module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@api': './src/api',
          '@features': './src/features',
          '@navigation': './src/navigation',
          '@store': './src/store',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@types': './src/types',
        },
      },
    ],
  ],
};
