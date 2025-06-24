import type { GameState, GameConfig } from '../types/GameTypes.js';
import  {  GameStatus } from '../types/GameTypes.js';
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
      currentTurn: 1
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
    // Reinitialize the board for a fresh game
    this.gameState.board = this.boardManager.initializeBoard();
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
  }

  public switchTurn(): void {
    this.gameState.currentTurn = this.gameState.currentTurn === 1 ? 2 : 1;
  }

  public getBoardManager(): BoardManager {
    return this.boardManager;
  }
}