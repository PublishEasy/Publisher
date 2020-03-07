/* eslint-disable */
module.exports = {
  create: function onlyParentImportFileYouAreTesting(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const isRelativeParentImport = importPath.startsWith('../');
        const importLength = importPath.split('/').length;
        const isInViolation =
          isRelativeParentImport &&
          (!isInTestDirectory(context) ||
            importLength != 2 ||
            !baseNamesEqual(importPath, context.getFilename()));
        if (isInViolation) {
          context.report({
            node,
            message:
              'You may only use parent relative imports when importing from __tests__ the file above you with the same basename. Path {{importPath}} violates this',
            data: { importPath },
          });
        }
      },
    };
  },
};

function isInTestDirectory(context) {
  return /__tests__\/[^\/]+$/.test(context.getFilename());
}

function baseNamesEqual(path1, path2) {
  const [basename1, basename2] = [path1, path2].map(getBasename);
  return basename1 === basename2;
}

function getBasename(path) {
  const [fileName] = path.split('/').slice(-1);
  const basename = fileName.split('.')[0];
  return basename;
}
