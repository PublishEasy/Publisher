import { Path } from '../path';

class PathInternalsTester extends Path {
  static ancestorFinderTester(args: {
    ancestorName: string;
    absoluteSourcePath: string;
  }): string {
    return PathInternalsTester.findFirstAncestorNamed(args);
  }
}
describe('Path', () => {
  describe('findFirstAncestorNamed', () => {
    it('correctly finds root directory when in subdirectory of dist', () => {
      expect(
        PathInternalsTester.ancestorFinderTester({
          absoluteSourcePath: '/a/b/dist/c/d',
          ancestorName: 'dist',
        }),
      ).toBe('/a/b/dist');
    });
    it('correctly finds root directory when direct child of dist', () => {
      expect(
        PathInternalsTester.ancestorFinderTester({
          absoluteSourcePath: '/a/b/dist',
          ancestorName: 'dist',
        }),
      ).toBe('/a/b/dist');
    });
  });
});
