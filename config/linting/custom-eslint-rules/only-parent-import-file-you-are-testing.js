const PathParser = require('./path-parser');

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
        const importPath = node.source.value;
        const filePath = context.getFilename();
        const violation = getAnyViolation({ filePath, importPath });
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
function getAnyViolation({ filePath, importPath }) {
  const currentPathParser = new PathParser(filePath);
  const importPathParser = new PathParser(importPath);
  if (importPathParser.isParentRelative()) {
    const isAllowed =
      isTestFile(currentPathParser) && isImportingFileWeAreTesting();
    const isInViolation = !isAllowed;
    if (isInViolation) {
      return 'invalidParentImport';
    }
  }
  function isTestFile() {
    return (
      currentPathParser.hasTestExtension() &&
      currentPathParser.directAncestorsAre(PathParser.names.testDirectory)
    );
  }
  function isImportingFileWeAreTesting() {
    const fileNamesMatch =
      importPathParser.fileBase() === currentPathParser.fileBase();
    return importPathParser.allAncestorsAre('..') && fileNamesMatch;
  }
}
