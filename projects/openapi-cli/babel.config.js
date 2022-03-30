module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    [
      'inline-dotenv',
      {
        path:
          process.env.NODE_ENV === 'production'
            ? './.env.build.production'
            : './.env.build',
        systemVar: 'disable', // only replace values from dotenv file, not process.env
      },
    ],
  ],
  env: {
    production: {
      ignore: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
};
