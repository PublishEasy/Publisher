import { create } from '../only-import-internal-from-inside-and-index';

const moduleParentDirectory = 'a';
const moduleDirectoryName = 'b';
const modulePath = moduleParentDirectory + '/' + moduleDirectoryName;
const pathToInternal = modulePath + '/internal';
const indexFile = modulePath + '/index.ts';
const fileInsideInternal = pathToInternal + '/a.txt';
const fileOutsideInternal = 'a/b/c.txt';

describe('only-import-internal-from-inside-and-index eslint rule', () => {
  describe('errors when', () => {
    const testCases: {
      description: string;
      parameters: { currentFilePath: string; importPath: string };
    }[] = [
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
        description: 'importing internal absolutely from inside',
        parameters: {
          currentFilePath: fileInsideInternal,
          importPath: pathToInternal + '/b.txt',
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
        description:
          'importing relative within internal from internal/dependencies.ts',
        parameters: {
          currentFilePath: `${pathToInternal}/dependencies.ts`,
          importPath: './c.ts',
        },
      },
      {
        description:
          'importing anything relative outside internal from internal/dependencies.ts',
        parameters: {
          currentFilePath: `${pathToInternal}/dependencies.ts`,
          importPath: '../../b/c.ts',
        },
      },
      {
        description:
          'importing internal with absolute import from a test file belong to the directory',
        parameters: {
          currentFilePath: `${pathToInternal}/__tests__/a.test.ts`,
          importPath: `${pathToInternal}/a.txt`,
        },
      },
      {
        description:
          'importing internal with relative import that takes a detour from a test file belonging to the directory',
        parameters: {
          currentFilePath: `${pathToInternal}/__tests__/a.test.ts`,
          importPath: '../../internal/a.txt',
        },
      },
      {
        description:
          'importing internal with direct parent relative import from a non test file in the tests directory of the internal directory',
        parameters: {
          currentFilePath: `${pathToInternal}/__tests__/a.ts`,
          importPath: '../a.txt',
        },
      },
      {
        description:
          'importing from same directory when in internal test directory',
        parameters: {
          currentFilePath: `${pathToInternal}/__tests__/a.ts`,
          importPath: './a.txt',
        },
      },
    ];

    testCases.forEach(({ description, parameters }) =>
      it(description, () => {
        const { context, node } = getStubs(parameters);

        assertTestFailed(context, node);
      }),
    );
  });

  describe('passes when', () => {
    const testCases: {
      description: string;
      parameters: { currentFilePath: string; importPath: string };
    }[] = [
      {
        description: 'importing internal relatively inside internal',
        parameters: {
          currentFilePath: fileInsideInternal,
          importPath: './b.txt',
        },
      },
      {
        description: 'importing internal relatively from related index',
        parameters: {
          currentFilePath: indexFile,
          importPath: './internal/a.txt',
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
          'importing with direct parent relative import from inside the internal directories __tests__ directory',
        parameters: {
          currentFilePath: `${pathToInternal}/__tests__/a.test.ts`,
          importPath: '../a.ts',
        },
      },
      {
        description:
          'importing test helper function inside internal test directory',
        parameters: {
          currentFilePath: `${pathToInternal}/__tests__/a.test.ts`,
          importPath: './helpers/a.ts',
        },
      },
    ];

    testCases.forEach(({ description, parameters }) =>
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
