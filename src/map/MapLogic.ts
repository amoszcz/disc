// Pure helpers for MapModule to enable testing without DOM/canvas

export type MapSquare = { id: string; row: number; col: number };
export type MapSnapshot = {
  playerRow: number;
  playerCol: number;
  playerSelected: boolean;
  squares: MapSquare[];
};

export function clampDestination(
  row: number,
  col: number,
  gridSize: number,
): { row: number; col: number } {
  return {
    row: Math.max(0, Math.min(gridSize - 1, row)),
    col: Math.max(0, Math.min(gridSize - 1, col)),
  };
}

export function findHitSquareId(
  squares: MapSquare[],
  row: number,
  col: number,
): string | null {
  const hit = squares.find((s) => s.row === row && s.col === col);
  return hit ? hit.id : null;
}

export function createSnapshot(args: {
  playerRow: number;
  playerCol: number;
  playerSelected: boolean;
  squares: MapSquare[];
}): MapSnapshot {
  const { playerRow, playerCol, playerSelected, squares } = args;
  return {
    playerRow,
    playerCol,
    playerSelected,
    // deep copy array elements to avoid external mutation in tests/consumers
    squares: squares.map((s) => ({ ...s })),
  };
}

export function removeSquareById(
  squares: MapSquare[],
  id: string,
): MapSquare[] {
  return squares.filter((s) => s.id !== id);
}

// RNG interface so tests can inject deterministic sources
export type RNG = () => number; // returns [0,1)

export function initializeSquares(params: {
  count: number;
  gridSize: number;
  playerRow: number;
  playerCol: number;
  rng?: RNG;
}): MapSquare[] {
  const { count, gridSize, playerRow, playerCol, rng } = params;
  const random = rng ?? Math.random;
  const squares: MapSquare[] = [];
  const used = new Set<string>();
  const key = (r: number, c: number) => `${r}:${c}`;
  used.add(key(playerRow, playerCol));

  while (squares.length < count) {
    const r = Math.floor(random() * gridSize);
    const c = Math.floor(random() * gridSize);
    const k = key(r, c);
    if (used.has(k)) continue;
    used.add(k);
    squares.push({ id: `sq-${squares.length}`, row: r, col: c });
  }
  return squares;
}
