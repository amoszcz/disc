import type { Unit, AttackResult, AttackTarget } from "../types/GameTypes.js";
import type { AttackStrategy } from "./AttackStrategy.js";

export class KnightAttackStrategy implements AttackStrategy {
  public canAttack(
    attacker: Unit,
    targetRow: number,
    targetCol: number,
    board: (Unit | null)[][],
  ): boolean {
    const target = board[targetRow][targetCol];

    // Basic validation
    if (
      !target ||
      !target.isAlive ||
      target.team === attacker.team ||
      !attacker.isAlive ||
      attacker.hasActed
    ) {
      return false;
    }

    // Knight can only attack targets in the same row (melee combat)
    if (attacker.row !== targetRow) {
      return false;
    }

    // Knight can only attack in specific columns based on team positioning
    const canAttackInColumn = this.isValidAttackColumn(attacker, targetCol);
    if (!canAttackInColumn) {
      return false;
    }

    // Check if knight is in the right position to attack that column
    return this.isKnightInAttackPosition(attacker, targetCol);
  }

  private isValidAttackColumn(attacker: Unit, targetCol: number): boolean {
    if (attacker.team === 1) {
      // Team 1 knights can only attack in column 2 (enemy front line)
      return targetCol === 2;
    } else {
      // Team 2 knights can only attack in column 1 (enemy front line)
      return targetCol === 1;
    }
  }

  private isKnightInAttackPosition(attacker: Unit, targetCol: number): boolean {
    if (attacker.team === 1) {
      // Team 1 knight must be in column 1 to attack column 2
      return attacker.col === 1 && targetCol === 2;
    } else {
      // Team 2 knight must be in column 2 to attack column 1
      return attacker.col === 2 && targetCol === 1;
    }
  }

  public executeAttack(
    attacker: Unit,
    targetRow: number,
    targetCol: number,
    board: (Unit | null)[][],
    boardRows: number,
    boardCols: number,
  ): AttackResult {
    if (!this.canAttack(attacker, targetRow, targetCol, board)) {
      return {
        success: false,
        targets: [],
        totalDamage: 0,
        targetsKilled: 0,
        healingDone: 0,
        message: `Knight cannot reach target! Must be adjacent to enemy front line.`,
      };
    }

    const target = board[targetRow][targetCol]!;
    const damage = attacker.att;

    // Knight does extra damage in melee combat
    const knightDamage = Math.floor(damage * 1.2); // 20% bonus for melee combat

    const targetsBefore = target.lif;
    target.lif -= knightDamage;

    let targetsKilled = 0;
    if (target.lif <= 0) {
      target.lif = 0;
      target.isAlive = false;
      target.isSelected = false;
      target.hasActed = true;
      targetsKilled = 1;
    }

    // Mark attacker as having acted
    attacker.hasActed = true;

    const attackTarget: AttackTarget = {
      unit: target,
      row: targetRow,
      col: targetCol,
    };

    let message = `Knight charges forward dealing ${knightDamage} melee damage!`;
    if (targetsKilled > 0) {
      message += ` ${target.type} defeated!`;
    }

    return {
      success: true,
      targets: [attackTarget],
      totalDamage: knightDamage,
      attacker,
      targetsKilled: targetsKilled,
      healingDone: 0,
      message: message,
    };
  }

  public getAttackType(): string {
    return "Melee Charge";
  }
}
