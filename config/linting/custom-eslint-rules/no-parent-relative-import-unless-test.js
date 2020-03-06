/* eslint-disable */
module.exports = {
  create: function noParentRelativeImportUnlessTest(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const isRelativeParentImport = importPath.startsWith('../');
        const importLength = importPath.split('/').length;
        const isInViolation =
          isRelativeParentImport &&
          (!isInTestDirectory(context) || importLength > 2);
        if (isInViolation) {
          context.report({
            node,
            message:
              'Only relative parent imports allowed are from __tests__ directories importing one level up. Path {{importPath}} violates this',
            data: { importPath },
          });
        }
      },
    };
  },
};

function isInTestDirectory(context) {
  return context => /__tests__\/[^\/]+/.test(context.getFilename());
}
