
export enum UnitType {
  ARCHER = 'archer',
  MAGE = 'mage',
  PRIEST = 'priest',
  KNIGHT = 'knight'  // New!
}

export interface Unit {
  team: 1 | 2;
  row: number;
  col: number;
  att: number;
  lif: number;
  maxLif: number;
  isAlive: boolean;
  isSelected: boolean;
  hasActed: boolean;
  type: UnitType;
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

export interface AttackTarget {
  unit: Unit;
  row: number;
  col: number;
}

export interface AttackResult {
  success: boolean;
  targets: AttackTarget[];
  totalDamage: number;
  targetsKilled: number;
  healingDone: number;
  message: string;
}

export interface BoardPosition {
  row: number;
  col: number;
}