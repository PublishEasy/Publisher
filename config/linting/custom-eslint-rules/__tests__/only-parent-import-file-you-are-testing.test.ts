import rule from '../only-parent-import-file-you-are-testing';
import { getRuleNameFromFileName } from './helpers/get-rule-name-from-file-name';
import { getValidatedRuleType } from './helpers/get-validated-rule-type';
import { RuleTester } from './helpers/rule-tester';
import {
  ErrorTestCase,
  errorTestCasesToInvalidRuleTesterCases,
  TestCase,
  testCasesToValidRuleTesterCases,
} from './helpers/test-case-types-and-transformations';

const typedRule = {
  ...rule,
  meta: {
    ...rule.meta,
    type: getValidatedRuleType(rule.meta.type),
  },
};

type MessageIds = keyof typeof typedRule['meta']['messages'];
type ErrorTestCaseWithMessageIds = ErrorTestCase<MessageIds>;

const fileBaseName = 'some-filename';
const parentDirectory = 'c';
const fileInTestsDirectory = `a/b/${parentDirectory}/__tests__/${fileBaseName}.test.ts`;
const nonTestFileInTestsDirectory = `a/b/${parentDirectory}/__tests__/${fileBaseName}.ts`;
const fileOutsideTestsDirectory = `a/b/${fileBaseName}.test.ts`;
const fileInSubdirectoryOfTests = `a/b/c/__tests__/d/${fileBaseName}.test.ts`;

const testCases: ErrorTestCaseWithMessageIds[] = [
  {
    description: 'doing double parent import from tests',
    parameters: {
      currentFilePath: fileInTestsDirectory,
      importPath: '../../',
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description:
      'importing something going up from outside the tests directory',
    parameters: {
      currentFilePath: fileOutsideTestsDirectory,
      importPath: '../a.txt',
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description:
      'importing something going up from inside subdirectory of tests',
    parameters: {
      currentFilePath: fileInSubdirectoryOfTests,
      importPath: '../b.txt',
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description: 'importing parent file from tests but not with same basename',
    parameters: {
      currentFilePath: fileInTestsDirectory,
      importPath: '../different.txt',
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description:
      'importing parent file with same basename but not from within tests',
    parameters: {
      currentFilePath: fileOutsideTestsDirectory,
      importPath: `../${fileBaseName}.ts`,
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description:
      'importing parent file with same basename but from subdirectory of tests',
    parameters: {
      currentFilePath: fileInSubdirectoryOfTests,
      importPath: `../${fileBaseName}.ts`,
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description:
      'importing file above tests with same basename but from subdirectory of tests',
    parameters: {
      currentFilePath: fileInSubdirectoryOfTests,
      importPath: `../../${fileBaseName}.ts`,
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description:
      'importing a parent path and then going down into other directories',
    parameters: {
      currentFilePath: fileInTestsDirectory,
      importPath: '../a/b/c.txt',
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description:
      'importing the parent file with same basename but going up two directories in import statement first',
    parameters: {
      currentFilePath: fileInTestsDirectory,
      importPath: `../../${parentDirectory}/${fileBaseName}.ts`,
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description:
      'importing file with same base name from non test file in tests directory',
    parameters: {
      currentFilePath: nonTestFileInTestsDirectory,
      importPath: `../${fileBaseName}.ts`,
    },
    errorMessageIds: ['invalidParentImport'],
  },
  {
    description: 'importing file with same basename but from two levels up',
    parameters: {
      currentFilePath: fileInTestsDirectory,
      importPath: '../../a.ts',
    },
    errorMessageIds: ['invalidParentImport'],
  },
];

const validTestCases: TestCase[] = [
  {
    description:
      "doesn't error when parent importing file with same basename from tests directory",
    parameters: {
      currentFilePath: fileInTestsDirectory,
      importPath: `../${fileBaseName}.ts`,
    },
  },
  {
    description:
      "doesn't error when doing random import that has nothing to do with this rule",
    parameters: {
      currentFilePath: 'some/random/file.ts',
      importPath: `src/a/b/c.ts`,
    },
  },
];

new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module', ecmaVersion: 2019 },
}).run(getRuleNameFromFileName(__filename), typedRule, {
  valid: [...testCasesToValidRuleTesterCases(validTestCases)],
  invalid: [...errorTestCasesToInvalidRuleTesterCases(testCases)],
});
