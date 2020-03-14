import path from 'path';

export function getRuleNameFromFileName(filePath: string): string {
  const filename = path.basename(filePath);
  return filename.split('.')[0];
}
