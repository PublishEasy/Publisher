const { FilePath, ImportPath } = require('./paths');

module.exports = {
  meta: {
    messages: {
      invalidSubdirectory: `Only test and test helper directories are allowed in internal`,
      testFile: `In test files you are only allowed to import the file you are testing and any local helper files`,
      testHelperFile: `You are only allowed to do third party imports from a test helper file`,
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
        const importPathString = node.source.value;
        const currentPathString = context.getFilename();

        const violation = findAnyViolation({
          currentPathString,
          importPathString,
        });

        if (violation) {
          context.report({
            node,
            message: violation,
          });
        }
      },
    };
  },
};

function findAnyViolation({ currentPathString, importPathString }) {
  return new ViolationFinder({
    currentPathString,
    importPathString,
  }).compute();
}

class ViolationFinder {
  constructor({ currentPathString, importPathString }) {
    this.importPath = new ImportPath(importPathString);
    this.currentPath = new FilePath(currentPathString);
  }

  compute() {
    let violation = null;
    if (this.currentPath.inSubdirectoryOfInternal()) {
      violation = this.getAnyInternalSubdirectoryViolation();
    } else if (this.currentPath.isInInternal()) {
      violation = this.getAnyTopLevelInternalViolation();
    } else if (this.currentPath.isExternal()) {
      violation = this.getAnyExternalViolation();
    }
    return violation;
  }

  getAnyInternalSubdirectoryViolation() {
    if (this.currentPath.isInternalTestFile()) {
      return this.getAnyTestFileViolation();
    } else if (this.currentPath.isTestHelperFile()) {
      return this.getAnyTestHelperViolation();
    } else {
      return 'invalidSubdirectory';
    }
  }

  getAnyTestFileViolation() {
    const isAllowed =
      this.importPath.isTestHelper() ||
      this.importPath.isSourceFileForTestPath(this.currentPath);
    if (!isAllowed) {
      return 'testFile';
    }
  }

  getAnyTestHelperViolation() {
    if (this.importPath.isNotThirdParty()) {
      return 'testHelperFile';
    }
  }

  getAnyTopLevelInternalViolation() {
    if (this.currentPath.isDependenciesFile()) {
      if (this.importPath.isRelative()) {
        return 'dependenciesFile';
      }
    } else if (this.importPath.isNotLocalRelative()) {
      return 'localRelativeImport';
    }
  }

  getAnyExternalViolation() {
    const isInViolation =
      this.importPath.isUnderInternal() && this.isNotIndexFileException();
    if (isInViolation) {
      return 'externalFile';
    }
  }

  isNotIndexFileException() {
    const isIndexFileException =
      this.currentPath.isIndexFile() && this.importPath.isDirectChildInternal();
    return !isIndexFileException;
  }
}
