
import type { GameState, GameConfig } from '../types/GameTypes.js';
import  { GameStatus } from '../types/GameTypes.js';
import { BoardManager } from './Board.js';

export class GameStateManager {
  private config: GameConfig;
  private boardManager: BoardManager;
  public gameState: GameState;

  constructor(config: GameConfig) {
    this.config = config;
    this.boardManager = new BoardManager(config);

    this.gameState = {
      board: this.boardManager.initializeBoard(),
      cellWidth: config.CELL_SIZE,
      cellHeight: config.CELL_SIZE,
      boardOffsetX: 0,
      boardOffsetY: 0,
      gameStatus: GameStatus.MENU,
      currentTurn: 1,
      selectedUnit: null
    };
  }

  public calculateBoardLayout(canvasWidth: number, canvasHeight: number): void {
    const boardWidth = this.config.BOARD_COLS * this.config.CELL_SIZE;
    const boardHeight = this.config.BOARD_ROWS * this.config.CELL_SIZE;

    this.gameState.cellWidth = this.config.CELL_SIZE;
    this.gameState.cellHeight = this.config.CELL_SIZE;
    this.gameState.boardOffsetX = (canvasWidth - boardWidth) / 2;
    this.gameState.boardOffsetY = (canvasHeight - boardHeight) / 2;
  }

  public startGame(): void {
    this.gameState.gameStatus = GameStatus.PLAYING;
    this.gameState.currentTurn = 1;
    this.gameState.selectedUnit = null;
    // Reinitialize the board for a fresh game
    this.gameState.board = this.boardManager.initializeBoard();
  }

  public selectUnit(row: number, col: number): boolean {
    const unit = this.gameState.board[row][col];
    const unitManager = this.boardManager.getUnitManager();

    if (!unit || !unitManager.canSelectUnit(unit, this.gameState.currentTurn)) {
      return false;
    }

    // Deselect previously selected unit
    this.deselectAllUnits();

    // Select the new unit
    unitManager.selectUnit(unit);
    this.gameState.selectedUnit = unit;

    return true;
  }

  public deselectAllUnits(): void {
    const unitManager = this.boardManager.getUnitManager();

    for (let row = 0; row < this.config.BOARD_ROWS; row++) {
      for (let col = 0; col < this.config.BOARD_COLS; col++) {
        const unit = this.gameState.board[row][col];
        if (unit) {
          unitManager.deselectUnit(unit);
        }
      }
    }

    this.gameState.selectedUnit = null;
  }

  public getUnitAt(row: number, col: number): any {
    if (row >= 0 && row < this.config.BOARD_ROWS &&
        col >= 0 && col < this.config.BOARD_COLS) {
      return this.gameState.board[row][col];
    }
    return null;
  }

  public getBoardPositionFromPixels(pixelX: number, pixelY: number): { row: number; col: number } | null {
    const boardStartX = this.gameState.boardOffsetX;
    const boardStartY = this.gameState.boardOffsetY;
    const boardEndX = boardStartX + this.config.BOARD_COLS * this.gameState.cellWidth;
    const boardEndY = boardStartY + this.config.BOARD_ROWS * this.gameState.cellHeight;

    // Check if click is within board bounds
    if (pixelX < boardStartX || pixelX > boardEndX ||
        pixelY < boardStartY || pixelY > boardEndY) {
      return null;
    }

    const col = Math.floor((pixelX - boardStartX) / this.gameState.cellWidth);
    const row = Math.floor((pixelY - boardStartY) / this.gameState.cellHeight);

    return { row, col };
  }

  public pauseGame(): void {
    if (this.gameState.gameStatus === GameStatus.PLAYING) {
      this.gameState.gameStatus = GameStatus.PAUSED;
    }
  }

  public resumeGame(): void {
    if (this.gameState.gameStatus === GameStatus.PAUSED) {
      this.gameState.gameStatus = GameStatus.PLAYING;
    }
  }

  public endGame(): void {
    this.gameState.gameStatus = GameStatus.GAME_OVER;
  }

  public returnToMenu(): void {
    this.gameState.gameStatus = GameStatus.MENU;
    this.deselectAllUnits();
  }

  public switchTurn(): void {
    this.gameState.currentTurn = this.gameState.currentTurn === 1 ? 2 : 1;
    this.deselectAllUnits(); // Deselect units when switching turns
  }

  public getBoardManager(): BoardManager {
    return this.boardManager;
  }
}