import type {
  BattleModule,
  BattleSetup,
  BattleResult,
  BattleUnit,
  BattleEvent,
  BattleState,
} from "../types/BattleTypes.js";
import type { GameConfig, Unit } from "../types/GameTypes.js";
import { Game } from "../core/Game.js";
import { UnitFactory } from "../utils/UnitFactory.js";

export class BattleManager implements BattleModule {
  private game: Game | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private battleState: BattleState;
  private config: GameConfig;
  private battleEvents: BattleEvent[] = [];
  private isSetup: boolean = false;

  public onBattleEvent?: (event: BattleEvent) => void;
  public onBattleEnd?: (result: BattleResult) => void;

  constructor(canvasId: string, config?: Partial<GameConfig>) {
    // Default battle configuration
    this.config = {
      BOARD_ROWS: 3,
      BOARD_COLS: 4,
      CELL_SIZE: 120,
      UNIT_RADIUS: 35,
      DEFAULT_ATT: 25,
      DEFAULT_LIF: 100,
      ...config,
    };

    this.battleState = {
      isActive: false,
      isPaused: false,
      currentTurn: 1,
      turnNumber: 0,
      units: [],
      events: [],
    };

    // Get canvas element
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }
  }

  public async setupBattle(battleSetup: BattleSetup): Promise<void> {
    if (battleSetup.battlefieldConfig) {
      this.config = { ...this.config, ...battleSetup.battlefieldConfig };
    }

    // Validate battle setup before proceeding
    this.validateBattleSetup(battleSetup);

    // Initialize the game engine
    this.game = new Game(this.config, this.canvas!);
    await this.game.init();

    // Convert BattleUnits to game Units and place them
    this.setupUnitsOnBoard(battleSetup);

    // Setup event listeners
    this.setupEventListeners();

    this.isSetup = true;
    console.log("Battle setup complete");
  }

  private validateBattleSetup(battleSetup: BattleSetup): void {
    const allUnits = [...battleSetup.team1Units, ...battleSetup.team2Units];
    const occupiedPositions = new Set<string>();

    // Check for valid positions and duplicates
    allUnits.forEach((unit) => {
      // Validate unit type exists
      if (!UnitFactory.isValidUnitType(unit.unitTypeId)) {
        throw new Error(`Invalid unit type: ${unit.unitTypeId}`);
      }

      // Validate position is within board bounds
      if (!this.isValidPosition(unit.position.row, unit.position.col)) {
        throw new Error(
          `Unit ${unit.id} has invalid position (${unit.position.row}, ${unit.position.col}). ` +
            `Board size is ${this.config.BOARD_ROWS}x${this.config.BOARD_COLS}`,
        );
      }

      // Check for position conflicts
      const positionKey = `${unit.position.row}-${unit.position.col}`;
      if (occupiedPositions.has(positionKey)) {
        throw new Error(
          `Multiple units are trying to occupy position (${unit.position.row}, ${unit.position.col})`,
        );
      }
      occupiedPositions.add(positionKey);

      // Validate life percentage
      if (unit.lifePercentage < 0 || unit.lifePercentage > 1) {
        throw new Error(
          `Unit ${unit.id} has invalid life percentage: ${unit.lifePercentage}`,
        );
      }

      // Validate stat modifiers if present
      if (unit.statModifiers) {
        if (
          unit.statModifiers.attMultiplier !== undefined &&
          unit.statModifiers.attMultiplier < 0
        ) {
          throw new Error(`Unit ${unit.id} has invalid attack multiplier`);
        }
        if (
          unit.statModifiers.lifMultiplier !== undefined &&
          unit.statModifiers.lifMultiplier < 0
        ) {
          throw new Error(`Unit ${unit.id} has invalid life multiplier`);
        }
      }
    });

    // Ensure both teams have at least one unit
    if (battleSetup.team1Units.length === 0) {
      throw new Error("Team 1 must have at least one unit");
    }
    if (battleSetup.team2Units.length === 0) {
      throw new Error("Team 2 must have at least one unit");
    }

    console.log(
      `Battle validation passed: ${allUnits.length} units positioned`,
    );
  }

  private setupUnitsOnBoard(battleSetup: BattleSetup): void {
    const gameStateManager = this.game!.getGameState();
    const board = gameStateManager.gameState.board;

    // Clear the board first
    for (let row = 0; row < this.config.BOARD_ROWS; row++) {
      for (let col = 0; col < this.config.BOARD_COLS; col++) {
        board[row][col] = null;
      }
    }

    // Place all units according to their specified positions
    const allUnits = [...battleSetup.team1Units, ...battleSetup.team2Units];

    allUnits.forEach((battleUnit) => {
      const unit = UnitFactory.createUnitFromBattleUnit(battleUnit);
      board[battleUnit.position.row][battleUnit.position.col] = unit;
      this.battleState.units.push(battleUnit);

      const unitConfig = UnitFactory.getUnitConfig(battleUnit.unitTypeId);
      console.log(
        `Placed ${unitConfig?.name || battleUnit.unitTypeId} (${battleUnit.id}) ` +
          `at position (${battleUnit.position.row}, ${battleUnit.position.col}) ` +
          `with ${Math.round(battleUnit.lifePercentage * 100)}% health`,
      );
    });
  }

  private isValidPosition(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < this.config.BOARD_ROWS &&
      col >= 0 &&
      col < this.config.BOARD_COLS
    );
  }

  // ... rest of the methods remain the same as before, but update convertGameUnitToBattleUnit:

  private convertGameUnitToBattleUnit(unit: Unit): BattleUnit {
    return UnitFactory.createBattleUnitFromUnit(
      unit,
      `${unit.team}-${unit.row}-${unit.col}`,
    );
  }

  // ... rest of the methods remain unchanged from previous implementation

  private setupEventListeners(): void {
    if (this.game) {
      this.game.onGameEvent = (gameEvent: any) => {
        const battleEvent = this.convertGameEventToBattleEvent(gameEvent);
        this.addBattleEvent(battleEvent);
      };

      this.game.onGameEnd = () => {
        this.handleBattleEnd();
      };
    }
  }

  private convertGameEventToBattleEvent(gameEvent: any): BattleEvent {
    return {
      turn: this.battleState.turnNumber,
      type: gameEvent.type,
      actorId: gameEvent.actorId || "unknown",
      targetIds: gameEvent.targetIds,
      damage: gameEvent.damage,
      healing: gameEvent.healing,
      message: gameEvent.message || "Battle event occurred",
      timestamp: Date.now(),
    };
  }

  private addBattleEvent(event: BattleEvent): void {
    this.battleEvents.push(event);
    this.battleState.events = this.battleEvents;

    if (this.onBattleEvent) {
      this.onBattleEvent(event);
    }
  }

  public async startBattle(): Promise<BattleResult> {
    if (!this.isSetup || !this.game) {
      throw new Error("Battle not properly setup");
    }

    this.battleState.isActive = true;
    this.battleState.turnNumber = 1;

    this.addBattleEvent({
      turn: 0,
      type: "battle_start",
      actorId: "system",
      message: "Battle has begun!",
      timestamp: Date.now(),
    });

    this.game.startGame();

    return new Promise((resolve) => {
      this.onBattleEnd = (result: BattleResult) => {
        resolve(result);
      };
    });
  }

  private handleBattleEnd(): void {
    this.battleState.isActive = false;
    const result = this.generateBattleResult();

    this.addBattleEvent({
      turn: this.battleState.turnNumber,
      type: "battle_end",
      actorId: "system",
      message: `Battle ended! Winner: ${result.winner}`,
      timestamp: Date.now(),
    });

    if (this.onBattleEnd) {
      this.onBattleEnd(result);
    }
  }

  private generateBattleResult(): BattleResult {
    const gameStateManager = this.game!.getGameState();
    const board = gameStateManager.gameState.board;
    const alive: { team1: BattleUnit[]; team2: BattleUnit[] } = {
      team1: [],
      team2: [],
    };
    const dead: { team1: BattleUnit[]; team2: BattleUnit[] } = {
      team1: [],
      team2: [],
    };
    const damage = { team1: 0, team2: 0 };

    for (let row = 0; row < this.config.BOARD_ROWS; row++) {
      for (let col = 0; col < this.config.BOARD_COLS; col++) {
        const unit = board[row][col];
        if (unit) {
          const battleUnit = this.convertGameUnitToBattleUnit(unit);
          if (unit.isAlive) {
            if (unit.team === 1) alive.team1.push(battleUnit);
            else alive.team2.push(battleUnit);
          } else {
            if (unit.team === 1) dead.team1.push(battleUnit);
            else dead.team2.push(battleUnit);
          }
        }
      }
    }

    this.battleEvents.forEach((event) => {
      if (event.damage && event.actorId) {
        const unit = this.findUnitById(event.actorId);
        if (unit) {
          if (unit.team === 1) damage.team1 += event.damage;
          else damage.team2 += event.damage;
        }
      }
    });

    let winner: 1 | 2 | "draw";
    if (alive.team1.length > 0 && alive.team2.length === 0) winner = 1;
    else if (alive.team2.length > 0 && alive.team1.length === 0) winner = 2;
    else winner = "draw";

    return {
      winner,
      battleEnded: true,
      survivingUnits: alive,
      casualties: dead,
      totalDamageDealt: damage,
      turnsElapsed: this.battleState.turnNumber,
      battleLog: this.battleEvents,
    };
  }

  private findUnitById(id: string): BattleUnit | null {
    return this.battleState.units.find((unit) => unit.id === id) || null;
  }

  public pauseBattle(): void {
    this.battleState.isPaused = true;
    if (this.game) {
      this.game.pauseGame();
    }
  }

  public resumeBattle(): void {
    this.battleState.isPaused = false;
    if (this.game) {
      this.game.resumeGame();
    }
  }

  public endBattle(): BattleResult {
    if (this.game) {
      this.game.endGame();
    }
    return this.generateBattleResult();
  }

  public getCurrentState(): BattleState {
    return { ...this.battleState };
  }
}
