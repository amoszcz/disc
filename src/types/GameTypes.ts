/**
 * src/types/GameTypes.ts
 * Defines the core types and interfaces used throughout the game
 * Includes game state, unit properties, and various game-related enums and types
 */

export enum GameStatus {
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
}

export enum UnitType {
  ARCHER = "archer",
  MAGE = "mage",
  PRIEST = "priest",
  KNIGHT = "knight",
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
  attackStrategyId: string; // Add this field
  renderStrategyId: string; // Add this field
  receivedDamageFrom: Unit | null;
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

export interface GameConfig {
  BOARD_ROWS: number;
  BOARD_COLS: number;
  CELL_SIZE: number;
  UNIT_RADIUS: number;
  DEFAULT_ATT: number;
  DEFAULT_LIF: number;
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
  availableTargets: BoardPosition[];
}

export interface BoardPosition {
  row: number;
  col: number;
}

export interface AttackTarget {
  unit: Unit;
  row: number;
  col: number;
}

export interface AttackResult {
  success: boolean;
  attacker: Unit;
  targets: AttackTarget[];
  totalDamage: number;
  targetsKilled: number;
  healingDone: number;
  message: string;
}
