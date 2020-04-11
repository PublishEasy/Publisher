'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const lodash_1 = require('lodash');
class PathParser {
  constructor(path) {
    this.parts = path.split('/');
  }
  fileName() {
    return this.parts[this.length() - 1];
  }
  fileNameBase() {
    return this.fileName().split('.')[0];
  }
  start() {
    return this.parts[0];
  }
  length() {
    return this.parts.length;
  }
  hasAncestor(expectedAncestor) {
    return this.parts.includes(expectedAncestor);
  }
  directAncestorsAre(expectedAncestors, ...rest) {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const actualAncestors = this.getXAncestors(expectedAncestors.length);
    return lodash_1.isEqual(expectedAncestors, actualAncestors);
  }
  allAncestorsAre(expectedAncestors, ...rest) {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const ancestorLength = this.length() - 1; // pathLength includes filename
    const expectedNumberAncestorsCorrect =
      ancestorLength === expectedAncestors.length;
    if (expectedNumberAncestorsCorrect) {
      return this.directAncestorsAre(expectedAncestors);
    }
    return false;
  }
  getXAncestors(numAncestors) {
    const lengthWithFilename = numAncestors + 1;
    const pathParts = this.getLastPartsOfPath(lengthWithFilename);
    const partsWithoutFilename = pathParts.slice(0, -1);
    return partsWithoutFilename;
  }
  getLastPartsOfPath(numPartsOfPath) {
    return this.parts.slice(-1 * numPartsOfPath);
  }
}
exports.PathParser = PathParser;
function diverseArgumentsToArray(expectedParents, rest) {
  const allExpectedParents = [];
  if (typeof expectedParents === 'string')
    allExpectedParents.push(expectedParents);
  else {
    allExpectedParents.push(...expectedParents);
  }
  allExpectedParents.push(...rest);
  return allExpectedParents;
}
