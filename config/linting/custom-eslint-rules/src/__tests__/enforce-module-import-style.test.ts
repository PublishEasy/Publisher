import rule from '../enforce-module-import-style';
import { CustomRuleTester } from './helpers/rule-tester';
import {
  buildImportTestCase,
  ImportTestCase,
} from './helpers/test-case-utilities';
import { validateTestImports } from './helpers/validate-imports-test-cases';

type MessageIds = keyof typeof rule['meta']['messages'];
type TestCaseWithMessageIds = ImportTestCase<MessageIds>;

const root = 'src';
const moduleParentDirectory = 'a';
const moduleDirectoryName = 'b';
const modulePath =
  root + '/' + moduleParentDirectory + '/' + moduleDirectoryName;
const pathToInternal = modulePath + '/internal';
const pathToTestDirectory = pathToInternal + '/__tests__';
const pathToTestHelpers = `${pathToTestDirectory}/helpers`;
const indexFile = modulePath + '/index.ts';
const fileInsideInternal = pathToInternal + '/a.txt';
const fileOutsideInternal = root + '/' + 'a/b/c.txt';

const builtTestCases = [
  getExternalFileTests(),
  getInternalFileTests(),
  getModuleSpecificTestAllowances(),
  getSubdirectoryOfInternalTests(),
].map(buildImportTestCase);

validateTestImports(rule, pathToTestDirectory);
new CustomRuleTester(rule).runTests(...builtTestCases);

function getExternalFileTests(): TestCaseWithMessageIds {
  return {
    valid: [
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
    ],
    invalid: [
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
    ],
  };
}

function getInternalFileTests(): TestCaseWithMessageIds {
  return {
    valid: [
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
      {
        description:
          'importing from React in an internal file, an exception we allow',
        parameters: {
          currentFilePath: fileInsideInternal,
          importPath: 'react',
        },
      },
    ],
    invalid: [
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
        description:
          'doing local relative import from internal/dependencies.ts',
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
    ],
  };
}

function getModuleSpecificTestAllowances(): TestCaseWithMessageIds {
  return {
    valid: [
      {
        description: 'importing types of the module from test file',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: '../types.ts',
        },
      },
      {
        description:
          'importing types of the module from test file with no extension',
        parameters: {
          currentFilePath: `${pathToTestDirectory}/a.test.ts`,
          importPath: '../types',
        },
      },
      {
        description:
          'importing any file within the internal directory relatively from helper files',
        parameters: {
          currentFilePath: `${pathToTestHelpers}/a.test.ts`,
          importPath: '../../b.ts',
        },
      },
    ],
    invalid: [
      {
        description:
          'importing internal directory files absolutely from helper files',
        parameters: {
          currentFilePath: `${pathToTestHelpers}/a.test.ts`,
          importPath: `${pathToInternal}/b.ts`,
        },
        errorMessageIds: ['__testImport__wrongImportFromTestHelper'],
      },
      {
        description:
          'relatively importing something above internal from helper files',
        parameters: {
          currentFilePath: `${pathToTestHelpers}/a.test.ts`,
          importPath: `../../../b.ts`,
        },
        errorMessageIds: ['__testImport__wrongImportFromTestHelper'],
      },
    ],
  };
}

function getSubdirectoryOfInternalTests(): TestCaseWithMessageIds {
  return {
    valid: [],
    invalid: [
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
        description:
          'importing absolutely from generic subdirectory of internal',
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
    ],
  };
}
