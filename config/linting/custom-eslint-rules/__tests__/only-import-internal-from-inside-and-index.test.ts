import { create } from '../only-import-internal-from-inside-and-index';

const moduleParentDirectory = 'a';
const moduleDirectoryName = 'b';
const modulePath = moduleParentDirectory + '/' + moduleDirectoryName;
const pathToInternal = modulePath + '/internal';
const pathToTestDirectory = pathToInternal + '/__tests__';
const indexFile = modulePath + '/index.ts';
const fileInsideInternal = pathToInternal + '/a.txt';
const fileOutsideInternal = 'a/b/c.txt';

type TestCase = {
  description: string;
  parameters: { currentFilePath: string; importPath: string };
};

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
const externalFileErrorTests: TestCase[] = [
  {
    description: 'importing internal relatively from outside',
    parameters: {
      currentFilePath: fileOutsideInternal,
      importPath: './internal/b.txt',
    },
  },
  {
    description: 'importing internal absolutely from outside',
    parameters: {
      currentFilePath: fileOutsideInternal,
      importPath: 'src/internal/b.txt',
    },
  },
  {
    description: 'importing internal absolutely from relevant index',
    parameters: {
      currentFilePath: indexFile,
      importPath: pathToInternal + '/b.txt',
    },
  },
  {
    description: 'importing internal relatively from irrelevant index',
    parameters: {
      currentFilePath: `${moduleParentDirectory}/index.ts`,
      importPath: `./${moduleDirectoryName}/internal/b.txt`,
    },
  },
  {
    description: 'random path near root importing internal',
    parameters: {
      currentFilePath: '/a.txt',
      importPath: pathToInternal + '/b.txt',
    },
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
const internalFileErrorTests: TestCase[] = [
  {
    description: 'importing internal absolutely from inside',
    parameters: {
      currentFilePath: fileInsideInternal,
      importPath: pathToInternal + '/b.txt',
    },
  },
  {
    description: 'importing something external from internal',
    parameters: {
      currentFilePath: fileInsideInternal,
      importPath: 'src/something.txt',
    },
  },
  {
    description: 'doing local relative import from internal/dependencies.ts',
    parameters: {
      currentFilePath: `${pathToInternal}/dependencies.ts`,
      importPath: './c.ts',
    },
  },
  {
    description:
      'relatively importing anything outside internal from internal/dependencies.ts',
    parameters: {
      currentFilePath: `${pathToInternal}/dependencies.ts`,
      importPath: '../../b/c.ts',
    },
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
      'importing test helper function inside internal test directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: './helpers/a.ts',
    },
  },
  // TODO: When we add a global test helper library we should add in test that that's allowed
];
const internalTestDirectoryErrorTests: TestCase[] = [
  {
    description:
      'importing internal with absolute import from a test file belonging to the directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: `${pathToInternal}/a.txt`,
    },
  },
  {
    description:
      'importing internal with relative import that takes a detour from a test file belonging to the directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: '../../internal/a.txt',
    },
  },
  {
    description:
      'direct parent relative importing an internal file from a non test file in the tests directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.ts`,
      importPath: '../a.txt',
    },
  },
  {
    description:
      'importing from same directory when in internal test directory',
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: './b.ts',
    },
  },
  {
    description:
      "importing an internal file that's not the file you're testing from a test file",
    parameters: {
      currentFilePath: `${pathToTestDirectory}/a.test.ts`,
      importPath: `../b.ts`,
    },
  },
];

const testHelperFilesPassingTests: TestCase[] = [
  // {
  //   description: 'non-src absolute imports from test helper file',
  //   parameters: {
  //     currentFilePath: `${pathToTestDirectory}/helpers/a.ts`,
  //     importPath: 'lodash',
  //   },
  // },
];
const subdirectoryOfInternalFailingTests: TestCase[] = [
  {
    description: 'importing locally from subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b.ts`,
      importPath: './c.ts',
    },
  },
  {
    description: 'importing internal from subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b.ts`,
      importPath: '../c.ts',
    },
  },
  {
    description: 'importing absolutely from subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b.ts`,
      importPath: 'src/a/b.txt',
    },
  },
  {
    description: 'importing absolutely from nested subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b/c.ts`,
      importPath: 'src/a/b.ts',
    },
  },
  {
    description: 'importing relatively from nested subdirectory of internal',
    parameters: {
      currentFilePath: `${pathToInternal}/a/b/c.ts`,
      importPath: './b.ts',
    },
  },
];

describe('only-import-internal-from-inside-and-index eslint rule', () => {
  describe('errors when', () => {
    const errorTests: TestCase[] = [
      ...externalFileErrorTests,
      ...internalFileErrorTests,
      ...internalTestDirectoryErrorTests,
      ...subdirectoryOfInternalFailingTests,
    ];
    errorTests.forEach(({ description, parameters }) =>
      it(description, () => {
        const { context, node } = getStubs(parameters);

        assertTestFailed(context, node);
      }),
    );
  });

  describe('passes when', () => {
    const passingTests: TestCase[] = [
      ...externalFilePassingTests,
      ...internalFilePassingTests,
      ...internalTestDirectoryPassingTests,
      ...testHelperFilesPassingTests,
    ];
    passingTests.forEach(({ description, parameters }) =>
      it(description, () => {
        const { context, node } = getStubs(parameters);
        create(context).ImportDeclaration(node);
      }),
    );
  });
});

const testFailedMessage = 'Assert test failed';

function getStubs({
  currentFilePath,
  importPath,
}: {
  currentFilePath: string;
  importPath: string;
}): { node: Node; context: Context } {
  return {
    context: createContextStub(currentFilePath),
    node: createNodeStub(importPath),
  };
}

function createContextStub(currentFilePath: string): Context {
  return {
    report: (): void => {
      throw new Error(testFailedMessage);
    },
    getFilename: (): string => currentFilePath,
  };
}

function createNodeStub(importPath: string): Node {
  return { source: { value: importPath } };
}

function assertTestFailed(context: Context, node: Node): void {
  expect(() => create(context).ImportDeclaration(node)).toThrowError(
    testFailedMessage,
  );
}

type Node = { source: { value: string } };
type Context = {
  report: () => void;
  getFilename: () => string;
};
