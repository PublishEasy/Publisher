'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const path_parser_1 = require('./path-parser');
class Path {
  constructor(path) {
    this.names = {
      testDirectory: '__tests__',
      testHelperDirectory: 'helpers',
      dependenciesFile: 'dependencies.ts',
      typesFile: 'types.ts',
      internalDirectory: 'internal',
      rootDirectory: 'src',
    };
    this.parser = new path_parser_1.PathParser(path);
  }
  isRelative() {
    return this.goesThroughCurrent() || this.goesThroughParent();
  }
  isAbsolute() {
    return !this.isRelative();
  }
  goesThroughParent() {
    return this.parser.start() === '..';
  }
  goesThroughCurrent() {
    return this.parser.start() === '.';
  }
  underInternal() {
    return this.parser.hasAncestor(this.names.internalDirectory);
  }
  inInternal() {
    return this.parser.directAncestorsAre(this.names.internalDirectory);
  }
  isExternal() {
    return !this.underInternal();
  }
}
exports.Path = Path;
class FilePath extends Path {
  inSubdirectoryOfInternal() {
    return (
      this.underInternal() &&
      !this.parser.directAncestorsAre(this.names.internalDirectory)
    );
  }
  isIndexFile() {
    return this.parser.fileName() === 'index.ts';
  }
  isDependenciesFile() {
    return this.parser.fileName() === this.names.dependenciesFile;
  }
  inTestDirectory() {
    return this.parser.hasAncestor(this.names.testDirectory);
  }
  isTestFile() {
    return this.isInTestDirectoryUnder() && this.hasTestExtension();
  }
  isInternalTestFile() {
    return (
      this.isInTestDirectoryUnder(this.names.internalDirectory) &&
      this.hasTestExtension()
    );
  }
  isTestHelperFile() {
    const ancestorsAreCorrect = this.parser.directAncestorsAre([
      this.names.testDirectory,
      this.names.testHelperDirectory,
    ]);
    return ancestorsAreCorrect;
  }
  baseEquals(aBaseName) {
    return this.parser.fileNameBase() === aBaseName;
  }
  isInTestDirectoryUnder(grandparent) {
    let ancestors = [this.names.testDirectory];
    if (grandparent) ancestors = [grandparent].concat(ancestors);
    return this.parser.directAncestorsAre(ancestors);
  }
  hasTestExtension() {
    return this.parser.fileName().endsWith('.test.ts');
  }
}
exports.FilePath = FilePath;
class ImportPath extends Path {
  inParent() {
    return this.parser.allAncestorsAre('..');
  }
  isChild() {
    const expectedLength = 3; // ['.', 'sibling', 'child'].length
    return (
      this.parser.start() === '.' && this.parser.length() === expectedLength
    );
  }
  isNotRelativeSibling() {
    const isLocalRelative = this.parser.allAncestorsAre('.');
    return !isLocalRelative;
  }
  isNotAbsoluteByRoot() {
    const isAbsoluteByRoot = this.parser.start() === this.names.rootDirectory;
    return !isAbsoluteByRoot;
  }
  isNotThirdParty() {
    const isThirdParty = this.isAbsolute() && this.isNotAbsoluteByRoot();
    return !isThirdParty;
  }
  isSourceFileForTestPath(filePath) {
    const namesMatch = filePath.baseEquals(this.parser.fileNameBase());
    return this.inParent() && namesMatch;
  }
  isTestHelper() {
    return this.parser.allAncestorsAre('.', this.names.testHelperDirectory);
  }
  isParentTypesFile() {
    return (
      this.parser.allAncestorsAre('..') &&
      this.isImportingThisFilename(this.names.typesFile)
    );
  }
  isGrandParent() {
    return this.parser.allAncestorsAre('..', '..');
  }
  isFromReact() {
    return (
      this.parser.allAncestorsAre([]) && this.parser.fileName() === 'react'
    );
  }
  isImportingThisFilename(filename) {
    const matchesExactly = this.parser.fileName() === filename;
    const matchesWithImplicitExtension =
      this.parser.fileName() === filename.replace(/\.tsx?$/, '');
    return matchesExactly || matchesWithImplicitExtension;
  }
}
exports.ImportPath = ImportPath;
