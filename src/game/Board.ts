import type { Unit, GameConfig } from "../types/GameTypes.js";
import { UnitManager } from "./Unit.js";
import { TeamCount } from "../types/BattleTypes";

export class BoardManager {
  private config: GameConfig;
  private readonly unitManager: UnitManager;

  constructor(config: GameConfig) {
    this.config = config;
    this.unitManager = new UnitManager(config);
  }

  public initializeBoard(): (Unit | null)[][] {
    const board: (Unit | null)[][] = [];

    for (let row = 0; row < this.config.BOARD_ROWS; row++) {
      board[row] = [];
      for (let col = 0; col < this.config.BOARD_COLS; col++) {
        // the Left side (columns 0-1) is team 1, the right side (columns 2-3) is team 2
        if (col < 2) {
          board[row][col] = this.unitManager.createUnit(1, row, col);
        } else {
          board[row][col] = this.unitManager.createUnit(2, row, col);
        }
      }
    }

    return board;
  }

  public countAliveUnits(board: (Unit | null)[][]): TeamCount {
    let team1Count = 0;
    let team2Count = 0;

    for (let row = 0; row < this.config.BOARD_ROWS; row++) {
      for (let col = 0; col < this.config.BOARD_COLS; col++) {
        const unit = board[row][col];
        if (unit && unit.isAlive) {
          if (unit.team === 1) team1Count++;
          else team2Count++;
        }
      }
    }

    return { team1: team1Count, team2: team2Count };
  }

  public getUnitManager(): UnitManager {
    return this.unitManager;
  }
}
