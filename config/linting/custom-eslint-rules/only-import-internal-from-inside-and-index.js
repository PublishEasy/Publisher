/* eslint-disable @typescript-eslint/no-var-requires */
const _ = require('lodash');

module.exports = {
  create: function onlyImportInternalFromInsideAndIndex(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filePath = context.getFilename();

        const violationIfAny = new ViolationFinder({
          filePath,
          importPath,
        }).getViolationIfAny();

        if (violationIfAny) {
          context.report({
            node,
            ...violationIfAny,
          });
        }
      },
    };
  },
};

class ViolationFinder {
  constructor({ filePath, importPath }) {
    this.currentPathParser = new PathParser(filePath);
    this.importPathParser = new PathParser(importPath);
    this.filePath = filePath;
    this.importPath = importPath;
  }

  getViolationIfAny() {
    const violations = [];
    if (this.currentFileInSubdirectoryOfInternal()) {
      violations.push(this.getAnyInternalSubdirectoryViolations());
    } else if (
      this.currentPathParser.directAncestorsAre([PathParser.internalDirectory])
    ) {
      violations.push(this.getAnyDirectInternalViolations());
    } else if (this.currentPathParser.isExternal()) {
      violations.push(this.getAnyExternalViolations());
    }
    const violationIfAny = violations.find(x => x !== undefined);
    return violationIfAny;
  }

  currentFileInSubdirectoryOfInternal() {
    return (
      this.currentPathParser.hasAncestor(PathParser.internalDirectory) &&
      !this.currentPathParser.directAncestorsAre(PathParser.internalDirectory)
    );
  }

  getAnyInternalSubdirectoryViolations() {
    if (this.isInternalTestFile()) {
      return this.getAnyTestFileViolations();
    } else if (this.isTestHelperFile()) {
      return this.getAnyTestHelperViolations();
    } else {
      return {
        message:
          'File {{filePath}} is in a generic subdirectory of an internal directory which is not allowed',
        data: { filePath: this.filePath },
      };
    }
  }

  isInternalTestFile() {
    const correctParents = this.currentPathParser.directAncestorsAre([
      PathParser.internalDirectory,
      PathParser.testDirectory,
    ]);
    return correctParents && this.currentPathParser.isTestFile();
  }

  getAnyTestFileViolations() {
    const isImportingHelperRelatively = this.importPathParser.directAncestorsAre(
      ['.', PathParser.testHelperDirectory],
    );
    const expectedFileName = this.currentPathParser.fileBase() + '.ts';
    const isFileWeAreTesting =
      this.importPathParser.directAncestorsAre('..') &&
      this.importPathParser.fileName() === expectedFileName;
    const isAllowed = isImportingHelperRelatively || isFileWeAreTesting;
    if (!isAllowed) {
      return {
        message:
          'You are only allowed to import the file you are testing and any local helper files',
      };
    }
  }

  isTestHelperFile() {
    return false;
  }

  getAnyDirectInternalViolations() {
    if (this.currentPathParser.fileName() === PathParser.dependenciesFile) {
      return this.getAnyRelativeImportViolation();
    }
    return this.getAnyViolationOfLocalRelativeImport();
  }

  getAnyRelativeImportViolation() {
    if (this.importPathParser.isRelativeImport()) {
      return {
        message:
          'The file {{filePath}} is importing {{importPath}} which is a relative import. Only absolute imports are allowed from this file',
        data: { filePath: this.filePath, importPath: this.importPath },
      };
    }
  }

  getAnyViolationOfLocalRelativeImport() {
    if (!this.importPathParser.directAncestorsAre('.')) {
      return {
        message:
          'File {{filePath}} is importing {{importPath}} from within internal directory where it is only allowed to relatively import other files in that internal directory',
        data: { filePath: this.filePath, importPath: this.importPath },
      };
    }
  }

  getAnyExternalViolations() {
    const isInViolation =
      this.importPathParser.hasAncestor(PathParser.internalDirectory) &&
      !this.isIndexDoingOkayImport();
    if (isInViolation) {
      return {
        message:
          'File {{filePath}} is importing {{importPath}} which is in an internal directory. Only direct parent index files are allowed to do this',
        data: { filePath: this.filePath, importPath: this.importPath },
      };
    }
  }

  isIndexDoingOkayImport() {
    const isImportingDirectInternalChild = this.importPathParser.directAncestorsAre(
      '.',
      PathParser.internalDirectory,
    );
    return (
      this.currentPathParser.isIndexFile() && isImportingDirectInternalChild
    );
  }
}

class PathParser {
  static internalDirectory = 'internal';
  static testDirectory = '__tests__';
  static testHelperDirectory = 'helpers';
  static dependenciesFile = 'dependencies.ts';

  constructor(path) {
    this.path = path;
  }

  getPath() {
    return this.path;
  }

  fileName() {
    return this.__getLastPartsOfPath(1)[0];
  }

  fileBase() {
    return this.fileName().split('.')[0];
  }

  directAncestorsAre(expectedParents, ...rest) {
    if (typeof expectedParents === 'string')
      expectedParents = [expectedParents];
    if (rest) expectedParents = expectedParents.concat(rest);
    const numParents = expectedParents.length;
    const pathLength = numParents + 1; // Includes filename
    const pathParts = this.__getLastPartsOfPath(pathLength);
    const actualParents = pathParts.slice(0, -1);
    return _.isEqual(expectedParents, actualParents);
  }

  hasAncestor(expectedAncestor) {
    return this.path.includes(`/${expectedAncestor}`);
  }

  isExternal() {
    return !this.hasAncestor(PathParser.internalDirectory);
  }

  isIndexFile() {
    return this.fileName() === 'index.ts';
  }

  isRelativeImport() {
    return this.path.startsWith('./') || this.path.startsWith('../');
  }

  isTestFile() {
    return this.fileName().endsWith('.test.ts');
  }

  __getLastPartsOfPath(numPartsOfPath) {
    return this.path.split('/').slice(-1 * numPartsOfPath);
  }
}
