module.exports = {
  presets: [
    ['@babel/preset-env', { exclude: ['proposal-dynamic-import'] }],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    [
      'transform-inline-environment-variables',
      {
        include: ['SENTRY_URL', 'SEGMENT_KEY'],
      },
    ],
  ],
  env: {
    production: {
      ignore: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
  targets: {
    node: 16,
  },
};
