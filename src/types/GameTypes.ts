export interface Unit {
  team: 1 | 2;
  row: number;
  col: number;
  att: number;  // Attack damage
  lif: number;  // Life points (current health)
  maxLif: number; // Maximum life points
  isAlive: boolean;
  isSelected: boolean;
  hasActed: boolean; // New property to track if unit has acted this turn
}

export interface GameState {
  board: (Unit | null)[][];
  cellWidth: number;
  cellHeight: number;
  boardOffsetX: number;
  boardOffsetY: number;
  gameStatus: GameStatus;
  currentTurn: 1 | 2;
  selectedUnit: Unit | null;
}

export enum GameStatus {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over'
}

export interface GameConfig {
  BOARD_ROWS: number;
  BOARD_COLS: number;
  CELL_SIZE: number;
  UNIT_RADIUS: number;
  DEFAULT_ATT: number;
  DEFAULT_LIF: number;
}

export interface TeamCount {
  team1: number;
  team2: number;
}

export interface Button {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  isHovered: boolean;
  onClick: () => void;
}

export interface AttackResult {
  success: boolean;
  damage: number;
  targetKilled: boolean;
  message: string;
}