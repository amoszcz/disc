import {
  AttackResult,
  GameConfig,
  GameState,
  GameStatus,
  Unit,
} from "../types/GameTypes.js";
import { BoardManager } from "./Board.js";
type GameStatusChangeHandler = (gameStatus: GameStatus) => void;
import { DefaultScheduler, type Scheduler } from "../utils/Scheduler.js";
import { StatusStateMachine } from "../core/domain/StatusStateMachine.js";
import { appEventBus } from "../utils/EventBus.js";
import { EntityIndex } from "../core/app/EntityIndex.js";
import type { GameCommand } from "../core/domain/Commands.js";
import { applyCommand as applyGameCommand } from "../core/domain/Commands.js";
export class GameStateManager {
  private config: GameConfig;
  private readonly boardManager: BoardManager;
  public gameState: GameState;
  private _gameStatus: GameStatus = GameStatus.MENU;
  private gameStatusChangeHandlers = new Array<GameStatusChangeHandler>();
  private scheduler: Scheduler;
  private statusMachine: StatusStateMachine = new StatusStateMachine();
  private entityIndex: EntityIndex = new EntityIndex();

  get gameStatus() {
    return this._gameStatus;
  }
  set gameStatus(gameStatus: GameStatus) {
    if (!this.statusMachine.canTransition(this._gameStatus, gameStatus)) {
      console.warn(
        `Invalid status transition from ${this._gameStatus} to ${gameStatus}. Proceeding anyway.`,
      );
    }
    this._gameStatus = gameStatus;
    this.gameStatusChangeHandlers.forEach((handler) => handler(gameStatus));
    try {
      appEventBus.emit("gameStatusChanged", gameStatus as any);
    } catch {}
  }
  constructor(config: GameConfig, scheduler: Scheduler = new DefaultScheduler()) {
    this.config = config;
    this.boardManager = new BoardManager(config);
    this.scheduler = scheduler;

    this.gameState = {
      board: this.boardManager.initializeBoard(),
      cellWidth: config.CELL_SIZE,
      cellHeight: config.CELL_SIZE,
      boardOffsetX: 0,
      boardOffsetY: 0,
      currentTurn: 1,
      selectedUnit: null,
      availableTargets: [], // Initialize empty targets
    };
    // Build initial entity index from the empty board
    this.entityIndex.rebuild(this.gameState.board);
  }
  public addOnGameStatusChanged(handler: GameStatusChangeHandler): void {
    this.gameStatusChangeHandlers.push(handler);
  }
  public removeOnGameStatusChanged(handler: GameStatusChangeHandler): void {
    this.gameStatusChangeHandlers.splice(
      this.gameStatusChangeHandlers.indexOf(handler),
      1,
    );
  }
  public calculateBoardLayout(canvasWidth: number, canvasHeight: number): void {
    const boardWidth = this.config.BOARD_COLS * this.config.CELL_SIZE;
    const boardHeight = this.config.BOARD_ROWS * this.config.CELL_SIZE;

    this.gameState.cellWidth = this.config.CELL_SIZE;
    this.gameState.cellHeight = this.config.CELL_SIZE;
    this.gameState.boardOffsetX = (canvasWidth - boardWidth) / 2;
    this.gameState.boardOffsetY = (canvasHeight - boardHeight) / 2;
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

      // Keep the entity index in sync
      this.rebuildEntityIndex();

      this.checkGameOver();
      this.checkAutoEndTurn();
    }

    return result;
  }

  private checkGameOver(): void {
    const aliveTeams = this.getAliveTeams();

    if (aliveTeams.team1 === 0) {
      this.gameStatus = GameStatus.GAME_OVER;
    } else if (aliveTeams.team2 === 0) {
      this.gameStatus = GameStatus.GAME_OVER;
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
      this.scheduler.delay(1000, () => {
        this.switchTurn();
      });
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
    if (this.gameStatus === GameStatus.PLAYING) {
      this.gameStatus = GameStatus.PAUSED;
    }
  }

  public resumeGame(): void {
    if (this.gameStatus === GameStatus.PAUSED) {
      this.gameStatus = GameStatus.PLAYING;
    }
  }

  public returnToMenu(): void {
    this.gameStatus = GameStatus.MENU;
    this.deselectAllUnits();
  }

  public switchTurn(): void {
    this.gameState.currentTurn = this.gameState.currentTurn === 1 ? 2 : 1;
    this.deselectAllUnits();
    this.resetAllUnits();
    this.markInactiveUnitsWhenNoTargets();
    // Keep the entity index in sync when turn changes
    this.rebuildEntityIndex();
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

  public rebuildEntityIndex(): void {
    this.entityIndex.rebuild(this.gameState.board);
  }

  public getEntityIndex(): EntityIndex {
    return this.entityIndex;
  }

  public applyCommand(cmd: GameCommand): any {
    return applyGameCommand(this, cmd);
  }
}
