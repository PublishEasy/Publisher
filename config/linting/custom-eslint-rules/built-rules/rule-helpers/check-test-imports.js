'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
/* eslint-disable @typescript-eslint/camelcase */
const errorMessages = {
  __testImport__wrongImportFromTestFile:
    'Test files are only allowed to relatively import their local helper files, and the file they are testing (which should have the same basename as the test). Anything else should either not need to be imported or be placed in a helper file',
  __testImport__wrongImportFromTestHelper:
    'Test helper files are only allowed to import third party dependencies',
};
function getTestImportErrorMessages() {
  return Object.assign({}, errorMessages);
}
exports.getTestImportErrorMessages = getTestImportErrorMessages;
function checkTestImports({ currentPath, importPath }) {
  if (currentPath.isInternalTestFile()) {
    return checkTestFile();
  } else if (currentPath.isTestHelperFile()) {
    return checkTestHelper();
  }
  return null;
  function checkTestFile() {
    const isAllowed =
      importPath.isTestHelper() ||
      importPath.isSourceFileForTestPath(currentPath);
    if (!isAllowed) {
      return '__testImport__wrongImportFromTestFile';
    }
    return null;
  }
  function checkTestHelper() {
    if (importPath.isNotThirdParty()) {
      return '__testImport__wrongImportFromTestHelper';
    }
    return null;
  }
}
exports.checkTestImports = checkTestImports;
