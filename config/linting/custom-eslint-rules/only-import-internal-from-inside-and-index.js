/* eslint-disable @typescript-eslint/no-var-requires */
const { isEqual: areDeepEqual } = require('lodash');

const pathNames = {
  testDirectory: '__tests__',
  testHelperDirectory: 'helpers',
  dependenciesFile: 'dependencies.ts',
  internalDirectory: 'internal',
  srcDirectory: 'src',
};

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
            data: {
              filePath,
              importPath,
            },
            message: violationIfAny,
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
  }

  getViolationIfAny() {
    const violations = [];
    if (this.currentFileInSubdirectoryOfInternal()) {
      violations.push(this.getAnyInternalSubdirectoryViolations());
    } else if (
      this.currentPathParser.directAncestorsAre([pathNames.internalDirectory])
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
      this.currentPathParser.hasAncestor(pathNames.internalDirectory) &&
      !this.currentPathParser.directAncestorsAre(pathNames.internalDirectory)
    );
  }

  getAnyInternalSubdirectoryViolations() {
    if (this.isInternalTestFile()) {
      return this.getAnyTestFileViolations();
    } else if (this.isTestHelperFile()) {
      return this.getAnyTestHelperViolations();
    } else {
      return 'File {{filePath}} is in a generic subdirectory of an internal directory which is not allowed';
    }
  }

  isInternalTestFile() {
    const ancestorsAreCorrect = this.currentPathParser.directAncestorsAre([
      pathNames.internalDirectory,
      pathNames.testDirectory,
    ]);
    return ancestorsAreCorrect && this.currentPathParser.isTestFile();
  }

  getAnyTestFileViolations() {
    const isImportingHelperRelatively = this.importPathParser.directAncestorsAre(
      ['.', pathNames.testHelperDirectory],
    );
    const fileNamesMatch =
      this.importPathParser.fileBase() === this.currentPathParser.fileBase();
    const isFileWeAreTesting =
      this.importPathParser.directAncestorsAre('..') && fileNamesMatch;
    const isAllowed = isImportingHelperRelatively || isFileWeAreTesting;
    if (!isAllowed) {
      return 'You are only allowed to import the file you are testing and any local helper files';
    }
  }

  isTestHelperFile() {
    const ancestorsAreCorrect = this.currentPathParser.directAncestorsAre([
      pathNames.internalDirectory,
      pathNames.testDirectory,
      pathNames.testHelperDirectory,
    ]);
    return ancestorsAreCorrect;
  }

  getAnyTestHelperViolations() {
    const isThirdPartyImport = this.importPathParser.isThirdPartyImport();
    if (!isThirdPartyImport) {
      return 'You are only allowed to do third party imports from a test helper file';
    }
  }

  getAnyDirectInternalViolations() {
    if (this.currentPathParser.fileName() === pathNames.dependenciesFile) {
      return this.getAnyRelativeImportViolation();
    }
    return this.getAnyViolationOfLocalRelativeImport();
  }

  getAnyRelativeImportViolation() {
    if (this.importPathParser.isRelative()) {
      return 'The file {{filePath}} is importing {{importPath}} which is a relative import. Only absolute imports are allowed from this file';
    }
  }

  getAnyViolationOfLocalRelativeImport() {
    if (!this.importPathParser.directAncestorsAre('.')) {
      return 'File {{filePath}} is importing {{importPath}} from within internal directory where it is only allowed to relatively import other files in that internal directory';
    }
  }

  getAnyExternalViolations() {
    const isInViolation =
      this.importPathParser.hasAncestor(pathNames.internalDirectory) &&
      !this.isIndexDoingOkayImport();
    if (isInViolation) {
      return 'File {{filePath}} is importing {{importPath}} which is in an internal directory. Only direct parent index files are allowed to do this';
    }
  }

  isIndexDoingOkayImport() {
    const isImportingDirectInternalChild = this.importPathParser.directAncestorsAre(
      '.',
      pathNames.internalDirectory,
    );
    return (
      this.currentPathParser.isIndexFile() && isImportingDirectInternalChild
    );
  }
}

class PathParser {
  constructor(path) {
    this.path = path;
  }

  fileName() {
    return this.__getLastPartsOfPath(1)[0];
  }

  fileBase() {
    return this.fileName().split('.')[0];
  }

  directAncestorsAre(expectedAncestors, ...rest) {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const actualAncestors = this.getXAncestors(expectedAncestors.length);
    return areDeepEqual(expectedAncestors, actualAncestors);
  }

  getXAncestors(numAncestors) {
    const lengthWithFilename = numAncestors + 1;
    const pathParts = this.__getLastPartsOfPath(lengthWithFilename);
    const partsWithoutFilename = pathParts.slice(0, -1);
    return partsWithoutFilename;
  }

  hasAncestor(expectedAncestor) {
    return this.path.includes(`/${expectedAncestor}`);
  }

  isExternal() {
    return !this.hasAncestor(pathNames.internalDirectory);
  }

  isIndexFile() {
    return this.fileName() === 'index.ts';
  }

  isRelative() {
    return this.path.startsWith('./') || this.path.startsWith('../');
  }

  isAbsolute() {
    return !this.isRelative();
  }

  isSrcAbsoluteImport() {
    return this.path.startsWith(pathNames.srcDirectory);
  }

  isThirdPartyImport() {
    return this.isAbsolute() && !this.isSrcAbsoluteImport();
  }

  isTestFile() {
    return this.fileName().endsWith('.test.ts');
  }

  __getLastPartsOfPath(numPartsOfPath) {
    return this.path.split('/').slice(-1 * numPartsOfPath);
  }
}

function diverseArgumentsToArray(expectedParents, rest) {
  if (typeof expectedParents === 'string') expectedParents = [expectedParents];
  if (rest) expectedParents = expectedParents.concat(rest);
  return expectedParents;
}
