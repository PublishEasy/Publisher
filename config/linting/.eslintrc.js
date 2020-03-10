const extraEnabledRules = {
  'import/no-default-export': 'error',
  'import/no-anonymous-default-export': 'error',
  'import/no-unassigned-import': 'error',
  'import/max-dependencies': ['error', { max: 5 }],
  'import/no-mutable-exports': 'error',
  'import/no-internal-modules': [
    'error',
    {
      allow: ['!src/**/*', 'src/*/*'],
    },
  ],
  'import/no-cycle': 'error',
  'import/no-restricted-paths': [
    'error',
    {
      zones: [
        { target: 'src/server', from: 'src/client' },
        { target: 'src/client', from: 'src/client' },
      ],
    },
  ],
  'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
  'import/no-named-as-default-member': 'error',
  'import/no-deprecated': 'error',
  'import/no-extraneous-dependencies': 'error',
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'error',
};

const ourCustomEnabledRules = {
  'only-parent-import-file-you-are-testing': 'error',
  'only-import-internal-from-inside-and-index': 'error',
};

const disabledRules = {
  '@typescript-eslint/no-use-before-define': 'off',
};

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'react', 'jsx-a11y', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:jsx-a11y/strict',
  ],
  rules: {
    ...extraEnabledRules,
    ...disabledRules,
    ...ourCustomEnabledRules,
  },
  settings: {
    'import/extensions': ['ts', 'tsx'],
    react: {
      version: 'detect',
    },
  },

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
      env: {
        commonjs: true,
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: undefined,
      },
    },
  ],
};
