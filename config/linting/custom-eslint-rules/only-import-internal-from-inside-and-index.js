/* eslint-disable */
module.exports = {
  create: function onlyParentImportFileYouAreTesting(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const isUnderInternal = /\/internal\//.test(context.getFilename());
        checkIfIsSubdirectoryOfInternal(context, isUnderInternal, node);
        checkInvalidImportsWithinInternal(
          importPath,
          isUnderInternal,
          context,
          node,
        );
        checkImportingInternalFromOutside(
          importPath,
          context,
          isUnderInternal,
          node,
        );
      },
    };
  },
};

function checkIfIsSubdirectoryOfInternal(context, isUnderInternal, node) {
  const isDirectlyUnderInternal =
    context
      .getFilename()
      .split('/')
      .slice(-2)[0] === 'internal';
  const isInSubdirectoryOfInternal =
    isUnderInternal && !isDirectlyUnderInternal;
  if (isInSubdirectoryOfInternal) {
    context.report({
      node,
      message:
        'File {{filename}} is in a subdirectory of an internal directory which is not allowed',
      data: { filename: context.getFilename() },
    });
  }
}

function checkInvalidImportsWithinInternal(
  importPath,
  isUnderInternal,
  context,
  node,
) {
  const isLocalRelativeImport = /\.\/[^\/]+$/.test(importPath);
  const isNotLocalImportFromWithinInternal =
    isUnderInternal && !isLocalRelativeImport;
  if (isNotLocalImportFromWithinInternal) {
    context.report({
      node,
      message:
        'File {{filename}} is importing {{importPath}} from within internal directory where it is only allowed to relatively import other files in that internal directory',
      data: { filename: context.getFilename(), importPath },
    });
  }
}

function checkImportingInternalFromOutside(
  importPath,
  context,
  isUnderInternal,
  node,
) {
  const isImportingInternal = /\/internal\//.test(importPath);
  const isIndexFileImportingRelevantInternal =
    context.getFilename().endsWith('/index.ts') &&
    /^\.\/internal\/[^\/]+$/.test(importPath);
  const importingInternalFromOutsideWithoutBeingIndex =
    !isUnderInternal &&
    isImportingInternal &&
    !isIndexFileImportingRelevantInternal;
  if (importingInternalFromOutsideWithoutBeingIndex) {
    context.report({
      node,
      message:
        'File {{filename}} is importing {{importPath}} which is in an internal directory. Only related index files are allowed to do this',
      data: { filename: context.getFilename(), importPath },
    });
  }
}
