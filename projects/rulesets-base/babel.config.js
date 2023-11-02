module.exports = {
  presets: [
    ['@babel/preset-env', { exclude: ['proposal-dynamic-import'] }],
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  env: {
    production: {
      ignore: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
};
