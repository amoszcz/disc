import type {
  GameState,
  GameConfig,
  AttackResult,
  Unit,
} from "../types/GameTypes.js";
import { GameStatus } from "../types/GameTypes.js";
import { BoardManager } from "./Board.js";

export class GameStateManager {
  private config: GameConfig;
  private readonly boardManager: BoardManager;
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
      selectedUnit: null,
      availableTargets: [], // Initialize empty targets
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
    this.gameState.availableTargets = [];
    this.gameState.board = this.boardManager.initializeBoard();

    this.markInactiveUnitsWhenNoTargets();
  }

  public selectUnit(row: number, col: number): boolean {
    const unit = this.gameState.board[row][col];
    const unitManager = this.boardManager.getUnitManager();

    if (!unit || !unitManager.canSelectUnit(unit, this.gameState.currentTurn)) {
      return false;
    }

    this.deselectAllUnits();
    unitManager.selectUnit(unit);
    this.gameState.selectedUnit = unit;

    // Update available targets when a unit is selected
    this.updateAvailableTargets();

    return true;
  }

  private updateAvailableTargets(): void {
    if (this.gameState.selectedUnit) {
      const unitManager = this.boardManager.getUnitManager();
      this.gameState.availableTargets = unitManager.getAvailableTargets(
        this.gameState.selectedUnit,
        this.gameState.board,
        this.config.BOARD_ROWS,
        this.config.BOARD_COLS,
      );
    } else {
      this.gameState.availableTargets = [];
    }
  }

  public attemptAttack(
    targetRow: number,
    targetCol: number,
  ): AttackResult | null {
    if (!this.gameState.selectedUnit) {
      return null;
    }

    const unitManager = this.boardManager.getUnitManager();

    if (
      !unitManager.canAttackTarget(
        this.gameState.selectedUnit,
        targetRow,
        targetCol,
        this.gameState.board,
      )
    ) {
      return {
        success: false,
        targets: [],
        totalDamage: 0,
        targetsKilled: 0,
        attacker: this.gameState.selectedUnit,
        healingDone: 0,
        message: "Cannot target this unit",
      };
    }

    const result = unitManager.performAttack(
      this.gameState.selectedUnit,
      targetRow,
      targetCol,
      this.gameState.board,
      this.config.BOARD_ROWS,
      this.config.BOARD_COLS,
    );

    if (result.success) {
      result.targets.forEach((target) => {
        unitManager.damageUnit(
          target.unit,
          result.attacker.att,
          result.attacker,
        );
      });
      this.gameState.selectedUnit = null;
      this.gameState.availableTargets = []; // Clear targets after attack

      this.checkGameOver();
      this.checkAutoEndTurn();
    }

    return result;
  }

  private checkGameOver(): void {
    const aliveTeams = this.getAliveTeams();

    if (aliveTeams.team1 === 0) {
      this.gameState.gameStatus = GameStatus.GAME_OVER;
    } else if (aliveTeams.team2 === 0) {
      this.gameState.gameStatus = GameStatus.GAME_OVER;
    }
  }

  private checkAutoEndTurn(): void {
    const unitManager = this.boardManager.getUnitManager();
    const activeUnits = unitManager.getAllActiveUnits(
      this.gameState.board,
      this.gameState.currentTurn,
      this.config.BOARD_ROWS,
      this.config.BOARD_COLS,
    );

    if (activeUnits.length === 0) {
      setTimeout(() => {
        this.switchTurn();
      }, 1000);
    }
  }

  public getAliveTeams(): { team1: number; team2: number } {
    return this.boardManager.countAliveUnits(this.gameState.board);
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
    this.gameState.availableTargets = []; // Clear targets when deselecting
  }

  public getUnitAt(row: number, col: number): Unit | null {
    if (
      row >= 0 &&
      row < this.config.BOARD_ROWS &&
      col >= 0 &&
      col < this.config.BOARD_COLS
    ) {
      return this.gameState.board[row][col];
    }
    return null;
  }

  public getBoardPositionFromPixels(
    pixelX: number,
    pixelY: number,
  ): { row: number; col: number } | null {
    const boardStartX = this.gameState.boardOffsetX;
    const boardStartY = this.gameState.boardOffsetY;
    const boardEndX =
      boardStartX + this.config.BOARD_COLS * this.gameState.cellWidth;
    const boardEndY =
      boardStartY + this.config.BOARD_ROWS * this.gameState.cellHeight;

    if (
      pixelX < boardStartX ||
      pixelX > boardEndX ||
      pixelY < boardStartY ||
      pixelY > boardEndY
    ) {
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

  public returnToMenu(): void {
    this.gameState.gameStatus = GameStatus.MENU;
    this.deselectAllUnits();
  }

  public switchTurn(): void {
    this.gameState.currentTurn = this.gameState.currentTurn === 1 ? 2 : 1;
    this.deselectAllUnits();
    this.resetAllUnits();
    this.markInactiveUnitsWhenNoTargets();
  }

  private markInactiveUnitsWhenNoTargets(): void {
    const unitManager = this.boardManager.getUnitManager();
    for (let row = 0; row < this.config.BOARD_ROWS; row++) {
      for (let col = 0; col < this.config.BOARD_COLS; col++) {
        const unit = this.gameState.board[row][col];
        if (unit && unit.team === this.gameState.currentTurn) {
          // Check if the unit has any valid targets
          const availableTargets = unitManager.getAvailableTargets(
            unit,
            this.gameState.board,
            this.config.BOARD_ROWS,
            this.config.BOARD_COLS,
          );

          // If no valid targets, mark the unit as inactive
          if (availableTargets.length === 0) {
            unit.hasActed = true;
          }
        }
      }
    }
  }

  private resetAllUnits(): void {
    const unitManager = this.boardManager.getUnitManager();
    for (let row = 0; row < this.config.BOARD_ROWS; row++) {
      for (let col = 0; col < this.config.BOARD_COLS; col++) {
        const unit = this.gameState.board[row][col];
        if (unit) {
          unitManager.resetUnitActivity(unit);
        }
      }
    }
  }

  public getBoardManager(): BoardManager {
    return this.boardManager;
  }
}
