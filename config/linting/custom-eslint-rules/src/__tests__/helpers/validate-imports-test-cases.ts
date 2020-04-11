import type { TSESLint } from '@typescript-eslint/experimental-utils';
import { CustomRuleTester } from './rule-tester';
import { buildImportTestCase, ImportTestCase } from './test-case-utilities';

import type { TestImportsMessageIds } from '../../rule-helpers/check-test-imports';

export function validateTestImports(
  rule: TSESLint.RuleModule<TestImportsMessageIds, []>,
  pathToTestDirectory: string,
): void {
  new CustomRuleTester(rule).runTests(
    ...getTestImportTestCases(pathToTestDirectory),
  );
}

export function getTestImportTestCases(
  pathToTestDirectory: string,
): TSESLint.RunTests<TestImportsMessageIds, []>[] {
  const testCases: ImportTestCase<TestImportsMessageIds>[] = [
    getTestDirectoryTests(pathToTestDirectory),
    getTestHelperFileTests(pathToTestDirectory),
  ];
  return testCases.map(buildImportTestCase);
}

function getTestDirectoryTests(
  pathToTestDirectory: string,
): ImportTestCase<TestImportsMessageIds> {
  const pathToParentDirectory = pathToTestDirectory
    .split('/')
    .slice(0, -1)
    .join('/');
  const parentDirectory = pathToParentDirectory.split('/').pop();
  return {
    valid: [
      {
        description: 'importing file we are testing',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: '../a.ts',
        },
      },
      {
        description:
          'importing file we are testing without specifying import extension',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.unit.test.ts`,
          importPath: '../a',
        },
      },
      {
        description: 'importing test helper function from test',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: './helpers/a.ts',
        },
      },
    ],
    invalid: [
      {
        description: 'using absolute import to get source file from parent',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: `${pathToParentDirectory}/a.ts`,
        },
        errorMessageIds: ['__testImport__wrongImportFromTestFile'],
      },
      {
        description:
          'using non-direct relative import to get source file from parent',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: `../../${parentDirectory}/a.ts`,
        },
        errorMessageIds: ['__testImport__wrongImportFromTestFile'],
      },
      {
        description:
          'using direct relative import to get irrelevant file from parent',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: '../b.ts',
        },
        errorMessageIds: ['__testImport__wrongImportFromTestFile'],
      },
      {
        description:
          'importing other file in test directory not in helper subdirectory',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: './b.ts',
        },
        errorMessageIds: ['__testImport__wrongImportFromTestFile'],
      },
      {
        description: 'importing file with same basename but from two levels up',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: '../../a.ts',
        },
        errorMessageIds: ['__testImport__wrongImportFromTestFile'],
      },
    ],
  };
}

function getTestHelperFileTests(
  pathToTestDirectory: string,
): ImportTestCase<TestImportsMessageIds> {
  const pathToTestHelperDirectory = `${pathToTestDirectory}/helpers`;
  return {
    valid: [
      {
        description: 'third party imports from test helper file',
        parameters: {
          currentFilePath: `${pathToTestHelperDirectory}/a.ts`,
          importPath: 'lodash',
        },
      },
    ],
    invalid: [
      {
        description: 'Absolute src imports from test helper file',
        parameters: {
          currentFilePath: `${pathToTestHelperDirectory}/a.ts`,
          importPath: 'src/a/b.ts',
        },
        errorMessageIds: ['__testImport__wrongImportFromTestHelper'],
      },
      {
        description: 'relative imports from test helper file',
        parameters: {
          currentFilePath: `${pathToTestHelperDirectory}/a.ts`,
          importPath: './c.ts',
        },
        errorMessageIds: ['__testImport__wrongImportFromTestHelper'],
      },
      {
        description: 'relative parent imports from test helper file',
        parameters: {
          currentFilePath: `${pathToTestHelperDirectory}/a.ts`,
          importPath: '../c.ts',
        },
        errorMessageIds: ['__testImport__wrongImportFromTestHelper'],
      },
    ],
  };
}
