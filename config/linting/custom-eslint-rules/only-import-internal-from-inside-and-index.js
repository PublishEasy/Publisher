/* eslint-env commonjs */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
module.exports = {
  create: function onlyImportInternalFromInsideAndIndex(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const filePath = context.getFilename();

        const violationIfAny = new ViolationFinder({
          filePath,
          importPath,
        }).getViolationIfAny();

        if (violationIfAny) {
          context.report({
            node,
            ...violationIfAny,
          });
        }
      },
    };
  },
};

class ViolationFinder {
  constructor({ filePath, importPath }) {
    this.filePath = filePath;
    this.importPath = importPath;
  }

  getViolationIfAny() {
    const violations = [];
    violations.push(this.getAnySubdirectoryOfInternalViolation());
    violations.push(this.getAnyImportFromInternalViolation());
    violations.push(this.getAnyImportInternalFromExternalViolation());
    const violationIfAny = violations.find(x => x !== undefined);
    return violationIfAny;
  }

  getAnySubdirectoryOfInternalViolation() {
    const isInSubdirectoryOfInternal =
      this.sourceIsInInternal() && !this.sourceIsDirectlyUnderInternal();
    const isInViolation =
      isInSubdirectoryOfInternal && !this.isTestFileForDirectory();
    if (isInViolation) {
      return {
        message:
          'File {{filePath}} is in a subdirectory of an internal directory which is not allowed',
        data: { filePath: this.filePath },
      };
    }
  }

  isTestFileForDirectory() {
    const [parentDirectory, directory, filename] = this.filePath
      .split('/')
      .slice(-3);
    const [preExtension] = filename.split('.').slice(-2);
    const isTestFileForDirectory =
      parentDirectory === 'internal' &&
      directory === '__tests__' &&
      preExtension === 'test';
    return isTestFileForDirectory;
  }

  sourceIsDirectlyUnderInternal() {
    const lastTwoPartsOfPath = this.filePath.split('/').slice(-2);
    const parentIsInternal = lastTwoPartsOfPath[0] === 'internal';
    return parentIsInternal;
  }

  getAnyImportFromInternalViolation() {
    if (this.sourceIsInInternal()) {
      let violation = undefined;
      if (this.isInternalDependenciesFile()) {
        violation = this.getViolationIfIsAbsoluteImport();
      } else {
        violation = this.getViolationIfNotImportingInternalRelatively();
      }
      return violation;
    }
  }

  isInternalDependenciesFile() {
    return this.filePath.endsWith('/internal/dependencies.ts');
  }

  getViolationIfIsAbsoluteImport() {
    const isRelativeImport =
      this.importPath.startsWith('./') || this.importPath.startsWith('..');
    if (isRelativeImport) {
      return {
        message:
          'The file {{filePath}} is importing {{importPath}} which is a relative import. Only absolute imports are allowed from this file',
        data: { filePath: this.filePath, importPath: this.importPath },
      };
    }
  }

  getViolationIfNotImportingInternalRelatively() {
    const isLocalRelativeImport = /\.\/[^/]+$/.test(this.importPath);
    if (!isLocalRelativeImport) {
      return {
        message:
          'File {{filePath}} is importing {{importPath}} from within internal directory where it is only allowed to relatively import other files in that internal directory',
        data: { filePath: this.filePath, importPath: this.importPath },
      };
    }
  }

  getAnyImportInternalFromExternalViolation() {
    const isInViolation =
      this.isImportingFromInternalDirectory() &&
      !this.sourceIsInInternal() &&
      !this.isIndexFileImportingOwnInternal();
    if (isInViolation) {
      return {
        message:
          'File {{filePath}} is importing {{importPath}} which is in an internal directory. Only direct parent index files are allowed to do this',
        data: { filePath: this.filePath, importPath: this.importPath },
      };
    }
  }

  isIndexFileImportingOwnInternal() {
    return this.isIndexFile() && this.isImportingDirectInternalChild();
  }

  isIndexFile() {
    return this.filePath.endsWith('/index.ts');
  }

  isImportingDirectInternalChild() {
    const directImportInternalPattern = new RegExp(
      String.raw`^\./internal/[^/]+$`,
    );
    return directImportInternalPattern.test(this.importPath);
  }

  sourceIsInInternal() {
    return this.fileIsInInternalDirectory(this.filePath);
  }

  isImportingFromInternalDirectory() {
    return this.fileIsInInternalDirectory(this.importPath);
  }
  fileIsInInternalDirectory(filePath) {
    return /\/internal\//.test(filePath);
  }
}
