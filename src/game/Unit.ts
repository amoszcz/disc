import {
  Unit,
  AttackResult,
  UnitType,
  GameConfig,
  BoardPosition,
} from "../types/GameTypes.js";
import { AttackStrategyFactory } from "../strategy/AttackStrategyFactory.js";

export class UnitManager {
  private config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }
  public createUnit(
    team: 1 | 2,
    row: number,
    col: number,
    type?: UnitType,
  ): Unit {
    // Assign unit types in a pattern if not specified
    let unitType = type;
    if (!unitType) {
      const typeIndex = (row + col) % 4;
      unitType = [
        UnitType.ARCHER,
        UnitType.MAGE,
        UnitType.PRIEST,
        UnitType.KNIGHT,
      ][typeIndex];
    }

    return {
      team: team,
      row: row,
      col: col,
      att: this.config.DEFAULT_ATT,
      lif: this.config.DEFAULT_LIF,
      maxLif: this.config.DEFAULT_LIF,
      isAlive: true,
      isSelected: false,
      hasActed: false,
      receivedDamageFrom: null,
      type: unitType,
    };
  }
  public damageUnit(unit: Unit, damage: number, attacker: Unit): void {
    unit.receivedDamageFrom = attacker; // Set the attacker reference
    this.updateUnitStatus(unit);

    // Clear the damage flag after a delay
    setTimeout(() => {
      if (unit.isAlive) {
        unit.receivedDamageFrom = null;
      }
    }, 500); // Adjust timing as needed
  }
  public healUnit(unit: Unit, healAmount: number): void {
    unit.lif = Math.min(unit.lif + healAmount, unit.maxLif);
  }

  public updateUnitStatus(unit: Unit): void {
    if (unit.lif <= 0) {
      unit.isAlive = false;
      unit.lif = 0;
      unit.isSelected = false;
      unit.hasActed = true;
    }
  }

  public getHealthPercentage(unit: Unit): number {
    return unit.lif / unit.maxLif;
  }

  public isUnitAlive(unit: Unit | null): unit is Unit {
    return unit !== null && unit.isAlive;
  }

  public selectUnit(unit: Unit): void {
    unit.isSelected = true;
  }

  public deselectUnit(unit: Unit): void {
    unit.isSelected = false;
  }

  public canSelectUnit(unit: Unit, currentTeam: 1 | 2): boolean {
    return unit.isAlive && unit.team === currentTeam && !unit.hasActed;
  }

  public canAttackTarget(
    attacker: Unit,
    targetRow: number,
    targetCol: number,
    board: (Unit | null)[][],
  ): boolean {
      if (!attacker.attackStrategyId) return false;
    const strategy = AttackStrategyFactory.getStrategy(
      attacker.attackStrategyId,
    );
    return strategy.canAttack(attacker, targetRow, targetCol, board);
  }

  public performAttack(
    attacker: Unit,
    targetRow: number,
    targetCol: number,
    board: (Unit | null)[][],
    boardRows: number,
    boardCols: number,
  ): AttackResult {
    const strategy = AttackStrategyFactory.getStrategy(
      attacker.attackStrategyId,
    );
    return strategy.executeAttack(
      attacker,
      targetRow,
      targetCol,
      board,
      boardRows,
      boardCols,
    );
  }
  public resetUnitActivity(unit: Unit): void {
    if (unit.isAlive) {
      unit.hasActed = false;
    }
  }
  public isUnitActive(unit: Unit): boolean {
    return unit.isAlive && !unit.hasActed;
  }

  // public damageUnit(target: Unit, damage: number, attacker: Unit): void {
  //   target.lif -= damage;
  //   target.receivedDamageFrom = attacker;
  //
  //   if (target.lif <= 0) {
  //     target.lif = 0;
  //     target.isAlive = false;
  //     target.isSelected = false;
  //     target.hasActed = true;
  //   }
  // }
  //
  // public healUnit(target: Unit, healAmount: number): void {
  //   if (target.isAlive) {
  //     target.lif = Math.min(target.maxLif, target.lif + healAmount);
  //   }
  // }

  public resetUnitsForTurn(board: (Unit | null)[][], team: 1 | 2): void {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const unit = board[row][col];
        if (unit && unit.team === team && unit.isAlive) {
          unit.hasActed = false;
          unit.isSelected = false;
          unit.receivedDamageFrom = null;
        }
      }
    }
  }
  public getAllActiveUnits(
    board: (Unit | null)[][],
    team: 1 | 2,
    boardRows: number,
    boardCols: number,
  ): Unit[] {
    const activeUnits: Unit[] = [];

    for (let row = 0; row < boardRows; row++) {
      for (let col = 0; col < boardCols; col++) {
        const unit = board[row][col];
        if (unit && unit.team === team && this.isUnitActive(unit)) {
          activeUnits.push(unit);
        }
      }
    }

    return activeUnits;
  }
  public hasActiveUnits(board: (Unit | null)[][], team: 1 | 2): boolean {
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const unit = board[row][col];
        if (unit && unit.team === team && unit.isAlive && !unit.hasActed) {
          return true;
        }
      }
    }
    return false;
  }

  public getAliveUnits(board: (Unit | null)[][], team: 1 | 2): Unit[] {
    const units: Unit[] = [];
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const unit = board[row][col];
        if (unit && unit.team === team && unit.isAlive) {
          units.push(unit);
        }
      }
    }
    return units;
  }

  public getAvailableTargets(
    attacker: Unit,
    board: (Unit | null)[][],
    boardRows: number,
    boardCols: number,
  ): BoardPosition[] {
    const targets: BoardPosition[] = [];

    for (let row = 0; row < boardRows; row++) {
      for (let col = 0; col < boardCols; col++) {
        if (this.canAttackTarget(attacker, row, col, board)) {
          targets.push({ row, col });
        }
      }
    }

    return targets;
  }
}
