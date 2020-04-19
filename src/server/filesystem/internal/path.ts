import { nodePathModule } from './dependencies';

const BUILD_DIR_NAME = 'dist';
const SOURCE_DIR_NAME = 'src';

export class Path {
  static projectPaths = {
    rootDirectory: new Path(Path.getRootDirectoryPath()),
  };

  private static getRootDirectoryPath(): string {
    const sourceDirectoryPath = this.findFirstAncestorNamed({
      ancestorName: SOURCE_DIR_NAME,
      absoluteSourcePath: __filename,
    });
    if (sourceDirectoryPath.includes(`/${BUILD_DIR_NAME}/`)) {
      // We operate under the assumption that the source directory is right under the build directory which is right under the root
      return nodePathModule.join(sourceDirectoryPath, '..', '..');
    }
    // It's not in the build directory. So then source should be right under the root
    return nodePathModule.join(sourceDirectoryPath, '..');
  }

  // Protected for allowing testing this rather involved logic
  protected static findFirstAncestorNamed(args: {
    ancestorName: string;
    absoluteSourcePath: string;
  }): string {
    const pathParts = args.absoluteSourcePath
      .split('/')
      .filter((x) => x.length > 0);
    const foundAncestorPath = pathParts.reduce((currentPath, nextPart) => {
      if (currentPath.endsWith(`/${args.ancestorName}`)) return currentPath;
      return `${currentPath}/${nextPart}`;
    }, '');
    return foundAncestorPath;
  }

  private absolutePath: string;

  constructor(absolutePath: string) {
    if (!nodePathModule.isAbsolute(absolutePath))
      throw new Error(
        `Path constructor argument wasn't absolute. This was the argument: ${absolutePath}`,
      );
    this.absolutePath = absolutePath;
  }

  asAbsolutePathString(): string {
    return this.absolutePath;
  }

  getChild(child: string): Path {
    const newAbsolutePath = nodePathModule.resolve(this.absolutePath, child);
    return new Path(newAbsolutePath);
  }
}
