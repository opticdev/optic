module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['mocks'],
  resetMocks: true,
  testMatch: ['<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['build', 'src/lintgpt'],
  moduleNameMapper: {
    '^nimma/fallbacks$': [
      '<rootDir>../../node_modules/nimma/dist/cjs/fallbacks/index.js',
      '<rootDir>../../../../node_modules/nimma/dist/cjs/fallbacks/index.js',
    ],
    '^nimma/legacy$': [
      '<rootDir>../../node_modules/nimma/dist/legacy/cjs/index.js',
      '<rootDir>../../../../node_modules/nimma/dist/legacy/cjs/index.js',
    ],
  },
};
