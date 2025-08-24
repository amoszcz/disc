export type Cell = { row: number; col: number };

export interface IPathFinder {
  // Returns a sequence of grid cells to traverse to reach destination.
  // The sequence should NOT include the starting cell; it may include only the destination for direct motion.
  computePath(params: {
    start: Cell;
    dest: Cell;
    gridSize: number;
    isTraversable?: (cell: Cell) => boolean; // optional hook for obstacles
  }): Cell[];
}

// Default path finder preserves previous behavior: move directly to destination
export class DirectPathFinder implements IPathFinder {
  computePath(params: { start: Cell; dest: Cell; gridSize: number }): Cell[] {
    return [params.dest];
  }
}
