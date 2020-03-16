import rule from '../enforce-module-import-style';
import { getRuleNameFromFileName } from './helpers/get-rule-name-from-file-name';
import { getValidatedRuleType } from './helpers/get-validated-rule-type';
import { RuleTester } from './helpers/rule-tester';
import {
  ErrorTestCase,
  errorTestCasesToInvalidRuleTesterCases,
  TestCase,
  testCasesToValidRuleTesterCases
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

const moduleParentDirectory = 'a';
const moduleDirectoryName = 'b';
const modulePath = moduleParentDirectory + '/' + moduleDirectoryName;
const pathToInternal = modulePath + '/internal';
const pathToTestDirectory = pathToInternal + '/__tests__';
const indexFile = modulePath + '/index.ts';
const fileInsideInternal = pathToInternal + '/a.txt';
const fileOutsideInternal = 'a/b/c.txt';

const externalFilePassingTests: TestCase[] = [
  {
    description: 'importing internal relatively from related index',
    parameters: {
      currentFilePath: indexFile,
      importPath: './internal/a.txt',
    },
  },
  {
    description: 'external file importing random file not in internal',
    parameters: {
      currentFilePath: '/a.ts',
      importPath: '/b.ts',
    },
  },
];
const externalFileErrorTests: ErrorTestCaseWithMessageIds[] = [
  {
    description: 'importing internal relatively from outside',
    parameters: {
      currentFilePath: fileOutsideInternal,
      importPath: './internal/b.txt',
    },
    errorMessageIds: ['externalFile'],
  },
  {
    description: 'importing internal absolutely from outside',
    parameters: {
      currentFilePath: fileOutsideInternal,
      importPath: 'src/internal/b.txt',
    },
    errorMessageIds: ['externalFile'],
  },
  {
    description: 'importing internal absolutely from relevant index',
    parameters: {
      currentFilePath: indexFile,
      importPath: pathToInternal + '/b.txt',
    },
    errorMessageIds: ['externalFile'],
  },
  {
    description: 'importing internal relatively from irrelevant index',
    parameters: {
      currentFilePath: `${moduleParentDirectory}/index.ts`,
      importPath: `./${moduleDirectoryName}/internal/b.txt`,
    },
    errorMessageIds: ['externalFile'],
  },
  {
    description: 'random path near root importing internal',
    parameters: {
      currentFilePath: '/a.txt',
      importPath: pathToInternal + '/b.txt',
    },
    errorMessageIds: ['externalFile'],
  },
];

const internalFilePassingTests: TestCase[] = [
  {
    description: 'importing internal relatively inside internal',
    parameters: {
      currentFilePath: fileInsideInternal,
      importPath: './b.txt',
    },
  },
  {
    description: 'doing absolute imports from internal/dependencies.ts',
    parameters: {
      currentFilePath: `${pathToInternal}/dependencies.ts`,
      importPath: 'express',
    },
  },
];
const internalFileErrorTests: ErrorTestCaseWithMessageIds[] = [
  {
    description: 'importing internal absolutely from inside',
    parameters: {
      currentFilePath: fileInsideInternal,
      importPath: pathToInternal + '/b.txt',
    },
    errorMessageIds: ['notRelativeSibling'],
  },
  {
    description: 'importing something external from internal',
    parameters: {
      currentFilePath: fileInsideInternal,
      importPath: 'src/something.txt',
    },
    errorMessageIds: ['notRelativeSibling'],
  },
  {
    description: 'doing local relative import from internal/dependencies.ts',
    parameters: {
      currentFilePath: `${pathToInternal}/dependencies.ts`,
      importPath: './c.ts',
    },
    errorMessageIds: ['dependenciesFile'],
  },
  {
    description:
      'relatively importing anything outside internal from internal/dependencies.ts',
    parameters: {
      currentFilePath: `${pathToInternal}/dependencies.ts`,
      importPath: '../../b/c.ts',
    },
    errorMessageIds: ['dependenciesFile'],
  },
];

const internalTestDirectoryPassingTests: TestCase[] = [
  {
    description: 'importing file we are testing from internal test directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: '../a.ts',
    },
  },
  {
    description:
      'importing file we are testing from internal test without specifying import extension',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.unit.test.ts`,
      importPath: '../a',
    },
  },

  {
    description:
      'importing test helper function inside internal test directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: './helpers/a.ts',
    },
  },
  // TODO: When we add a global test helper library we should add in test that that's allowed
];
const internalTestDirectoryErrorTests: ErrorTestCaseWithMessageIds[] = [
  {
    description:
      'importing internal with absolute import from a test file belonging to the directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: `${pathToInternal}/a.txt`,
    },
    errorMessageIds: ['testFile'],
  },
  {
    description:
      'importing internal with relative import that takes a detour from a test file belonging to the directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: '../../internal/a.txt',
    },
    errorMessageIds: ['testFile'],
  },
  {
    description:
      'direct parent relative importing an internal file from a non test file in the tests directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.ts`,
      importPath: '../a.txt',
    },
    errorMessageIds: ['invalidSubdirectory'],
  },
  {
    description:
      'importing from same directory when in internal test directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: './b.ts',
    },
    errorMessageIds: ['testFile'],
  },
  {
    description:
      "importing an internal file that's not the file you're testing from a test file",
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: `../b.ts`,
    },
    errorMessageIds: ['testFile'],
  },
  {
    description: 'importing file with same basename but from two levels up',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: '../../a.ts',
    },
    errorMessageIds: ['testFile'],
  },
];

