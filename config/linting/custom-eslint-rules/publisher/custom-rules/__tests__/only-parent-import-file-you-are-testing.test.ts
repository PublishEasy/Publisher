/* eslint-disable */
// Just avoiding eslint circular imports
import { create } from '../only-parent-import-file-you-are-testing';

/* eslint-enable */

const fileBaseName = 'some-filename';
const parentDirectory = 'c';
const fileInTestsDirectory = `a/b/${parentDirectory}/__tests__/${fileBaseName}.test.ts`;
const fileOutsideTestsDirectory = `a/b/${fileBaseName}.test.ts`;
const fileInSubdirectoryOfTests = `a/b/c/__tests__/d/${fileBaseName}.test.ts`;

describe('only-parent-import-file-you-are-testing eslint rule', () => {
  describe('errors when', () => {
    const testCases: {
      description: string;
      parameters: { currentFilePath: string; importPath: string };
    }[] = [
      {
        description: 'doing double parent import from tests',
        parameters: {
          currentFilePath: fileInTestsDirectory,
          importPath: '../../',
        },
      },
      {
        description:
          'importing something going up from outside the tests directory',
        parameters: {
          currentFilePath: fileOutsideTestsDirectory,
          importPath: '../a.txt',
        },
      },
      {
        description:
          'importing something going up from inside subdirectory of tests',
        parameters: {
          currentFilePath: fileInSubdirectoryOfTests,
          importPath: '../b.txt',
        },
      },
      {
        description:
          'importing parent file from tests but not with same basename',
        parameters: {
          currentFilePath: fileInTestsDirectory,
          importPath: '../different.txt',
        },
      },
      {
        description:
          'importing parent file with same basename but not from within tests',
        parameters: {
          currentFilePath: fileOutsideTestsDirectory,
          importPath: `../${fileBaseName}.ts`,
        },
      },
      {
        description:
          'importing parent file with same basename but from subdirectory of tests',
        parameters: {
          currentFilePath: fileInSubdirectoryOfTests,
          importPath: `../${fileBaseName}.ts`,
        },
      },
      {
        description:
          'importing file above tests with same basename but from subdirectory of tests',
        parameters: {
          currentFilePath: fileInSubdirectoryOfTests,
          importPath: `../../${fileBaseName}.ts`,
        },
      },
      {
        description:
          'importing a parent path and then going down into other directories',
        parameters: {
          currentFilePath: fileInTestsDirectory,
          importPath: '../a/b/c.txt',
        },
      },
      {
        description:
          'importing the parent file with same basename but going up two directories in import statement first',
        parameters: {
          currentFilePath: fileInTestsDirectory,
          importPath: `../../${parentDirectory}/${fileBaseName}.ts`,
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
  it("doesn't error when parent importing file with same basename from tests directory", () => {
    const { context, node } = getStubs({
      currentFilePath: fileInTestsDirectory,
      importPath: `../${fileBaseName}.ts`,
    });

    create(context).ImportDeclaration(node);
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
