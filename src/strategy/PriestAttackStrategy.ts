
import type { Unit, AttackResult, AttackTarget } from '../types/GameTypes.js';
import type { AttackStrategy } from './AttackStrategy.js';

export class PriestAttackStrategy implements AttackStrategy {
    public canAttack(attacker: Unit, targetRow: number, targetCol: number, board: (Unit | null)[][]): boolean {
        const target = board[targetRow][targetCol];
        return target !== null &&
            target.isAlive &&
            target.team === attacker.team && // Priest can only target friendly units
            attacker.isAlive &&
            !attacker.hasActed &&
            target.lif < target.maxLif; // Only heal if target is damaged
    }

    public executeAttack(attacker: Unit, targetRow: number, targetCol: number, board: (Unit | null)[][], boardRows: number, boardCols: number): AttackResult {
        if (!this.canAttack(attacker, targetRow, targetCol, board)) {
            return {
                success: false,
                targets: [],
                totalDamage: 0,
                targetsKilled: 0,
                healingDone: 0,
                message: "Cannot heal this target"
            };
        }

        const target = board[targetRow][targetCol]!;
        const healAmount = attacker.att; // Use attack stat as heal amount
        const oldLife = target.lif;

        // Apply healing
        target.lif = Math.min(target.lif + healAmount, target.maxLif);
        const actualHealing = target.lif - oldLife;

        // Mark attacker as having acted
        attacker.hasActed = true;
        attacker.isSelected = false;

        return {
            success: true,
            targets: [{ unit: target, row: targetRow, col: targetCol }],
            totalDamage: 0,
            targetsKilled: 0,
            healingDone: actualHealing,
            message: `Priest heals ${actualHealing} health`
        };
    }

    public getAttackType(): string {
        return "Healing";
    }
}