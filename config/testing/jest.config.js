/* eslint-disable */
const common = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      // Disables type checking the tests, as we typecheck ourselves and this increases speed a lot
      isolatedModules: true,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  rootDir: '<rootDir>/../../',
};
module.exports = {
  ...common,
  projects: [
    {
      displayName: 'Unit tests',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/**/__tests__/*.unit.test.ts'],
      ...common,
    },
    {
      displayName: 'ESLint unit tests',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/config/linting/custom-eslint-rules/**/__tests__/*.test.ts',
      ],
      ...common,
    },
  ],
};
