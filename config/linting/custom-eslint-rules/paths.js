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

  isUnderInternal() {
    return this.__parser.hasAncestor(this.__names.internalDirectory);
  }

  isInInternal() {
    return this.__parser.directAncestorsAre(this.__names.internalDirectory);
  }

  isExternal() {
    return !this.isUnderInternal();
  }
}

class FilePath extends Path {
  inSubdirectoryOfInternal() {
    return (
      this.isUnderInternal() &&
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
  isDirectChildInternal() {
    return this.__parser.allAncestorsAre('.', this.__names.internalDirectory);
  }

  isNotLocalRelative() {
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

  isInParent() {
    return this.__parser.allAncestorsAre('..');
  }

  isSourceFileForTestPath(filePathObject) {
    const namesMatch = filePathObject.baseEquals(this.__parser.fileNameBase());
    return this.isInParent() && namesMatch;
  }

  isTestHelper() {
    return this.__parser.allAncestorsAre('.', this.__names.testHelperDirectory);
  }
}

module.exports = {
  FilePath,
  ImportPath,
};
