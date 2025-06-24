import type { Unit, AttackResult, AttackTarget } from '../types/GameTypes.js';
import type { AttackStrategy } from './AttackStrategy.js';

export class ArcherAttackStrategy implements AttackStrategy {
    public canAttack(attacker: Unit, targetRow: number, targetCol: number, board: (Unit | null)[][]): boolean {
        const target = board[targetRow][targetCol];
        return target !== null &&
            target.isAlive &&
            target.team !== attacker.team &&
            attacker.isAlive &&
            !attacker.hasActed;
    }

    public executeAttack(attacker: Unit, targetRow: number, targetCol: number, board: (Unit | null)[][], boardRows: number, boardCols: number): AttackResult {
        if (!this.canAttack(attacker, targetRow, targetCol, board)) {
            return {
                success: false,
                targets: [],
                totalDamage: 0,
                targetsKilled: 0,
                healingDone: 0,
                message: "Cannot attack this target"
            };
        }

        const target = board[targetRow][targetCol]!;
        const damage = attacker.att;

        // Apply damage
        target.lif -= damage;
        let targetKilled = false;

        if (target.lif <= 0) {
            target.lif = 0;
            target.isAlive = false;
            target.isSelected = false;
            target.hasActed = true;
            targetKilled = true;
        }

        // Mark attacker as having acted
        attacker.hasActed = true;
        attacker.isSelected = false;

        return {
            success: true,
            targets: [{ unit: target, row: targetRow, col: targetCol }],
            totalDamage: damage,
            targetsKilled: targetKilled ? 1 : 0,
            healingDone: 0,
            message: `Archer deals ${damage} damage${targetKilled ? ' - Target eliminated!' : ''}`
        };
    }

    public getAttackType(): string {
        return "Single Target";
    }
}