const testHelperFilesPassingTests: TestCase[] = [
  {
    description: 'third party imports from test helper file',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/helpers/a.ts`,
      importPath: 'lodash',
    },
  },
];

const testHelperFilesErrorTests: ErrorTestCaseWithMessageIds[] = [
  {
    description: 'Absolute src imports from test helper file',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/helpers/a.ts`,
      importPath: 'src/a/b.ts',
    },
    errorMessageIds: ['testHelperFile'],
  },
  {
    description: 'relative imports from test helper file',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/helpers/a.ts`,
      importPath: './c.ts',
    },
    errorMessageIds: ['testHelperFile'],
  },
  {
    description: 'relative parent imports from test helper file',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/helpers/a.ts`,
      importPath: '../c.ts',
    },
    errorMessageIds: ['testHelperFile'],
  },
];
const subdirectoryOfInternalFailingTests: ErrorTestCaseWithMessageIds[] = [
  {
    description: 'importing locally from generic subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b.ts`,
      importPath: './c.ts',
    },
    errorMessageIds: ['invalidSubdirectory'],
  },
  {
    description: 'importing internal from generic subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b.ts`,
      importPath: '../c.ts',
    },
    errorMessageIds: ['invalidSubdirectory'],
  },
  {
    description: 'importing absolutely from generic subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b.ts`,
      importPath: 'src/a/b.txt',
    },
    errorMessageIds: ['invalidSubdirectory'],
  },
  {
    description:
      'importing absolutely from generic nested subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b/c.ts`,
      importPath: 'src/a/b.ts',
    },
    errorMessageIds: ['invalidSubdirectory'],
  },
  {
    description:
      'importing relatively from generic nested subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b/c.ts`,
      importPath: './b.ts',
    },
    errorMessageIds: ['invalidSubdirectory'],
  },
];

new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module', ecmaVersion: 2019 },
}).run(getRuleNameFromFileName(__filename), typedRule, {
  valid: [
    ...testCasesToValidRuleTesterCases(externalFilePassingTests),
    ...testCasesToValidRuleTesterCases(internalFilePassingTests),
    ...testCasesToValidRuleTesterCases(internalTestDirectoryPassingTests),
    ...testCasesToValidRuleTesterCases(testHelperFilesPassingTests),
  ],
  invalid: [
    ...errorTestCasesToInvalidRuleTesterCases(externalFileErrorTests),
    ...errorTestCasesToInvalidRuleTesterCases(internalFileErrorTests),
    ...errorTestCasesToInvalidRuleTesterCases(internalTestDirectoryErrorTests),
    ...errorTestCasesToInvalidRuleTesterCases(
      subdirectoryOfInternalFailingTests,
    ),
    ...errorTestCasesToInvalidRuleTesterCases(testHelperFilesErrorTests),
  ],
});
