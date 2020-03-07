/* eslint-disable */
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
    violations.push(this.getAnyInternalSubdirectoryViolation());
    violations.push(this.getAnyImportViolationFromInternal());
    violations.push(this.getAnyImportInternalFromExternalViolations());
    const violationIfAny = violations.find(x => x !== undefined);
    return violationIfAny;
  }

  getAnyInternalSubdirectoryViolation() {
    const isInSubdirectoryOfInternal =
      this.sourceIsInInternalDirectory() && !this.isDirectlyUnderInternal();
    if (isInSubdirectoryOfInternal) {
      return {
        message:
          'File {{filePath}} is in a subdirectory of an internal directory which is not allowed',
        data: { filePath: this.filePath },
      };
    }
  }

  isDirectlyUnderInternal() {
    const lastTwoPartsOfPath = this.filePath.split('/').slice(-2);
    const parentIsInternal = lastTwoPartsOfPath[0] === 'internal';
    return parentIsInternal;
  }

  getAnyImportViolationFromInternal() {
    let violation = undefined;
    if (this.onlyAbsoluteImportsAllowed(this.filePath)) {
      violation = this.getAnyAbsoluteImportViolation();
    } else if (this.sourceIsInInternalDirectory()) {
      violation = this.getAnyExternalImportViolations(
        this.importPath,
        this.filePath,
      );
    }

    return violation;
  }

  onlyAbsoluteImportsAllowed() {
    return this.filePath.endsWith('/internal/dependencies.ts');
  }

  getAnyAbsoluteImportViolation() {
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

  getAnyExternalImportViolations() {
    const isLocalRelativeImport = /\.\/[^\/]+$/.test(this.importPath);
    if (!isLocalRelativeImport) {
      return {
        message:
          'File {{filePath}} is importing {{importPath}} from within internal directory where it is only allowed to relatively import other files in that internal directory',
        data: { filePath: this.filePath, importPath: this.importPath },
      };
    }
  }

  getAnyImportInternalFromExternalViolations() {
    const isInViolation =
      this.importIsInInternalDirectory() &&
      !this.sourceIsInInternalDirectory() &&
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
    const isIndexFile = this.filePath.endsWith('/index.ts');
    const isImportingDirectInternalChild = /^\.\/internal\/[^\/]+$/.test(
      this.importPath,
    );
    return isIndexFile && isImportingDirectInternalChild;
  }

  sourceIsInInternalDirectory() {
    return this.fileIsInInternalDirectory(this.filePath);
  }

  importIsInInternalDirectory() {
    return this.fileIsInInternalDirectory(this.importPath);
  }
  fileIsInInternalDirectory(filePath) {
    return /\/internal\//.test(filePath);
  }
}
