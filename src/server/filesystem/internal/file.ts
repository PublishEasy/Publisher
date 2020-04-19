import { nodeFsModule } from './dependencies';
import { Path } from './path';

export class File {
  private filePathString: string;
  private fileContents: string | null = null;

  constructor(filePath: Path) {
    this.filePathString = filePath.asAbsolutePathString();
  }

  async getContents(): Promise<string> {
    if (this.fileContents === null) {
      this.fileContents = await nodeFsModule.readFile(
        this.filePathString,
        'utf8',
      );
    }
    return this.fileContents;
  }
}
