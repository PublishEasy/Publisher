const { FilePath, ImportPath } = require('./paths');

module.exports = {
  meta: {
    messages: {
      invalidSubdirectory: `Only test and test helper directories are allowed in internal`,
      testFile: `In test files you are only allowed to import the file you are testing and any local helper files`,
      testHelperFile: `You are only allowed to do third party imports from a test helper file`,
      dependenciesFile:
        'Dependency files are only allowed to do absolute imports',
      notRelativeSibling: `Internal directory files are only allowed to relatively import other files in that internal directory`,
      externalFile: `Only direct parent index files are allowed to import from internal directory`,
    },
    type: 'problem',
    schema: [],
  },
  create: function onlyImportInternalFromInsideAndIndex(context) {
    return {
      ImportDeclaration(node) {
        const violation = findAnyViolation({
          currentPath: new FilePath(context.getFilename()),
          importPath: new ImportPath(node.source.value),
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

function findAnyViolation({ currentPath, importPath }) {
  const paths = { currentPath, importPath };
  let violation = null;
  if (currentPath.inSubdirectoryOfInternal(paths)) {
    violation = checkInternalSubdirectory(paths);
  } else if (currentPath.inInternal()) {
    violation = checkInternalTopLevel(paths);
  } else if (currentPath.isExternal()) {
    violation = checkExternal(paths);
  }
  return violation;
}

function checkInternalSubdirectory({ currentPath, importPath }) {
  if (currentPath.isInternalTestFile()) {
    return checkTestFile();
  } else if (currentPath.isTestHelperFile()) {
    return checkTestHelper();
  } else {
    return 'invalidSubdirectory';
  }

  function checkTestFile() {
    const isAllowed =
      importPath.isTestHelper() ||
      importPath.isSourceFileForTestPath(currentPath);
    if (!isAllowed) {
      return 'testFile';
    }
    return null;
  }
  function checkTestHelper() {
    if (importPath.isNotThirdParty()) {
      return 'testHelperFile';
    }
    return null;
  }
}

function checkInternalTopLevel({ currentPath, importPath }) {
  if (currentPath.isDependenciesFile()) {
    if (importPath.isRelative()) {
      return 'dependenciesFile';
    }
  } else if (importPath.isNotRelativeSibling()) {
    return 'notRelativeSibling';
  }
  return null;
}

function checkExternal({ currentPath, importPath }) {
  const isInViolation = importPath.underInternal() && isNotIndexFileException();
  if (isInViolation) {
    return 'externalFile';
  }
  return null;

  function isNotIndexFileException() {
    const isIndexFileException =
      currentPath.isIndexFile() &&
      importPath.isChild() &&
      importPath.inInternal();
    return !isIndexFileException;
  }
}
