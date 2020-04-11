import { PathParser } from './path-parser';

export class Path {
  protected names = {
    testDirectory: '__tests__',
    testHelperDirectory: 'helpers',
    dependenciesFile: 'dependencies.ts',
    typesFile: 'types.ts',
    internalDirectory: 'internal',
    rootDirectory: 'src',
  };
  protected parser: PathParser;

  constructor(path: string) {
    this.parser = new PathParser(path);
  }

  isRelative(): boolean {
    return this.goesThroughCurrent() || this.goesThroughParent();
  }

  isAbsolute(): boolean {
    return !this.isRelative();
  }

  goesThroughParent(): boolean {
    return this.parser.start() === '..';
  }

  goesThroughCurrent(): boolean {
    return this.parser.start() === '.';
  }

  underInternal(): boolean {
    return this.parser.hasAncestor(this.names.internalDirectory);
  }

  inInternal(): boolean {
    return this.parser.directAncestorsAre(this.names.internalDirectory);
  }

  isExternal(): boolean {
    return !this.underInternal();
  }
}

export class FilePath extends Path {
  inSubdirectoryOfInternal(): boolean {
    return (
      this.underInternal() &&
      !this.parser.directAncestorsAre(this.names.internalDirectory)
    );
  }

  isIndexFile(): boolean {
    return this.parser.fileName() === 'index.ts';
  }

  isDependenciesFile(): boolean {
    return this.parser.fileName() === this.names.dependenciesFile;
  }

  inTestDirectory(): boolean {
    return this.parser.hasAncestor(this.names.testDirectory);
  }

  isTestFile(): boolean {
    return this.isInTestDirectoryUnder() && this.hasTestExtension();
  }

  isInternalTestFile(): boolean {
    return (
      this.isInTestDirectoryUnder(this.names.internalDirectory) &&
      this.hasTestExtension()
    );
  }

  isTestHelperFile(): boolean {
    const ancestorsAreCorrect = this.parser.directAncestorsAre([
      this.names.testDirectory,
      this.names.testHelperDirectory,
    ]);
    return ancestorsAreCorrect;
  }

  baseEquals(aBaseName: string): boolean {
    return this.parser.fileNameBase() === aBaseName;
  }

  private isInTestDirectoryUnder(grandparent?: string): boolean {
    let ancestors = [this.names.testDirectory];
    if (grandparent) ancestors = [grandparent].concat(ancestors);
    return this.parser.directAncestorsAre(ancestors);
  }

  private hasTestExtension(): boolean {
    return this.parser.fileName().endsWith('.test.ts');
  }
}

export class ImportPath extends Path {
  inParent(): boolean {
    return this.parser.allAncestorsAre('..');
  }

  isChild(): boolean {
    const expectedLength = 3; // ['.', 'sibling', 'child'].length
    return (
      this.parser.start() === '.' && this.parser.length() === expectedLength
    );
  }

  isNotRelativeSibling(): boolean {
    const isLocalRelative = this.parser.allAncestorsAre('.');
    return !isLocalRelative;
  }

  isNotAbsoluteByRoot(): boolean {
    const isAbsoluteByRoot = this.parser.start() === this.names.rootDirectory;
    return !isAbsoluteByRoot;
  }

  isNotThirdParty(): boolean {
    const isThirdParty = this.isAbsolute() && this.isNotAbsoluteByRoot();
    return !isThirdParty;
  }

  isSourceFileForTestPath(filePath: FilePath): boolean {
    const namesMatch = filePath.baseEquals(this.parser.fileNameBase());
    return this.inParent() && namesMatch;
  }

  isTestHelper(): boolean {
    return this.parser.allAncestorsAre('.', this.names.testHelperDirectory);
  }

  isParentTypesFile(): boolean {
    return (
      this.parser.allAncestorsAre('..') &&
      this.isImportingThisFilename(this.names.typesFile)
    );
  }

  isGrandParent(): boolean {
    return this.parser.allAncestorsAre('..', '..');
  }

  isFromReact(): boolean {
    return (
      this.parser.allAncestorsAre([]) && this.parser.fileName() === 'react'
    );
  }

  private isImportingThisFilename(filename: string): boolean {
    const matchesExactly = this.parser.fileName() === filename;
    const matchesWithImplicitExtension =
      this.parser.fileName() === filename.replace(/\.tsx?$/, '');
    return matchesExactly || matchesWithImplicitExtension;
  }
}
