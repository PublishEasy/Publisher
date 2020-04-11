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
  'enforce-module-import-style': 'error',
};

const disabledRules = {
  // This makes it more readable
  '@typescript-eslint/no-use-before-define': 'off',
  // We use Typescript
  'react/prop-types': 'off',
};
const javascriptCompatibleRules = {
  ...extraEnabledRules,
  ...disabledRules,
  ...ourCustomEnabledRules,
};

const allRules = {
  ...javascriptCompatibleRules,
};

const javascriptCompatibleConfigs = [
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:jsx-a11y/strict',
];

const allConfigs = [
  ...javascriptCompatibleConfigs,
  'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-requiring-type-checking',
];

module.exports = {
  root: true,
  plugins: ['@typescript-eslint', 'import', 'react', 'jsx-a11y', 'react-hooks'],
  settings: {
    'import/extensions': ['ts', 'tsx'],
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.js'],
      env: {
        commonjs: true,
        'shared-node-browser': true,
      },
      extends: javascriptCompatibleConfigs,
      rules: javascriptCompatibleRules,
      parserOptions: {
        ecmaVersion: 2020,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      env: {
        'shared-node-browser': true,
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      extends: allConfigs,
      rules: allRules,
    },
  ],
};
