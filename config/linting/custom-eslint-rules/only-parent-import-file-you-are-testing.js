const { FilePath, ImportPath } = require('./paths');

module.exports = {
  meta: {
    messages: {
      invalidParentImport:
        'You may only use parent relative imports when importing the file you are testing from within a test',
    },
    type: 'problem',
    schema: [],
  },
  create: function onlyParentImportFileYouAreTesting(context) {
    return {
      ImportDeclaration(node) {
        const importPathString = node.source.value;
        const currentPathString = context.getFilename();
        const violation = getAnyViolation({
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
function getAnyViolation({ currentPathString, importPathString }) {
  const currentPath = new FilePath(currentPathString);
  const importPath = new ImportPath(importPathString);
  if (importPath.goesThroughParent()) {
    const isAllowed =
      currentPath.isTestFile() &&
      importPath.isSourceFileForTestPath(currentPath);
    if (!isAllowed) {
      return 'invalidParentImport';
    }
  }
}
