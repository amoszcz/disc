export type MapSquare = { id: string; row: number; col: number };

export interface IMapLoader {
  load(params: {
    gridSize: number;
    playerRow: number;
    playerCol: number;
    count?: number; // number of collectibles or objects to place (for default)
  }): Promise<{ squares: MapSquare[] }> | { squares: MapSquare[] };
}

// Default loader reproduces previous random square generation behavior
export class DefaultRandomMapLoader implements IMapLoader {
  constructor(private readonly rng: () => number = Math.random) {}

  load(params: {
    gridSize: number;
    playerRow: number;
    playerCol: number;
    count?: number;
  }): { squares: MapSquare[] } {
    const { gridSize, playerRow, playerCol, count = 2 } = params;
    const squares: MapSquare[] = [];
    const used = new Set<string>();
    const key = (r: number, c: number) => `${r}:${c}`;
    used.add(key(playerRow, playerCol));
    while (squares.length < count) {
      const r = Math.floor(this.rng() * gridSize);
      const c = Math.floor(this.rng() * gridSize);
      const k = key(r, c);
      if (used.has(k)) continue;
      used.add(k);
      squares.push({ id: `sq-${Date.now()}-${squares.length}-${this.rng()}`, row: r, col: c });
    }
    return { squares };
  }
}
