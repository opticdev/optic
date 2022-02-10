module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
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
};
