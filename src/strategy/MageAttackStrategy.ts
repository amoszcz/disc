import type { Unit, AttackResult, AttackTarget } from '../types/GameTypes.js';
import type { AttackStrategy } from './AttackStrategy.js';

export class MageAttackStrategy implements AttackStrategy {
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

        const damage = attacker.att;
        const targets: AttackTarget[] = [];
        let totalDamage = 0;
        let targetsKilled = 0;

        // Get all units in the same column (column blast)
        for (let row = 0; row < boardRows; row++) {
            const unit = board[row][targetCol];
            if (unit && unit.isAlive && unit.team !== attacker.team) {
                // Apply damage
                unit.lif -= damage;
                totalDamage += damage;

                if (unit.lif <= 0) {
                    unit.lif = 0;
                    unit.isAlive = false;
                    unit.isSelected = false;
                    unit.hasActed = true;
                    targetsKilled++;
                }

                targets.push({ unit, row, col: targetCol });
            }
        }

        // Mark attacker as having acted
        attacker.hasActed = true;
        attacker.isSelected = false;

        return {
            success: true,
            targets,
            totalDamage,
            targetsKilled,
            healingDone: 0,
            message: `Mage column blast deals ${totalDamage} total damage to ${targets.length} targets${targetsKilled > 0 ? ` - ${targetsKilled} eliminated!` : ''}`
        };
    }

    public getAttackType(): string {
        return "Column Blast";
    }
}