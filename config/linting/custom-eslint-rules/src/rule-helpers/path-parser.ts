import { isEqual as areDeepEqual } from 'lodash';

export class PathParser {
  private parts: string[];

  constructor(path: string) {
    this.parts = path.split('/');
  }

  fileName(): string {
    return this.parts[this.length() - 1];
  }

  fileNameBase(): string {
    return this.fileName().split('.')[0];
  }

  start(): string {
    return this.parts[0];
  }

  length(): number {
    return this.parts.length;
  }

  hasAncestor(expectedAncestor: string): boolean {
    return this.parts.includes(expectedAncestor);
  }

  directAncestorsAre(
    expectedAncestors: string | string[],
    ...rest: string[]
  ): boolean {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const actualAncestors = this.getXAncestors(expectedAncestors.length);
    return areDeepEqual(expectedAncestors, actualAncestors);
  }

  allAncestorsAre(
    expectedAncestors: string | string[],
    ...rest: string[]
  ): boolean {
    expectedAncestors = diverseArgumentsToArray(expectedAncestors, rest);
    const ancestorLength = this.length() - 1; // pathLength includes filename
    const expectedNumberAncestorsCorrect =
      ancestorLength === expectedAncestors.length;
    if (expectedNumberAncestorsCorrect) {
      return this.directAncestorsAre(expectedAncestors);
    }
    return false;
  }

  private getXAncestors(numAncestors: number): string[] {
    const lengthWithFilename = numAncestors + 1;
    const pathParts = this.getLastPartsOfPath(lengthWithFilename);
    const partsWithoutFilename = pathParts.slice(0, -1);
    return partsWithoutFilename;
  }

  getLastPartsOfPath(numPartsOfPath: number): string[] {
    return this.parts.slice(-1 * numPartsOfPath);
  }
}

function diverseArgumentsToArray(
  expectedParents: string | string[],
  rest: string[],
): string[] {
  const allExpectedParents: string[] = [];
  if (typeof expectedParents === 'string')
    allExpectedParents.push(expectedParents);
  else {
    allExpectedParents.push(...expectedParents);
  }
  allExpectedParents.push(...rest);
  return allExpectedParents;
}
