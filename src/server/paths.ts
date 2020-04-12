import path from 'path';

export const ROOT_DIRECTORY = __filename.includes('/dist/')
  ? __getRootFromDist(__dirname)
  : path.join(__dirname, '..', '..');

export function __getRootFromDist(dirPath: string): string {
  const parts = dirPath.split('/').filter((x) => x.length > 0);
  const distDirPath = parts.reduce((prev, nextPart) => {
    if (prev.endsWith('/dist')) return prev;
    return `${prev}/${nextPart}`;
  }, '');
  return path.join(distDirPath, '..');
}
