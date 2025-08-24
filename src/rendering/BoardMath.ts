export interface BoardMathConfig {
  BOARD_COLS: number;
  BOARD_ROWS: number;
  CELL_SIZE: number;
}

export interface BoardLayout {
  cellWidth: number;
  cellHeight: number;
  boardOffsetX: number;
  boardOffsetY: number;
}

export function computeBoardLayout(
  config: BoardMathConfig,
  canvasWidth: number,
  canvasHeight: number,
): BoardLayout {
  const boardWidth = config.BOARD_COLS * config.CELL_SIZE;
  const boardHeight = config.BOARD_ROWS * config.CELL_SIZE;
  return {
    cellWidth: config.CELL_SIZE,
    cellHeight: config.CELL_SIZE,
    boardOffsetX: (canvasWidth - boardWidth) / 2,
    boardOffsetY: (canvasHeight - boardHeight) / 2,
  };
}
