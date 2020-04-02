const PathParser = require('./path-parser');

class Path {
  constructor(path) {
    this.__names = {
      testDirectory: '__tests__',
      testHelperDirectory: 'helpers',
      dependenciesFile: 'dependencies.ts',
      internalDirectory: 'internal',
      rootDirectory: 'src',
    };
    this.__parser = new PathParser(path);
  }

  isRelative() {
    return this.goesThroughCurrent() || this.goesThroughParent();
  }

  isAbsolute() {
    return !this.isRelative();
  }

  goesThroughParent() {
    return this.__parser.start() === '..';
  }

  goesThroughCurrent() {
    return this.__parser.start() === '.';
  }

  underInternal() {
    return this.__parser.hasAncestor(this.__names.internalDirectory);
  }

  inInternal() {
    return this.__parser.directAncestorsAre(this.__names.internalDirectory);
  }

  isExternal() {
    return !this.underInternal();
  }
}

class FilePath extends Path {
  inSubdirectoryOfInternal() {
    return (
      this.underInternal() &&
      !this.__parser.directAncestorsAre(this.__names.internalDirectory)
    );
  }

  isIndexFile() {
    return this.__parser.fileName() === 'index.ts';
  }

  isDependenciesFile() {
    return this.__parser.fileName() === this.__names.dependenciesFile;
  }

  isTestFile() {
    return this.__isInTestDirectoryUnder('') && this.__hasTestExtension();
  }

  isInternalTestFile() {
    return (
      this.__isInTestDirectoryUnder(this.__names.internalDirectory) &&
      this.__hasTestExtension()
    );
  }

  isTestHelperFile() {
    const ancestorsAreCorrect = this.__parser.directAncestorsAre([
      this.__names.testDirectory,
      this.__names.testHelperDirectory,
    ]);
    return ancestorsAreCorrect;
  }

  baseEquals(aBaseName) {
    return this.__parser.fileNameBase() === aBaseName;
  }

  __isInTestDirectoryUnder(grandparent) {
    let ancestors = [this.__names.testDirectory];
    if (grandparent) ancestors = [grandparent].concat(ancestors);
    return this.__parser.directAncestorsAre(ancestors);
  }

  __hasTestExtension() {
    return this.__parser.fileName().endsWith('.test.ts');
  }
}

class ImportPath extends Path {
  inParent() {
    return this.__parser.allAncestorsAre('..');
  }

  isChild() {
    const expectedLength = 3; // ['.', 'sibling', 'child'].length
    return (
      this.__parser.start() === '.' && this.__parser.length() === expectedLength
    );
  }

  isNotRelativeSibling() {
    const isLocalRelative = this.__parser.allAncestorsAre('.');
    return !isLocalRelative;
  }

  isNotAbsoluteByRoot() {
    const isAbsoluteByRoot =
      this.__parser.start() === this.__names.rootDirectory;
    return !isAbsoluteByRoot;
  }

  isNotThirdParty() {
    const isThirdParty = this.isAbsolute() && this.isNotAbsoluteByRoot();
    return !isThirdParty;
  }

  isSourceFileForTestPath(filePathObject) {
    const namesMatch = filePathObject.baseEquals(this.__parser.fileNameBase());
    return this.inParent() && namesMatch;
  }

  isTestHelper() {
    return this.__parser.allAncestorsAre('.', this.__names.testHelperDirectory);
  }

  isFromReact() {
    return (
      this.__parser.allAncestorsAre([]) && this.__parser.fileName() === 'react'
    );
  }
}

module.exports = {
  FilePath,
  ImportPath,
};
