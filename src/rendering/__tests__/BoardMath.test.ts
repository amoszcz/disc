import { describe, it, expect } from 'vitest';
import { computeBoardLayout } from '../BoardMath.js';

describe('BoardMath.computeBoardLayout', () => {
  it('centers board within canvas and sets cell sizes from config', () => {
    const config = { BOARD_COLS: 10, BOARD_ROWS: 8, CELL_SIZE: 40 };
    const canvasWidth = 600;
    const canvasHeight = 500;
    const layout = computeBoardLayout(config as any, canvasWidth, canvasHeight);
    expect(layout.cellWidth).toBe(40);
    expect(layout.cellHeight).toBe(40);
    // board size: 400x320, offsets should center
    expect(layout.boardOffsetX).toBe((600 - 400) / 2);
    expect(layout.boardOffsetY).toBe((500 - 320) / 2);
  });
});
