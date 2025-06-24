
import type { Unit, AttackResult, BoardPosition } from '../types/GameTypes.js';

export interface AttackStrategy {
    canAttack(attacker: Unit, targetRow: number, targetCol: number, board: (Unit | null)[][]): boolean;
    executeAttack(attacker: Unit, targetRow: number, targetCol: number, board: (Unit | null)[][], boardRows: number, boardCols: number): AttackResult;
    getAttackType(): string;
}