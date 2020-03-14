const { isEqual: areDeepEqual } = require('lodash');

class PathParser {
  constructor(path) {
    if (!path) throw new Error('PathParser needs a path');
    this.__parts = path.split('/');
  }

  fileName() {
    return this.__parts[this.__parts.length - 1];
  }

  fileNameBase() {
    return this.fileName().split('.')[0];
  }

  start() {
    return this.__parts[0];
  }

  hasAncestor(expectedAncestor) {
    return this.__parts.includes(expectedAncestor);
  }

  directAncestorsAre(expectedAncestors, ...rest) {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const actualAncestors = this.__getXAncestors(expectedAncestors.length);
    return areDeepEqual(expectedAncestors, actualAncestors);
  }

  allAncestorsAre(expectedAncestors, ...rest) {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const ancestorLength = this.__parts.length - 1; // pathLength includes filename
    const expectedNumberAncestorsCorrect =
      ancestorLength === expectedAncestors.length;
    if (expectedNumberAncestorsCorrect) {
      return this.directAncestorsAre(expectedAncestors);
    }
    return false;
  }

  __getXAncestors(numAncestors) {
    const lengthWithFilename = numAncestors + 1;
    const pathParts = this.__getLastPartsOfPath(lengthWithFilename);
    const partsWithoutFilename = pathParts.slice(0, -1);
    return partsWithoutFilename;
  }

  __getLastPartsOfPath(numPartsOfPath) {
    return this.__parts.slice(-1 * numPartsOfPath);
  }
}

function diverseArgumentsToArray(expectedParents, rest) {
  if (typeof expectedParents === 'string') expectedParents = [expectedParents];
  if (rest) expectedParents = expectedParents.concat(rest);
  return expectedParents;
}

module.exports = PathParser;
