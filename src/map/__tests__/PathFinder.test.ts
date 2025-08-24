import { describe, it, expect } from 'vitest';
import { DirectPathFinder } from '../PathFinder.js';

describe('DirectPathFinder', () => {
  it('returns only destination cell', () => {
    const pf = new DirectPathFinder();
    const path = pf.computePath({ start: { row: 1, col: 2 }, dest: { row: 5, col: 6 }, gridSize: 10 });
    expect(path).toEqual([{ row: 5, col: 6 }]);
  });
});
