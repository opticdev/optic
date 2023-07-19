module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: ['@babel/plugin-transform-runtime'],
  env: {
    production: {
      ignore: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
  targets: {
    node: 16,
  },
};
