import { __getRootFromDist } from '../paths';

describe('getRootFromDist', () => {
  it('correctly finds root directory when in subdirectory of dist', () => {
    expect(__getRootFromDist('/a/b/dist/c/d')).toBe('/a/b');
  });
  it('correctly finds root directory when direct child of dist', () => {
    expect(__getRootFromDist('/a/b/dist')).toBe('/a/b');
  });
});
