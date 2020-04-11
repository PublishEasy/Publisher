'use strict';
const experimental_utils_1 = require('@typescript-eslint/experimental-utils');
const check_test_imports_1 = require('./rule-helpers/check-test-imports');
const paths_1 = require('./rule-helpers/paths');
const errorMessages = Object.assign(
  {
    invalidSubdirectory: `Only test and test helper directories are allowed in internal`,
    testFile: `In test files you are only allowed to import the file you are testing, module types and any local helper files`,
    testHelperFile: `You are only allowed to do third party imports from a test helper file`,
    dependenciesFile:
      'Dependency files are only allowed to do absolute imports',
    notRelativeSibling: `Internal directory files are only allowed to relatively import other files in that internal directory`,
    externalFile: `Only direct parent index files are allowed to import from internal directory`,
  },
  check_test_imports_1.getTestImportErrorMessages(),
);
function findAnyViolation({ currentPath, importPath }) {
  const paths = { currentPath, importPath };
  let violation = null;
  if (currentPath.inSubdirectoryOfInternal()) {
    violation = checkInternalSubdirectory(paths);
  } else if (currentPath.inInternal()) {
    violation = checkInternalTopLevel(paths);
  } else if (currentPath.isExternal()) {
    violation = checkExternal(paths);
  }
  return violation;
}
function checkInternalSubdirectory({ currentPath, importPath }) {
  if (currentPath.inTestDirectory()) {
    if (isModuleException()) return null;
    return check_test_imports_1.checkTestImports({ currentPath, importPath });
  } else {
    return 'invalidSubdirectory';
  }
  function isModuleException() {
    const isTestFileImportingTypes =
      currentPath.isInternalTestFile() && importPath.isParentTypesFile();
    const isHelperFileImportingInternal =
      currentPath.isTestHelperFile() && importPath.isGrandParent();
    return isTestFileImportingTypes || isHelperFileImportingInternal;
  }
}
function checkInternalTopLevel({ currentPath, importPath }) {
  if (importPath.isFromReact()) return null;
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
module.exports = experimental_utils_1.ESLintUtils.RuleCreator(
  () => 'This rule is not public',
)({
  name: __filename.split('.')[0],
  defaultOptions: [],
  meta: {
    messages: errorMessages,
    type: 'problem',
    schema: [],
    docs: {
      description: 'Enforces our strict dependency management style',
      category: 'Best Practices',
      recommended: 'error',
    },
  },
  create: function onlyImportInternalFromInsideAndIndex(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== 'string')
          throw new Error('Unexpected import path type ' + typeof importPath);
        const violation = findAnyViolation({
          currentPath: new paths_1.FilePath(context.getFilename()),
          importPath: new paths_1.ImportPath(importPath),
        });
        if (violation) {
          context.report({
            node,
            messageId: violation,
          });
        }
      },
    };
  },
});
