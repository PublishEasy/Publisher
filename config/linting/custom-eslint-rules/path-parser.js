const { isEqual: areDeepEqual } = require('lodash');

class PathParser {
  constructor(path) {
    this.path = path;
  }

  fileName() {
    return this.__getLastPartsOfPath(1)[0];
  }

  fileBase() {
    return this.fileName().split('.')[0];
  }

  directAncestorsAre(expectedAncestors, ...rest) {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const actualAncestors = this.getXAncestors(expectedAncestors.length);
    return areDeepEqual(expectedAncestors, actualAncestors);
  }

  allAncestorsAre(expectedAncestors, ...rest) {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const pathLength = this.__pathLength();
    const ancestorLength = pathLength - 1; // pathLength includes filename
    const expectedNumberAncestorsCorrect =
      ancestorLength === expectedAncestors.length;
    if (expectedNumberAncestorsCorrect) {
      return this.directAncestorsAre(expectedAncestors);
    }
    return false;
  }

  getXAncestors(numAncestors) {
    const lengthWithFilename = numAncestors + 1;
    const pathParts = this.__getLastPartsOfPath(lengthWithFilename);
    const partsWithoutFilename = pathParts.slice(0, -1);
    return partsWithoutFilename;
  }

  hasAncestor(expectedAncestor) {
    return this.path.includes(`/${expectedAncestor}`);
  }

  isExternal() {
    return !this.hasAncestor(PathParser.names.internalDirectory);
  }

  isIndexFile() {
    return this.fileName() === 'index.ts';
  }

  isRelative() {
    return this.path.startsWith('./') || this.isParentRelative();
  }

  isParentRelative() {
    return this.path.startsWith('../');
  }

  isAbsolute() {
    return !this.isRelative();
  }

  isSrcAbsoluteImport() {
    return this.path.startsWith(PathParser.names.srcDirectory);
  }

  isThirdPartyImport() {
    return this.isAbsolute() && !this.isSrcAbsoluteImport();
  }

  hasTestExtension() {
    return this.fileName().endsWith('.test.ts');
  }

  __getLastPartsOfPath(numPartsOfPath) {
    return this.path.split('/').slice(-1 * numPartsOfPath);
  }

  __pathLength() {
    return this.path.split('/').length;
  }
}

PathParser.names = {
  testDirectory: '__tests__',
  testHelperDirectory: 'helpers',
  dependenciesFile: 'dependencies.ts',
  internalDirectory: 'internal',
  srcDirectory: 'src',
};

function diverseArgumentsToArray(expectedParents, rest) {
  if (typeof expectedParents === 'string') expectedParents = [expectedParents];
  if (rest) expectedParents = expectedParents.concat(rest);
  return expectedParents;
}

module.exports = PathParser;
