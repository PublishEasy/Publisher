const common = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      // Disables type checking the tests, as we type check ourselves and this increases speed a lot
      isolatedModules: true,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // eslint-disable-next-line no-undef
  rootDir: __dirname + '/../../',
  coverageReporters: ['clover'],
};
module.exports = {
  ...common,
  projects: [
    {
      displayName: 'Unit tests',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/**/__tests__/*.unit.test.ts'],
      collectCoverageFrom: [
        '<rootDir>/config/linting/custom-eslint-rules/**/*.js',
      ],
      ...common,
    },
    {
      displayName: 'ESLint unit tests',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/config/linting/custom-eslint-rules/**/__tests__/*.test.ts',
      ],
      collectCoverageFrom: ['<rootDir>/src/**/*.tsx?'],
      ...common,
    },
  ],
};
