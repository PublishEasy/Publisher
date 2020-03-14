const PathParser = require('./path-parser');

module.exports = {
  meta: {
    messages: {
      invalidSubdirectory: `Only test and test helpers subdirectories of internal are allowed`,
      testFile: `In test files you are only allowed to import the file you are testing and any local helper files`,
      testHelperFile: `You are only allowed to do third party imports from a test helper file`,
      relativeImport: `Only absolute imports are allowed from this file`,
      dependenciesFile:
        'Dependency files are only allowed to do absolute imports',
      localRelativeImport: `Internal directory files are only allowed to relatively import other files in that internal directory`,
      externalFile: `Only direct parent index files are allowed to import from internal directory`,
    },
    type: 'problem',
    schema: [],
  },
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
      this.currentPathParser.directAncestorsAre([
        PathParser.names.internalDirectory,
      ])
    ) {
      violations.push(this.getAnyTopLevelInternalViolations());
    } else if (this.currentPathParser.isExternal()) {
      violations.push(this.getAnyExternalViolations());
    }
    const violationIfAny = violations.find(x => x !== undefined);
    return violationIfAny;
  }

  currentFileInSubdirectoryOfInternal() {
    return (
      this.currentPathParser.hasAncestor(PathParser.names.internalDirectory) &&
      !this.currentPathParser.directAncestorsAre(
        PathParser.names.internalDirectory,
      )
    );
  }

  getAnyInternalSubdirectoryViolations() {
    if (this.isInternalTestFile()) {
      return this.getAnyTestFileViolations();
    } else if (this.isTestHelperFile()) {
      return this.getAnyTestHelperViolations();
    } else {
      return 'invalidSubdirectory';
    }
  }

  isInternalTestFile() {
    const ancestorsAreCorrect = this.currentPathParser.directAncestorsAre([
      PathParser.names.internalDirectory,
      PathParser.names.testDirectory,
    ]);
    return ancestorsAreCorrect && this.currentPathParser.hasTestExtension();
  }

  getAnyTestFileViolations() {
    const isImportingHelperRelatively = this.importPathParser.directAncestorsAre(
      ['.', PathParser.names.testHelperDirectory],
    );
    const fileNamesMatch =
      this.importPathParser.fileBase() === this.currentPathParser.fileBase();
    const isFileWeAreTesting =
      this.importPathParser.allAncestorsAre('..') && fileNamesMatch;
    const isAllowed = isImportingHelperRelatively || isFileWeAreTesting;
    if (!isAllowed) {
      return 'testFile';
    }
  }

  isTestHelperFile() {
    const ancestorsAreCorrect = this.currentPathParser.directAncestorsAre([
      PathParser.names.internalDirectory,
      PathParser.names.testDirectory,
      PathParser.names.testHelperDirectory,
    ]);
    return ancestorsAreCorrect;
  }

  getAnyTestHelperViolations() {
    const isThirdPartyImport = this.importPathParser.isThirdPartyImport();
    if (!isThirdPartyImport) {
      return 'testHelperFile';
    }
  }

  getAnyTopLevelInternalViolations() {
    const isDependenciesFile =
      this.currentPathParser.fileName() === PathParser.names.dependenciesFile;
    if (isDependenciesFile) {
      if (this.importPathParser.isRelative()) {
        return 'dependenciesFile';
      }
    } else {
      return this.getAnyViolationOfLocalRelativeImport();
    }
  }

  getAnyViolationOfLocalRelativeImport() {
    if (!this.importPathParser.directAncestorsAre('.')) {
      return 'localRelativeImport';
    }
  }

  getAnyExternalViolations() {
    const isInViolation =
      this.importPathParser.hasAncestor(PathParser.names.internalDirectory) &&
      !this.isIndexDoingOkayImport();
    if (isInViolation) {
      return 'externalFile';
    }
  }

  isIndexDoingOkayImport() {
    const isImportingDirectInternalChild = this.importPathParser.directAncestorsAre(
      '.',
      PathParser.names.internalDirectory,
    );
    return (
      this.currentPathParser.isIndexFile() && isImportingDirectInternalChild
    );
  }
}
