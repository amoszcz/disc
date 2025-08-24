import { describe, it, expect } from 'vitest';
import {
  clampDestination,
  findHitSquareId,
  createSnapshot,
  removeSquareById,
  initializeSquares,
  type MapSquare,
} from '../MapLogic.js';

describe('MapLogic helpers', () => {
  it('clampDestination clamps to bounds', () => {
    const g = 5;
    expect(clampDestination(-1, -2, g)).toEqual({ row: 0, col: 0 });
    expect(clampDestination(10, 10, g)).toEqual({ row: 4, col: 4 });
    expect(clampDestination(3, 1, g)).toEqual({ row: 3, col: 1 });
  });

  it('findHitSquareId returns matching id or null', () => {
    const squares: MapSquare[] = [
      { id: 'a', row: 0, col: 0 },
      { id: 'b', row: 2, col: 3 },
    ];
    expect(findHitSquareId(squares, 0, 0)).toBe('a');
    expect(findHitSquareId(squares, 2, 3)).toBe('b');
    expect(findHitSquareId(squares, 1, 1)).toBeNull();
  });

  it('createSnapshot returns deep-copied squares', () => {
    const squares: MapSquare[] = [{ id: 'x', row: 1, col: 1 }];
    const snap = createSnapshot({
      playerRow: 5,
      playerCol: 6,
      playerSelected: true,
      squares,
    });
    // Basic fields
    expect(snap.playerRow).toBe(5);
    expect(snap.playerCol).toBe(6);
    expect(snap.playerSelected).toBe(true);
    // Deep copy
    expect(snap.squares).not.toBe(squares);
    expect(snap.squares[0]).not.toBe(squares[0]);
    expect(snap.squares[0]).toEqual(squares[0]);
    // Mutating source should not affect snapshot
    squares[0].row = 9;
    expect(snap.squares[0].row).toBe(1);
  });

  it('removeSquareById removes correct square', () => {
    const squares: MapSquare[] = [
      { id: 'a', row: 0, col: 0 },
      { id: 'b', row: 2, col: 3 },
    ];
    const out = removeSquareById(squares, 'a');
    expect(out).toEqual([{ id: 'b', row: 2, col: 3 }]);
    // original remains intact
    expect(squares.length).toBe(2);
  });

  it('initializeSquares creates unique non-player positions using provided RNG', () => {
    // Deterministic RNG cycling through 0, 0.9, 0.5 etc.
    const seq = [0, 0.9, 0.5, 0.1, 0.3, 0.7, 0.2];
    let i = 0;
    const rng = () => {
      const v = seq[i % seq.length];
      i += 1;
      return v;
    };

    const res = initializeSquares({
      count: 3,
      gridSize: 10,
      playerRow: 0,
      playerCol: 0,
      rng,
    });

    expect(res).toHaveLength(3);
    // Ensure none on player's tile
    expect(res.some((s) => s.row === 0 && s.col === 0)).toBe(false);
    // Ensure unique row/col combos
    const keys = new Set(res.map((s) => `${s.row}:${s.col}`));
    expect(keys.size).toBe(3);
    // IDs are deterministic in our helper impl
    expect(res.map((s) => s.id)).toEqual(['sq-0', 'sq-1', 'sq-2']);
  });
});
